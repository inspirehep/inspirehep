import structlog
from celery import shared_task
from flask import current_app
from inspire_dojson.utils import get_recid_from_ref
from inspire_matcher.api import match
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema
from inspirehep.disambiguation.utils import (
    create_new_stub_author,
    reorder_lit_author_names,
)
from inspirehep.editor.editor_soft_lock import EditorSoftLock
from inspirehep.errors import DB_TASK_EXCEPTIONS, ES_TASK_EXCEPTIONS
from inspirehep.matcher.validators import (
    affiliations_validator,
    collaboration_validator,
)
from inspirehep.records.api.authors import AuthorsRecord
from inspirehep.records.api.base import InspireRecord
from invenio_db import db
from sqlalchemy.orm.exc import StaleDataError

LOGGER = structlog.getLogger()


def match_literature_author_with_config(author_data, matcher_config):
    matched_records = [
        matched_record
        for matched_record in match(author_data, matcher_config)
        if get_value(
            matched_record, "inner_hits.authors.hits.hits[0]._source.record.$ref"
        )
    ]
    return matched_records


def get_reference_if_unambiguous_match(matched_refs):
    return matched_refs.pop() if len(matched_refs) == 1 else None


def get_author_references_for_literature_author_match(matched_records):
    matched_refs = {
        get_value(matched_author, "inner_hits.authors.hits.hits[0]._source.record.$ref")
        for matched_author in matched_records
    }
    return matched_refs


def _filter_out_initials(name):
    name_splitted = name.split(" ")
    names_without_initals = [
        token for token in name_splitted if len(token) > 1 and not token.endswith(".")
    ]
    return " ".join(names_without_initals)


def match_literature_author(author, record):
    configs = [
        current_app.config["AUTHOR_MATCHER_NAME_CONFIG"],
        current_app.config["AUTHOR_MATCHER_NAME_INITIALS_CONFIG"],
    ]

    validators = [(collaboration_validator, affiliations_validator), None]

    parsed_name = ParsedName.loads(author.get("full_name"))
    author_matcher_data = {
        "first_name": _filter_out_initials(parsed_name.first),
        "first_name_with_initials": parsed_name.first,
        "last_name": parsed_name.last,
        "full_name": author.get("full_name"),
        "collaborations": get_value(record, "collaborations.value", []),
        "affiliations": get_value(author, "affiliations.value", []),
    }
    matched_authors_references = []

    for config, validator in zip(configs, validators, strict=False):
        matched_records = match_literature_author_with_config(
            author_matcher_data, config
        )
        matched_refs = get_author_references_for_literature_author_match(
            matched_records
        )
        matched_author_reference = get_reference_if_unambiguous_match(matched_refs)

        if matched_author_reference:
            break

        matched_authors_references.extend(matched_refs)
        if validator:
            for validator_function in validator:
                valid_matches = (
                    match
                    for match in matched_records
                    if validator_function(author_matcher_data, match)
                )
                matched_refs = get_author_references_for_literature_author_match(
                    valid_matches
                )
                matched_author_reference = get_reference_if_unambiguous_match(
                    matched_refs
                )
                if matched_author_reference:
                    return matched_author_reference, matched_authors_references

                matched_authors_references.extend(matched_refs)

    return matched_author_reference, matched_authors_references


def create_new_author(full_name, from_recid, orcids):
    new_author_data = {
        "name": {"value": full_name},
        "_private_notes": [
            {
                "source": "INSPIRE-disambiguation",
                "value": f"Created from literature record {from_recid}",
            }
        ],
    }
    if orcids:
        new_author_data["ids"] = [{"value": orcids[0], "schema": "ORCID"}]

    new_author = create_new_stub_author(**new_author_data)
    LOGGER.info(
        "Created new author record",
        {
            "control_number": str(new_author.get("control_number")),
            "full_name": full_name,
        },
    )
    return new_author


def match_author(author):
    matched_authors = match(author, current_app.config["AUTHOR_MATCHER_EXACT_CONFIG"])
    matched_refs = {
        matched_author["_source"]["self"]["$ref"] for matched_author in matched_authors
    }
    matched_author_reference = get_reference_if_unambiguous_match(matched_refs)
    return matched_author_reference, matched_refs


