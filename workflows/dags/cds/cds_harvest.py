import datetime
import logging

from airflow.decorators import dag, task
from airflow.exceptions import AirflowException
from airflow.macros import ds_add
from airflow.sdk import Param
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import FailedDagNotifier
from include.utils.cds import retrieve_and_validate_record, update_record
from inspire_schemas.builders import LiteratureBuilder
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2025, 5, 22),
    schedule="@daily",
    catchup=False,
    tags=["cds"],
    params={
        "since": Param(type=["string"], default=""),
    },
    on_failure_callback=FailedDagNotifier(),
)
def cds_harvest_dag():
    """Defines the DAG for the CDS harvest workflow."""

    @task(task_id="get_cds_data")
    def get_cds_data(**context):
        """Starts harvesting cds.

        Returns: data from cds
        """
        generic_http_hook = GenericHttpHook(http_conn_id="cds_connection")
        inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

        since = context["params"]["since"] or ds_add(context["ds"], -1)
        logger.info(f"Harvesting CDS data since {since}")
        cds_response = generic_http_hook.call_api(
            endpoint="/api/inspire2cdsids", method="GET", params={"since": since}
        )
        cds_response.raise_for_status()
        eligible_records = []
        hits = cds_response.json().get("hits", [])
        logger.info(f"CDS response: {len(hits)}")
        for cds_record in hits:
            cds_id = cds_record.get("id") or get_value(
                cds_record, "metadata.control_number", []
            )
            if not cds_id:
                logger.info(f"Cannot extract CDS id from CDS response: {cds_record}")
                continue

            control_numbers = get_value(cds_record, "metadata.other_ids", [])
            arxivs = get_value(cds_record, "metadata.eprints", [])
            dois = get_value(cds_record, "metadata.dois.value", [])
            report_numbers = get_value(cds_record, "metadata.report_numbers.value", [])
            if not any([control_numbers, arxivs, dois, report_numbers]):
                logger.info(
                    f"CDS record {cds_id} does not have any identifiers to harvest."
                )
                continue

            record = retrieve_and_validate_record(
                inspire_http_record_management_hook,
                cds_id,
                control_numbers,
                arxivs,
                dois,
                report_numbers,
                schema="CDS",
            )
            if record:
                eligible_records.append(record)
        logger.info(f"Total records collected for this range: {len(eligible_records)}")

        failed = []
        for payload in eligible_records:
            cds_identifier = payload["cds_id"]
            try:
                original_record = payload["original_record"]
                control_number = original_record["metadata"].get("control_number")
                builder = LiteratureBuilder(record=original_record["metadata"])
                builder.add_external_system_identifier(cds_identifier, "CDS")

                payload_update = {
                    "revision": original_record.get("revision_id", 0),
                    "updated_record": dict(builder.record),
                }
                update_record(inspire_http_record_management_hook, payload_update)
            except Exception as e:
                logger.error(
                    f"Failed to update record {control_number} "
                    f"for CDS ID {cds_identifier}: {e}"
                )
                failed.append(
                    {
                        "inspire_record": control_number,
                        "cds_id": cds_identifier,
                    }
                )

        if failed:
            raise AirflowException(f"The following records failed: {failed}")

    get_cds_data()


cds_harvest_dag()
