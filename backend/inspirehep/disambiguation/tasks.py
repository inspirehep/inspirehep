import structlog
from celery import shared_task
from flask import current_app
from inspire_matcher.api import match
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema
from invenio_db import db
from prometheus_client import Counter
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.disambiguation.utils import (
    create_new_stub_author,
    link_signatures_to_author,
    update_author_names,
)
from inspirehep.matcher.validators import (
    affiliations_validator,
    collaboration_validator,
)
from inspirehep.pidstore.errors import PIDAlreadyExistsError
from inspirehep.records.api import InspireRecord

LOGGER = structlog.getLogger()

disambiguation_assigned_clusters = Counter(
    "disambiguation_assigned_clusters", "Assigned clusters", ["num_authors"]
)
disambiguation_created_authors = Counter(
    "disambiguation_created_authors",
    "How many authors were created during disambiguation.",
)


@shared_task(ignore_result=False, bind=True)
def disambiguate_signatures(self, clusters):
    """Task which performs author disambiguation according to the given clusters.
    If the cluster has no authors, it creates a new author using the data from all the signatures
    and links all signatures to the newly created author.
    If the cluster has exactly one author, it links all signatures to that author.

    Args:
        clusters (list): clusters received after the clustering performed by inspire_disambiguation.
    """
    for cluster in clusters:
        authors = cluster["authors"]
        if len(authors) == 1:
            disambiguation_assigned_clusters.labels("1").inc()
            LOGGER.debug(
                "Received cluster with 1 author.",
                author=cluster["authors"][0],
                signatures=cluster["signatures"],
            )
            with db.session.begin_nested():
                link_signatures_to_author(
                    cluster["signatures"], cluster["authors"][0]["author_id"]
                )

        elif len(authors) == 0:
            disambiguation_assigned_clusters.labels("0").inc()
            with db.session.begin_nested():
                LOGGER.debug(
                    "Received cluster with 0 authors.", signatures=cluster["signatures"]
                )
                author = create_new_stub_author()
                linked_signatures = link_signatures_to_author(
                    cluster["signatures"], author["control_number"]
                )
                if not linked_signatures:
                    author.hard_delete()
                else:
                    disambiguation_created_authors.inc()
                    update_author_names(author, linked_signatures)

        else:
            disambiguation_assigned_clusters.labels("2+").inc()
            LOGGER.debug("Received cluster with more than 1 author.")
    db.session.commit()


def match_literature_author_with_config(author_data, matcher_config):
    matched_records = [
        matched_record
        for matched_record in match(author_data, matcher_config)
        if get_value(
            matched_record, "inner_hits.authors.hits.hits[0]._source.record.$ref"
        )
    ]
    return matched_records


def get_reference_and_bai_if_unambiguous_match(matched_refs_ids):
    if len(matched_refs_ids) == 1:
        author_reference, author_ids = matched_refs_ids.popitem()
        author_bais = get_values_for_schema(author_ids, "INSPIRE BAI")
        return {
            "author_reference": author_reference,
            "author_bai": author_bais[0] if author_bais else None,
        }


def get_reference_and_bai_if_unambiguous_literature_author_match(matched_records):
    matched_refs_ids = {
        get_value(
            matched_author, "inner_hits.authors.hits.hits[0]._source.record.$ref"
        ): get_value(matched_author, "inner_hits.authors.hits.hits[0]._source.ids", [])
        for matched_author in matched_records
    }
    matched_author_data = get_reference_and_bai_if_unambiguous_match(matched_refs_ids)
    return matched_author_data


def match_literature_author(author, record):
    configs = [
        current_app.config["AUTHOR_MATCHER_NAME_CONFIG"],
        current_app.config["AUTHOR_MATCHER_NAME_INITIALS_CONFIG"],
    ]

    validators = [(collaboration_validator, affiliations_validator), None]

    parsed_name = ParsedName.loads(author.get("full_name"))
    author_matcher_data = {
        "first_name": parsed_name.first,
        "last_name": parsed_name.last,
        "full_name": author.get("full_name"),
        "collaborations": get_value(record, "collaborations.value", []),
        "affiliations": get_value(author, "affiliations.value", []),
    }

    for config, validator in zip(configs, validators):
        matched_records = match_literature_author_with_config(
            author_matcher_data, config
        )
        matched_author_data = (
            get_reference_and_bai_if_unambiguous_literature_author_match(
                matched_records
            )
        )
        if not matched_author_data and validator:
            for validator_function in validator:
                valid_matches = (
                    match
                    for match in matched_records
                    if validator_function(author_matcher_data, match)
                )
                matched_author_data = (
                    get_reference_and_bai_if_unambiguous_literature_author_match(
                        valid_matches
                    )
                )
                if matched_author_data:
                    break
        if matched_author_data:
            return matched_author_data


def create_new_author(full_name, from_recid):
    new_author_data = {
        "name": {"value": full_name},
        "_private_notes": [
            {
                "source": "INSPIRE-disambiguation",
                "value": f"Created from literature record {from_recid}",
            }
        ],
    }

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
    matched_refs_ids = {
        matched_author["_source"]["self"]["$ref"]: matched_author["_source"].get(
            "ids", []
        )
        for matched_author in matched_authors
    }
    matched_author_data = get_reference_and_bai_if_unambiguous_match(matched_refs_ids)
    return matched_author_data


def assign_bai_to_literature_author(author, bai):
    if not bai:
        return
    literature_author_ids = get_value(author, "ids", [])
    author_ids_without_bai = [
        bai_dict
        for bai_dict in literature_author_ids
        if bai_dict["schema"] != "INSPIRE BAI"
    ]
    author["ids"] = [*author_ids_without_bai, {"schema": "INSPIRE BAI", "value": bai}]


@shared_task(
    ignore_result=False,
    bind=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(PIDAlreadyExistsError,),
)
def disambiguate_authors(self, record_uuid):
    # handle case when we try to get a record which is deleted
    try:
        record = InspireRecord.get_record(record_uuid)
    except NoResultFound:
        return
    if "Literature" not in record["_collections"]:
        return
    authors = record.get_modified_authors()
    updated_authors = []
    for author in authors:
        if author.get("curated_relation"):
            continue
        matched_author_data = match_author(author)
        if not matched_author_data:
            matched_author_data = match_literature_author(author, record)
        if matched_author_data:
            author["record"] = {"$ref": matched_author_data["author_reference"]}
            assign_bai_to_literature_author(
                author, matched_author_data.get("author_bai")
            )
            updated_authors.append(
                matched_author_data["author_reference"].split("/")[-1]
            )
        elif "record" not in author:
            new_author_record = create_new_author(
                author["full_name"], record["control_number"]
            )
            author["record"] = new_author_record["self"]
            new_author_bai = get_values_for_schema(
                new_author_record["ids"], "INSPIRE BAI"
            )[0]
            assign_bai_to_literature_author(author, new_author_bai)
            updated_authors.append(new_author_record["control_number"])
    if updated_authors:
        LOGGER.info(
            "Updated references for authors",
            {
                "uuid": str(record.id),
                "recid": record["control_number"],
                "authors_control_numbers": updated_authors,
            },
        )
        record.update(dict(record))
        db.session.commit()
