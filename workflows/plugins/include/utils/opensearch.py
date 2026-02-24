import logging

from airflow.providers.opensearch.hooks.opensearch import OpenSearchHook
from airflow.sdk import Variable
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)


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

    opensearch_hook = OpenSearchHook(
        open_search_conn_id="opensearch_connection", log_query=True
    )
    response = opensearch_hook.search(query=query, index_name=index_name)

    matches = get_hits_sources(response, workflow_id_to_ignore=workflow.get("id"))
    logger.info("Found %s matching workflows", len(matches))
    return matches
