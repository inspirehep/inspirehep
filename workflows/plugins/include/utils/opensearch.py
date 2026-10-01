import logging

from airflow.sdk import Variable
from hooks.custom_opensearch_hook import CustomOpenSearchHook
from include.utils.constants import COMPLETED_STATUSES
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)

RETENTION_SEARCH_PAGE_SIZE = 1000


def get_hits_sources(response, workflow_id_to_ignore=None):
    hits = get_value(response, "hits.hits", [])
    sources = []
    for hit in hits:
        source = hit.get("_source")
        if source:
            if workflow_id_to_ignore and source.get("id") == workflow_id_to_ignore:
                continue
            sources.append(source)
    return sources


def find_matching_workflows(workflow, statuses):
    arxiv_eprints_values = get_value(workflow, "data.arxiv_eprints.value", [])
    dois_values = get_value(workflow, "data.dois.value", [])

    if not arxiv_eprints_values and not dois_values:
        logger.info("No arXiv eprints or DOIs in workflow, skipping matching.")
        return []

    should_clauses = []
    if arxiv_eprints_values:
        should_clauses.append(
            {"terms": {"data.arxiv_eprints.value": arxiv_eprints_values}}
        )
    if dois_values:
        should_clauses.append({"terms": {"data.dois.value": dois_values}})

    query = {
        "query": {
            "bool": {
                "filter": [{"terms": {"status": statuses}}],
                "should": should_clauses,
                "minimum_should_match": 1,
            }
        }
    }
    index_name = Variable.get("hepworkflow_open_search_index")

    opensearch_hook = CustomOpenSearchHook(
        open_search_conn_id="opensearch_connection", log_query=True
    )
    response = opensearch_hook.search(query=query, index_name=index_name)

    matches = get_hits_sources(response, workflow_id_to_ignore=workflow.get("id"))
    logger.info("Found %s matching workflows", len(matches))
    return matches


def find_completed_workflows_past_retention(
    retention_days, search_window_days=14, excluded_decision_action=None
):
    filters = [{"terms": {"status": COMPLETED_STATUSES}}]
    updated_at_range = {"lte": f"now-{retention_days}d"}
    if search_window_days != -1:
        updated_at_range["gt"] = f"now-{retention_days + search_window_days}d"
    filters.append({"range": {"_updated_at": updated_at_range}})

    query = {
        "size": RETENTION_SEARCH_PAGE_SIZE,
        "_source": ["id"],
        "sort": [{"_doc": "asc"}],
        "query": {
            "bool": {
                "filter": filters,
            }
        },
    }
    if excluded_decision_action:
        query["query"]["bool"]["must_not"] = [
            {
                "nested": {
                    "path": "decisions",
                    "query": {"term": {"decisions.action": excluded_decision_action}},
                }
            }
        ]

    index_name = Variable.get("hepworkflow_open_search_index")

    opensearch_hook = CustomOpenSearchHook(
        open_search_conn_id="opensearch_connection", log_query=True
    )

    workflow_ids = []
    search_after = None
    while True:
        if search_after is not None:
            query["search_after"] = search_after

        response = opensearch_hook.search(query=query, index_name=index_name)
        hits = get_value(response, "hits.hits", [])
        if not hits:
            break

        workflow_ids.extend(
            hit["_source"]["id"] for hit in hits if hit.get("_source", {}).get("id")
        )

        if len(hits) < RETENTION_SEARCH_PAGE_SIZE:
            break
        search_after = hits[-1]["sort"]

    logger.info("Found %s completed workflows past S3 retention", len(workflow_ids))
    return workflow_ids


def find_completed_unpurged_workflows_past_retention(
    retention_days, search_window_days=14
):
    return find_completed_workflows_past_retention(
        retention_days,
        search_window_days,
        excluded_decision_action="purged",
    )
