import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.exceptions import AirflowException, AirflowSkipException
from airflow.models.param import Param
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import task_failure_alert
from include.utils.cds import get_record_for_provided_ids, has_any_id
from include.utils.constants import LITERATURE_PID_TYPE
from inspire_utils.record import get_value, get_values_for_schema

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2025, 5, 22),
    schedule="@daily",
    catchup=False,
    tags=["cds"],
    params={
        "since": Param(type=["null", "string"], default=""),
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

            record_id = get_record_for_provided_ids(
                inspire_http_record_management_hook,
                control_numbers,
                arxivs,
                dois,
                report_numbers,
            )
            if not record_id:
                raise AirflowSkipException(
                    f"Skipping CDS hit {cds_id} (no record found in Inspire)"
                )

            try:
                record = inspire_http_record_management_hook.get_record(
                    pid_type=LITERATURE_PID_TYPE, control_number=record_id
                )
            except AirflowException as e:
                raise AirflowSkipException(
                    f"Skipping CDS hit {cds_id}"
                    f"(no record found in Inspire: {record_id})"
                ) from e

            record_metadata = record["metadata"]
            ids = record_metadata.get("external_system_identifiers", [])
            values = get_values_for_schema(ids, "CDS")
            if cds_id in values:
                raise AirflowSkipException(
                    f"Correct CDS identifier is already present in the record. "
                    f"Record ID: {record_metadata['control_number']}, CDS ID: {cds_id}",
                )

            return {"original_record": record, "cds_id": cds_id}

        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.17"],
            system_site_packages=False,
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

        result = process_record(cds_record)
        built = build_record(result)
        update_inspire_record(built)

    hits = get_cds_data()
    process_cds_response.expand(cds_record=hits)


cds_harvest_dag()
