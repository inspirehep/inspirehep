import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.models.param import Param
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import task_failure_alert
from include.utils.cds import has_any_id, retrieve_and_validate_record, update_record
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
    on_failure_callback=task_failure_alert,
)
def cds_harvest_dag():
    """Defines the DAG for the CDS harvest workflow."""
    generic_http_hook = GenericHttpHook(http_conn_id="cds_connection")
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    @task(task_id="get_cds_data")
    def get_cds_data(**context):
        """Starts harvesting cds.

        Returns: data from cds
        """
        since = context["params"]["since"] or context["ds"]
        logger.info(f"Harvesting CDS data since {since}")
        cds_response = generic_http_hook.call_api(
            endpoint="/api/inspire2cdsids", method="GET", params={"since": since}
        )
        cds_response.raise_for_status()
        hits = cds_response.json().get("hits", [])
        logger.info(f"CDS response: {len(hits)}")
        filtered_hits = [hit for hit in hits if has_any_id(hit)]
        logger.info(f"Filtered CDS response: {len(filtered_hits)}")
        return filtered_hits

    @task_group
    def process_cds_response(cds_record):
        @task(task_id="process_record")
        def process_record(cds_record):
            control_numbers = get_value(cds_record, "metadata.other_ids", [])
            arxivs = get_value(cds_record, "metadata.eprints", [])
            dois = get_value(cds_record, "metadata.dois.value", [])
            report_numbers = get_value(cds_record, "metadata.report_numbers.value", [])
            cds_id = cds_record.get("id") or get_value(
                cds_record, "metadata.control_number", []
            )

            return retrieve_and_validate_record(
                inspire_http_record_management_hook,
                cds_id,
                control_numbers,
                arxivs,
                dois,
                report_numbers,
                schema="CDS",
            )

        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.16"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
        )
        def build_record(payload):
            from inspire_schemas.builders import LiteratureBuilder

            original_record = payload["original_record"]
            revision = original_record.get("revision_id", 0)

            builder = LiteratureBuilder(record=original_record["metadata"])
            builder.add_external_system_identifier(payload["cds_id"], "CDS")

            return {"revision": revision, "updated_record": dict(builder.record)}

        @task(task_id="update_inspire_record")
        def update_inspire_record(payload):
            return update_record(inspire_http_record_management_hook, payload)

        result = process_record(cds_record)
        built = build_record(result)
        update_inspire_record(built)

    hits = get_cds_data()
    process_cds_response.expand(cds_record=hits)


cds_harvest_dag()
