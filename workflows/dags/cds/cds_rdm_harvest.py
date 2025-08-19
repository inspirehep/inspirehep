import datetime
import logging
from urllib.parse import parse_qs, urlparse

from airflow.decorators import dag, task, task_group
from airflow.models.param import Param
from airflow.providers.http.operators.http import HttpOperator
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


@dag(
    start_date=datetime.datetime(2025, 5, 22),
    schedule="0 4 * * *",
    catchup=False,
    tags=["cds_rdm"],
    params={
        "since": Param(type=["string"], default=""),
        "until": Param(type=["string"], default=""),
    },
    on_failure_callback=FailedDagNotifier(),
)
def cds_rdm_harvest_dag():
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    get_cds_rdm_data = HttpOperator(
        task_id="get_cds_rdm_data",
        http_conn_id="cds_rdm_connection",
        method="GET",
        endpoint="/api/records",
        data={
            "q": (
                "updated:[{{ params.since or macros.ds_add(ds, -1) }} "
                "TO {{ params.until or ds }}]"
            ),
            "page": 1,
            "size": 50,
            "sort": "newest",
        },
        response_filter=lambda responses,
        hook=inspire_http_record_management_hook: _response_filter(responses, hook),
        pagination_function=_pagination_fn,
    )

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

    hits = get_cds_rdm_data.output
    process_cds_rdm_response.expand(cds_record=hits)


cds_rdm_harvest_dag()