def _get_not_disambiguated_authors(authors):
    for author in authors:
        if "record" not in author:
            yield author


def find_stub_author_in_matched_authors(matched_authors_references):
    matched_authors_pids = [
        ("aut", str(author_reference.split("/")[-1]))
        for author_reference in matched_authors_references
    ]
    stub_authors_for_matched_author_references = AuthorsRecord.get_stub_authors_by_pids(
        matched_authors_pids
    )
    try:
        author = next(stub_authors_for_matched_author_references)
        return author["self"]["$ref"]
    except StopIteration:
        return


def _disambiguate_authors(authors_to_disambiguate, record):
    updated_authors = []
    for author in authors_to_disambiguate:
        if author.get("curated_relation"):
            continue
        assigned_author_recid = None
        (
            matched_author_reference,
            matched_authors_references_author_match,
        ) = match_author(author)
        if not matched_author_reference:
            (
                matched_author_reference,
                matched_authors_references_literature_author_match,
            ) = match_literature_author(author, record)
        if not matched_author_reference:
            matched_authors_references = {
                *matched_authors_references_author_match,
                *matched_authors_references_literature_author_match,
            }
            matched_author_reference = find_stub_author_in_matched_authors(
                matched_authors_references
            )
        if matched_author_reference:
            author["record"] = {"$ref": matched_author_reference}
            assigned_author_recid = get_recid_from_ref(author["record"])
        elif "record" not in author:
            linked_author_record = create_new_author(
                author["full_name"],
                record["control_number"],
                get_values_for_schema(author.get("ids", []), "ORCID"),
            )
            author["record"] = linked_author_record["self"]
            assigned_author_recid = linked_author_record["control_number"]
        if assigned_author_recid:
            if len(author["full_name"].split(",")[0].split(" ")) == 1:
                if matched_author_reference:
                    linked_author_record = AuthorsRecord.get_record_by_pid_value(
                        assigned_author_recid
                    )
                author["full_name"] = reorder_lit_author_names(
                    author["full_name"], linked_author_record["name"]["value"]
                )
            updated_authors.append(assigned_author_recid)
    return updated_authors


@shared_task(
    ignore_result=False,
    bind=True,
    retry_backoff=True,
    queue="disambiguation",
    max_retries=6,
    autoretry_for=[*DB_TASK_EXCEPTIONS, *ES_TASK_EXCEPTIONS],
)
def disambiguate_authors(
    self, record_uuid, version_id, disambiguate_all_not_disambiguated=False
):
    LOGGER.info("Starting disambiguation task", uuid=str(record_uuid))
    record = InspireRecord.get_record(record_uuid)
    if record.model.version_id < version_id:
        LOGGER.warning(
            "Received stale data",
            recent_version_id=version_id,
            record_version_id=record.model.version_id,
        )
        raise StaleDataError
    editor_soft_lock = EditorSoftLock(
        recid=record["control_number"],
        record_version=record.model.version_id,
        task_name=self.name,
    )
    editor_soft_lock.add_lock()
    literature_in_previous_version = "Literature" in record._previous_version.get(
        "_collections", []
    )
    if "Literature" not in record["_collections"]:
        if literature_in_previous_version:
            record.remove_authors_references()
            record.update(dict(record))
            db.session.commit()
        editor_soft_lock.remove_lock()
        return
    if not literature_in_previous_version:
        authors = record.get("authors", [])
    elif disambiguate_all_not_disambiguated:
        authors = _get_not_disambiguated_authors(record.get("authors", []))
    else:
        authors = record.get_modified_authors()
    if not authors:
        LOGGER.info("No authors eligible for disambiguation", uuid=str(record.id))
    updated_authors = _disambiguate_authors(authors, record)
    if updated_authors:
        LOGGER.info(
            "Updated references for authors",
            uuid=str(record.id),
            recid=record["control_number"],
            authors_control_numbers=updated_authors,
        )
        record.update(dict(record), disable_disambiguation=True)
        db.session.commit()
    else:
        LOGGER.info(
            "References for authors not updated",
            uuid=str(record.id),
            recid=record["control_number"],
        )
    editor_soft_lock.remove_lock()
    return updated_authors
