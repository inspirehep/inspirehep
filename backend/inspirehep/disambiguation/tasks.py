import structlog
from celery import shared_task
from flask import current_app
from inspire_matcher.api import match
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value
from invenio_db import db
from prometheus_client import Counter

from inspirehep.disambiguation.utils import (
    create_new_stub_author,
    link_signatures_to_author,
    update_author_names,
)
from inspirehep.matcher.validators import (
    affiliations_validator,
    collaboration_validator,
)
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
        if matched_record.get("inner_hits")
    ]
    return matched_records


def get_record_refs_for_matched_literature_authors(matched_records):
    matched_authors_refs = set()
    for record_authors in matched_records:
        matched_authors_refs.update(
            get_value(
                record_authors, "inner_hits.authors.hits.hits._source.record.$ref", None
            )
        )
    return matched_authors_refs


def assign_reference_to_author_if_unambiguous_match(matched_authors_refs, author):
    if matched_authors_refs and len(matched_authors_refs) == 1:
        author_reference_url = matched_authors_refs.pop()
        author["record"] = {"$ref": author_reference_url}
        return author_reference_url.split("/")[-1]


def assign_reference_to_author_if_unambiguous_literature_author_match(
    matched_records, author
):
    matched_authors_refs = get_record_refs_for_matched_literature_authors(
        matched_records
    )
    matched_ref = assign_reference_to_author_if_unambiguous_match(
        matched_authors_refs, author
    )
    if matched_ref:
        return matched_ref


def match_literature_author(author, updated_authors, record):
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
        matched_reference = (
            assign_reference_to_author_if_unambiguous_literature_author_match(
                matched_records, author
            )
        )
        if not matched_reference and validator:
            for validator_function in validator:
                valid_matches = (
                    match
                    for match in matched_records
                    if validator_function(author_matcher_data, match)
                )
                matched_reference = (
                    assign_reference_to_author_if_unambiguous_literature_author_match(
                        valid_matches, author
                    )
                )
                if matched_reference:
                    break
        if matched_reference:
            updated_authors.append(matched_reference)
            return author


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


@shared_task(ignore_result=False, bind=True)
def disambiguate_authors(self, record_uuid):
    record = InspireRecord.get_record(record_uuid)
    if "Literature" not in record["_collections"]:
        return
    authors = record.get_modified_authors()
    updated_authors = []

    for author in authors:
        if author.get("curated_relation"):
            continue
        matched_authors = {
            matched_record["_source"]["self"]["$ref"]
            for matched_record in match(
                author, current_app.config["AUTHOR_MATCHER_EXACT_CONFIG"]
            )
        }
        if len(matched_authors) == 1:
            updated_author_recid = assign_reference_to_author_if_unambiguous_match(
                matched_authors, author
            )
            updated_authors.append(updated_author_recid)
        if "record" not in author:
            match_literature_author(author, updated_authors, record)
        if "record" not in author:
            new_author_record = create_new_author(
                author["full_name"], record["control_number"]
            )
            author["record"] = new_author_record["self"]
            updated_authors.append(new_author_record["control_number"])

    if updated_authors:
        LOGGER.info(
            f"Updated references for authors",
            {
                "uuid": str(record.id),
                "recid": record["control_number"],
                "authors_control_numbers": updated_authors,
            },
        )
        record.update(dict(record))
    db.session.commit()
