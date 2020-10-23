import structlog
from celery import shared_task
from flask import current_app
from inspire_matcher.api import match
from invenio_db import db
from prometheus_client import Counter

from inspirehep.disambiguation.utils import (
    create_new_empty_author,
    link_signatures_to_author,
    update_author_names,
)
from inspirehep.records.api import InspireRecord
from inspirehep.records.utils import get_ref_from_pid

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
                author = create_new_empty_author()
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
        matched_authors = [
            matched_record["_source"]["control_number"]
            for matched_record in match(
                author, current_app.config["AUTHOR_MATCHER_EXACT_CONFIG"]
            )
        ]
        if len(set(matched_authors)) == 1:
            author_control_number = matched_authors[0]
            author["record"] = get_ref_from_pid("aut", author_control_number)
            updated_authors.append(str(author_control_number))
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
