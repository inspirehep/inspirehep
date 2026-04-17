import logging

from airflow.sdk import Param, dag, task
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.elsevier import process_article
from include.utils.s3 import S3JsonStore
from literature.check_failures_task import check_failures

logger = logging.getLogger(__name__)


@dag(
    catchup=False,
    tags=["literature", "elsevier", "harvest"],
    params={
        "dois": Param(
            type="array",
            default=[],
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def elsevier_harvest_by_doi_dag():
    """Defines the DAG for the elsevier harvest workflow.

    Tasks:
    1. get_dois: retrieves the list of DOIs to process from the DAG parameters.
    2. process_records: Downloading the XML files, building and loading the records
    3. check_failures: checks and reports any failed records
    """

    @task
    def get_dois(**context):
        """Collects dois to process from DAG parameters.

        Returns: list of sets
        """
        return context["params"]["dois"]

    @task
    def process_records(dois, **context):
        """Processes the records for the given DOIs.
        For each DOI, it downloads the corresponding XML file from S3,
        extracts the metadata, and posts a workflow to HEP.
        If any record fails to process, it saves the failure details to S3.
        Args:
            dois (list): List of DOIs to process.
        Returns:
            str: S3 key where the failed records are stored, or None if no failures.
        """

        workflow_management_hook = WorkflowManagementHook(HEP)

        s3_store = S3JsonStore(aws_conn_id="s3_publisher_conn")
        failed_records = []

        for doi in dois:
            file_name = f"articles/{doi}.xml"
            xml_text = s3_store.hook.read_key(file_name)
            failed_record = process_article(
                file_name,
                xml_text,
                context["run_id"],
                s3_store,
                workflow_management_hook,
                push_to_s3=False,
            )
            if failed_record:
                failed_records.append(failed_record)

        if failed_records:
            return s3_store.write_object(
                {
                    "failed_records": failed_records,
                }
            )

    dois = get_dois()
    failed_load_record_key = process_records(dois)
    check_failures(failed_load_record_key, s3_conn="s3_publisher_conn")


elsevier_harvest_by_doi_dag()
