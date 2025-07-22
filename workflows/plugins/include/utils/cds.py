import logging

from airflow.exceptions import AirflowException
from idutils import is_arxiv
from include.utils.constants import LITERATURE_PID_TYPE
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value, get_values_for_schema

logger = logging.getLogger(__name__)


def get_dois(cds_record):
    dois = force_list(get_value(cds_record, "pids.doi.identifier", []))
    parent_dois = force_list(get_value(cds_record, "parent.pids.doi.identifier", []))
    return dois + parent_dois


def get_identifiers_for_scheme(elements, schema):
    """Return all identifiers from elements having a given scheme."""
    return [
        element["identifier"] for element in elements if element["scheme"] == schema
    ]


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


def update_record(inspire_http_record_management_hook, payload):
    updated_record = payload["updated_record"]
    control_number = updated_record["control_number"]
    revision_id = payload["revision"]
    logger.info(
        f"Updating record with {payload['updated_record']} "
        f"and with revision ID {revision_id}"
    )
    response = inspire_http_record_management_hook.update_record(
        data=updated_record,
        pid_type=LITERATURE_PID_TYPE,
        control_number=control_number,
        revision_id=revision_id + 1,
    )
    response.raise_for_status()
    logger.info(f"Record {control_number} updated successfully.")
    return response.json()


def retrieve_and_validate_record(
    inspire_http_record_management_hook,
    cds_id,
    control_numbers,
    arxivs,
    dois,
    report_numbers,
    schema,
):
    record_id = get_record_for_provided_ids(
        inspire_http_record_management_hook,
        control_numbers,
        arxivs,
        dois,
        report_numbers,
    )
    if not record_id:
        logger.info(f"Skipping CDS hit {cds_id} (no record found in Inspire)")
        return None

    try:
        record = inspire_http_record_management_hook.get_record(
            pid_type=LITERATURE_PID_TYPE,
            control_number=record_id,
        )
    except AirflowException:
        logger.info(
            f"Skipping CDS hit {cds_id}" f" (no record found in Inspire: {record_id})",
        )
        return None

    metadata = record.get("metadata", {})
    external_ids = metadata.get("external_system_identifiers", [])
    existing_cds_ids = get_values_for_schema(external_ids, schema)
    if cds_id in existing_cds_ids:
        logger.info(
            f"Correct CDS identifier is already present in the record. "
            f"Record ID: {metadata.get('control_number')}, CDS ID: {cds_id}",
        )
        return None

    return {"original_record": record, "cds_id": cds_id}
