import structlog
from celery import shared_task
from invenio_db import db
from prometheus_client import Counter

from inspirehep.disambiguation.utils import (
    create_new_empty_author,
    link_signatures_to_author,
    update_author_names,
)

LOGGER = structlog.getLogger()

disambiguation_assigned_clusters_total = Counter(
    "disambiguation_assigned_clusters_total", "Assigned clusters", ["num_authors"]
)
disambiguation_created_authors_total = Counter(
    "disambiguation_created_authors_total",
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
            disambiguation_assigned_clusters_total.labels(num_authors=1).inc()
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
            disambiguation_assigned_clusters_total.labels(num_authors=0).inc()
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
                    disambiguation_created_authors_total.inc()
                    update_author_names(author, linked_signatures)

        else:
            disambiguation_assigned_clusters_total.labels(num_authors="2+").inc()
            LOGGER.debug("Received cluster with more than 1 author.")
    db.session.commit()
