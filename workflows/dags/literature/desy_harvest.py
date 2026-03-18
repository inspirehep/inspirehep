import datetime
import logging

from airflow.exceptions import AirflowSkipException
from airflow.sdk import Variable, dag, task
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.desy import process_subdirectory
from include.utils.s3 import S3JsonStore
from literature.check_failures_task import check_failures

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="0 * * * *",
    catchup=False,
    tags=["literature", "desy", "harvest"],
    on_failure_callback=FailedDagNotifier(),
)
def desy_harvest_dag():
    """Harvest DESY JSONL batches from S3 and create literature workflows."""

    @task
    def process_subdirectories(**context):
        workflow_management_hook = WorkflowManagementHook(HEP)
        input_bucket = Variable.get("s3_desy_input_bucket_name")
        output_bucket = Variable.get("s3_desy_output_bucket_name")
        s3_publisher_store = S3JsonStore("s3_elsevier_conn")

        run_id = context["run_id"]
        subdirectories = s3_publisher_store.hook.list_prefixes(
            delimiter="/", bucket_name=input_bucket
        )
        if not subdirectories:
            raise AirflowSkipException("No DESY subdirectories found to process")

        failed_parse_records = []
        failed_load_records = []
        for subdirectory_name in subdirectories:
            if s3_publisher_store.hook.list_keys(
                output_bucket,
                subdirectory_name,
            ):
                logger.info(
                    "Skipping already processed DESY subdirectory %s",
                    subdirectory_name,
                )
                continue

            failed_records = process_subdirectory(
                subdirectory_name=subdirectory_name,
                s3_store=s3_publisher_store,
                input_bucket=input_bucket,
                output_bucket=output_bucket,
                workflow_management_hook=workflow_management_hook,
                submission_number=run_id,
            )
            failed_parse_records.extend(failed_records["failed_parse_records"])
            failed_load_records.extend(failed_records["failed_load_records"])

        return s3_publisher_store.write_object(
            {
                "failed_parse_records": failed_parse_records,
                "failed_load_records": failed_load_records,
            },
            key=run_id,
            bucket_name=output_bucket,
        )

    failed_record_key = process_subdirectories()
    check_failures(failed_record_key)


desy_harvest_dag()
