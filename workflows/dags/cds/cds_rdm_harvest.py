import logging
from datetime import datetime
from urllib.parse import parse_qs, urlparse

from airflow.decorators import dag, task, task_group
from airflow.macros import ds_add
from airflow.models.param import Param
from airflow.providers.http.hooks.http import HttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import FailedDagNotifier
from include.utils.cds import (
    get_dois,
    get_identifiers_for_scheme,
    retrieve_and_validate_record,
    update_record,
)
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)

DEFAULT_MAX_RESULTS = 10000
DEFAULT_MIN_MINUTES = 5
DEFAULT_MAX_TASKS = 25


def _normalize_date(value):
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%dT00:00:00")
    if isinstance(value, str) and "T" not in value:
        return f"{value}T00:00:00"
    return value


def _pagination_fn(response):
    next_url = response.json().get("links", {}).get("next")
    if not next_url:
        logger.info("No more pages; finished harvesting.")
        return None

    logger.info(f"Following next link: {next_url}")
    parsed = urlparse(next_url)
    next_params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
    logger.info(f"Next params: {next_params}")
    return {"data": next_params}


def _response_filter(responses, hook):
    results = []
    for response in responses:
        logger.info(f"URL:{response.request.url}")
        payload = response.json()
        hits = get_value(payload, "hits.hits", [])
        logger.info(f"Fetched {len(hits)} records from CDS")
        for cds_record in hits:
            cds_id = cds_record.get("id")
            if not cds_id:
                logger.info(
                    f"Cannot extract CDS id from CDS RDM response: {cds_record}"
                )
                continue
            identifiers = get_value(cds_record, "metadata.identifiers", [])
            control_numbers = get_identifiers_for_scheme(identifiers, "inspire")
            arxivs = get_identifiers_for_scheme(identifiers, "arxiv")
            dois = get_dois(cds_record)
            report_numbers = get_identifiers_for_scheme(identifiers, "cds_ref")
            if not any([control_numbers, arxivs, dois, report_numbers]):
                logger.info(
                    f"CDS RDM record {cds_id} does not have any identifiers to harvest."
                )
                continue

            record = retrieve_and_validate_record(
                hook,
                cds_id,
                control_numbers,
                arxivs,
                dois,
                report_numbers,
                schema="CDSRDM",
            )
            if record:
                results.append(record)
    logger.info(
        f"Total pages: {len(responses)}. "
        f"{len(results)} CDS records eligible for update."
    )
    return results


def _get_total_count(since, until):
    hook = HttpHook(http_conn_id="cds_rdm_connection", method="GET")
    response = hook.run(
        endpoint="/api/records",
        data={
            "q": f"updated:[{since} TO {until}]",
            "page": 1,
            "size": 1,
        },
    )
    result = response.json()
    total = get_value(result, "hits.total", 0)
    logger.info(f"Total records for range {since} to {until}: {total}")
    return total


def _split_time_range_once(since_str, until_str):
    since_dt = datetime.fromisoformat(since_str)
    until_dt = datetime.fromisoformat(until_str)
    midpoint = since_dt + (until_dt - since_dt) / 2

    return [
        (
            since_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            midpoint.strftime("%Y-%m-%dT%H:%M:%S"),
        ),
        (
            midpoint.strftime("%Y-%m-%dT%H:%M:%S"),
            until_dt.strftime("%Y-%m-%dT%H:%M:%S"),
        ),
    ]


def _get_time_ranges(
    since, until, max_results=DEFAULT_MAX_RESULTS, min_minutes=DEFAULT_MIN_MINUTES
):
    total = _get_total_count(since, until)
    if total == 0:
        logger.info(f"Range {since} to {until} has no records, skipping")
        return []

    if total <= max_results:
        logger.info(f"Range {since} to {until} has {total} records (within limit)")
        return [(since, until)]

    since_dt = datetime.fromisoformat(since)
    until_dt = datetime.fromisoformat(until)
    duration_minutes = (until_dt - since_dt).total_seconds() / 60
    if duration_minutes <= min_minutes:
        logger.warning(
            f"Range {since} to {until} still has {total} records, "
            f"but cannot split further (< {min_minutes} minutes)"
        )
        return [(since, until)]

    logger.info(
        f"Range {since} to {until} has {total} records (exceeds limit), splitting..."
    )

    sub_ranges = _split_time_range_once(since, until)
    all_ranges = []
    for sub_since, sub_until in sub_ranges:
        all_ranges.extend(
            _get_time_ranges(sub_since, sub_until, max_results, min_minutes)
        )

    return all_ranges


