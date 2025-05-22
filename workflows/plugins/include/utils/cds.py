import logging

from idutils import is_arxiv
from include.utils.constants import LITERATURE_PID_TYPE
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)


def has_any_id(cds_record):
    cds_id = cds_record.get("id") or get_value(
        cds_record, "metadata.control_number", []
    )
    if not cds_id:
        logger.info(f"Cannot extract CDS id from CDS response: {cds_record}")
        return False
    return any(
        [
            get_value(cds_record, "metadata.other_ids", []),
            get_value(cds_record, "metadata.eprints", []),
            get_value(cds_record, "metadata.dois.value", []),
            get_value(cds_record, "metadata.report_numbers.value", []),
        ]
    )


def search_and_return_single(
    hook,
    query,
):
    """
    Build query params from the URL, call search_records,
    and if exactly one hit is found
    return its metadata with a log; otherwise return None.
    """
    query_params = {
        "q": query,
        "fields": "control_number",
    }
    logger.info(
        f"Searching for record with query: {query_params}",
    )
    resp = hook.search_records(pid_type=LITERATURE_PID_TYPE, query_params=query_params)
    logger.info(
        f"Response from search: {resp}",
    )
    hits = get_value(resp, "hits.hits", [])
    logger.info(
        f"Found {len(hits)} hits for query",
    )
    if len(hits) != 1:
        return None
    record = hits[0]["metadata"]
    control_number = record.get("control_number")
    logger.info(f"Matched record. Control number: {control_number}")
    return control_number


def get_record_for_provided_ids(
    inspire_http_record_management_hook, control_numbers, arxivs, dois, report_numbers
):
    query = build_literature_search_params(
        control_numbers, arxivs, dois, report_numbers
    )
    return search_and_return_single(
        hook=inspire_http_record_management_hook,
        query=query,
    )


def build_literature_search_params(
    control_numbers,
    arxivs,
    dois,
    report_numbers,
):
    """
    Build an Elasticsearch‐style query URL that matches any of the provided
    control_numbers, arxivs or dois.

    e.g. q=control_number:1234 OR control_number:5678 OR arxiv:1901.1234 OR ...
    """
    clauses = set()
    for control_number in control_numbers:
        clauses.add(f"control_number:{control_number}")
    for arxiv_id in arxivs:
        clauses.add(f"arxiv:{arxiv_id}")
    for doi in dois:
        clauses.add(f"dois.value:{doi}")
    for report_number in report_numbers:
        arxiv_candidate = report_number.lower().split("arxiv:")[-1]
        if is_arxiv(arxiv_candidate):
            clauses.add(f"arxiv:{arxiv_candidate}")
        else:
            clauses.add(f'report_numbers.value.fuzzy:"{report_number}"')

    return " OR ".join(sorted(clauses))
