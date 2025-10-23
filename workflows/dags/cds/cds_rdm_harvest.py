import datetime
import logging
from urllib.parse import parse_qs, urlparse

from airflow.exceptions import AirflowException
from airflow.macros import ds_add
from airflow.sdk import Param, dag, task
from hooks.generic_http_hook import GenericHttpHook
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
from inspire_schemas.builders import LiteratureBuilder
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)


def _pagination_from_url(next_url):
    if not next_url:
        logger.info("No more pages; finished harvesting.")
        return None

    logger.info(f"Following next link: {next_url}")
    parsed = urlparse(next_url)
    next_params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
    logger.info(f"Next params: {next_params}")
    return next_params


def _response_filter(hits, hook):
    results = []
    for cds_record in hits:
        cds_id = cds_record.get("id")
        if not cds_id:
            logger.info(f"Cannot extract CDS id from CDS RDM response: {cds_record}")
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
    logger.info(f"{len(results)} CDS records eligible for update.")
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
    @task
    def get_cds_rdm_data(**context):
        inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
        generic_http_hook = GenericHttpHook(http_conn_id="cds_rdm_connection")
        since = context["params"].get("since") or ds_add(context["ds"], -1)
        until = context["params"].get("until") or context["ds"]
        logger.info(f"Harvesting CDS RDM records updated from {since} to {until}")
        params = {
            "q": f"updated:[{since} TO {until}]",
            "page": 1,
            "size": 50,
            "sort": "newest",
        }

        all_hits = []
        while params:
            resp = generic_http_hook.call_api(
                endpoint="/api/records",
                method="GET",
                params=params,
            )
            resp.raise_for_status()
            payload = resp.json()
            page_hits = get_value(payload, "hits.hits", [])
            all_hits.extend(page_hits)

            next_link = payload.get("links", {}).get("next")
            next_bundle = _pagination_from_url(next_link)
            params = next_bundle if next_bundle else None

        eligible_records = _response_filter(
            all_hits, inspire_http_record_management_hook
        )
        logger.info(f"Total records collected for this range: {len(eligible_records)}")

        failed = []
        for payload in eligible_records:
            cds_id = payload["cds_id"]
            try:
                original_record = payload["original_record"]
                builder = LiteratureBuilder(record=original_record["metadata"])
                builder.add_external_system_identifier(cds_id, "CDSRDM")
                payload_update = {
                    "revision": original_record.get("revision_id", 0),
                    "updated_record": dict(builder.record),
                }
                update_record(inspire_http_record_management_hook, payload_update)
            except Exception as e:
                logger.error(
                    f"Failed to update record {original_record['control_number']} "
                    f"for CDS ID {cds_id}: {e}"
                )
                failed.append(
                    {
                        "inspire_record": original_record["control_number"],
                        "cds_id": cds_id,
                    }
                )

        if failed:
            raise AirflowException(f"The following records failed: {failed}")

    get_cds_rdm_data()


cds_rdm_harvest_dag()