@dag(
    start_date=datetime(2025, 5, 22),
    schedule="0 4 * * *",
    catchup=False,
    tags=["cds_rdm"],
    params={
        "since": Param(type=["string"], default=""),
        "until": Param(type=["string"], default=""),
        "max_results": Param(
            type=["integer"],
            default=DEFAULT_MAX_RESULTS,
            description="Maximum number of results per time range",
        ),
        "min_minutes": Param(
            type=["integer"],
            default=DEFAULT_MIN_MINUTES,
            description="Minimum duration (in minutes) for time ranges",
        ),
        "max_tasks": Param(
            type=["integer"],
            default=DEFAULT_MAX_TASKS,
            description="Maximum number of concurrent tasks",
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def cds_rdm_harvest_dag():
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    @task
    def determine_time_ranges(**context):
        params = context.get("params", {})
        ds = context.get("ds")
        since = params.get("since") or ds_add(ds, -1)
        until = params.get("until") or ds

        since = _normalize_date(since)
        until = _normalize_date(until)

        logger.info(f"Determining time ranges for harvest from {since} to {until}")
        max_tasks = params.get("max_tasks", DEFAULT_MAX_TASKS)
        time_ranges = _get_time_ranges(
            since,
            until,
            max_results=params.get("max_results", DEFAULT_MAX_RESULTS),
            min_minutes=params.get("min_minutes", DEFAULT_MIN_MINUTES),
        )

        if len(time_ranges) > max_tasks:
            logger.warning(
                f"Too many time ranges generated ({len(time_ranges)}), "
                f"which exceeds the limit ({max_tasks}). "
                "Please narrow the date range or increase the 'max_tasks' parameter."
            )
            raise ValueError(
                "Too many time ranges generated, please narrow the date range."
            )
        logger.info(f"Will harvest {len(time_ranges)} time ranges: {time_ranges}")
        return [{"since": tr[0], "until": tr[1]} for tr in time_ranges]

    @task
    def get_cds_records_for_range(time_range_dict):
        since = time_range_dict["since"]
        until = time_range_dict["until"]
        query_params = {
            "q": f"updated:[{since} TO {until}]",
            "page": 1,
            "size": 50,
            "sort": "newest",
        }

        hook = HttpHook(http_conn_id="cds_rdm_connection", method="GET")
        all_responses = []
        current_params = query_params.copy()

        while True:
            logger.info(
                f"Fetching page {current_params['page']} with params: {current_params}"
            )
            response = hook.run(endpoint="/api/records", data=current_params)
            if not response:
                logger.warning("No response received")
                break
            all_responses.append(response)
            pagination_result = _pagination_fn(response)
            if not pagination_result:
                break
            current_params.update(pagination_result["data"])

        logger.info(f"Processing {len(all_responses)} responses with response filter")
        results = _response_filter(all_responses, inspire_http_record_management_hook)

        logger.info(f"Total records collected for this range: {len(results)}")
        return results

    @task_group
    def process_cds_rdm_response(cds_record):
        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.23"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
        )
        def build_record(payload):
            from inspire_schemas.builders import LiteratureBuilder

            original_record = payload["original_record"]
            revision = original_record.get("revision_id", 0)

            builder = LiteratureBuilder(record=original_record["metadata"])
            builder.add_external_system_identifier(payload["cds_id"], "CDSRDM")

            return {"revision": revision, "updated_record": dict(builder.record)}

        @task(task_id="update_inspire_record")
        def update_inspire_record(payload):
            return update_record(inspire_http_record_management_hook, payload)

        built = build_record(cds_record)
        update_inspire_record(built)

    @task
    def flatten_results(results_list):
        flattened = []
        for results in results_list:
            if isinstance(results, list):
                flattened.extend(results)
            elif results:
                flattened.append(results)
        logger.info(f"Total records to process: {len(flattened)}")
        return flattened

    time_ranges = determine_time_ranges()
    harvest_results = get_cds_records_for_range.expand(time_range_dict=time_ranges)
    all_records = flatten_results(harvest_results)
    process_cds_rdm_response.expand(cds_record=all_records)


cds_rdm_harvest_dag()
