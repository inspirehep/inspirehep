import logging

from airflow.sdk import Param, dag, task
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.cds_harvest import build_records
from include.utils.constants import HEP_PUBLISHER_CREATE
from include.utils.harvests import (
    fetch_record_oaipmh_by_identifier,
    load_records,
)
from include.utils.s3 import S3JsonStore
from literature.check_failures_task import check_failures

logger = logging.getLogger(__name__)


@dag(
    catchup=False,
    tags=["literature", "cds", "harvest"],
    params={
        "identifiers": Param(type="array", default=[]),
        "metadata_prefix": Param(type=["null", "string"], default="marcxml"),
    },
    on_failure_callback=FailedDagNotifier(),
)
def cds_literature_harvest_by_identifier_dag():
    """Harvest specific CDS records by OAI-PMH identifier."""

    @task
    def get_identifiers(**context):
        return context["params"]["identifiers"]

    @task
    def process_records(identifiers, **context):
        workflow_management_hook = WorkflowManagementHook(HEP)
        s3_store = S3JsonStore(aws_conn_id="s3_conn")

        xml_records = []
        for identifier in identifiers:
            xml_records.append(
                fetch_record_oaipmh_by_identifier(
                    connection_id="cds_oaipmh_connection",
                    metadata_prefix=context["params"]["metadata_prefix"],
                    identifier=identifier,
                )
            )

        parsed_records, failed_build_records = build_records(
            xml_records,
            context["run_id"],
        )
        failed_load_records = load_records(
            parsed_records,
            workflow_management_hook,
            workflow_type=HEP_PUBLISHER_CREATE,
        )

        return s3_store.write_object(
            {
                "failed_build_records": failed_build_records,
                "failed_load_records": failed_load_records,
            }
        )

    identifiers = get_identifiers()
    failed_load_record_key = process_records(identifiers)
    check_failures(failed_load_record_key)


cds_literature_harvest_by_identifier_dag()
