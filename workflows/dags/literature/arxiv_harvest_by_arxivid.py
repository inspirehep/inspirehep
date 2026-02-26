import logging

from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Param, dag, task
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.arxiv import build_records, fetch_record_by_id, load_records
from include.utils.s3 import write_object
from literature.check_failures_task import check_failures

logger = logging.getLogger(__name__)


@dag(
    catchup=False,
    tags=["literature", "arxiv", "harvest"],
    params={
        "arxiv_ids": Param(
            type="array",
            default=[],
        ),
        "metadata_prefix": Param(type=["null", "string"], default="arXiv"),
    },
    on_failure_callback=FailedDagNotifier(),
)
def arxiv_harvest_by_arxivid_dag():
    """Defines the DAG for the arXiv harvest workflow.

    Tasks:
    1. fetch_records: fetches records from arXiv using OAI-PMH protocol for each set.
    2. build_records: converts the raw XML records into json using the ArxivParser.
    3. load_record: pushes records to the backoffice
    4. check_failures: checks and reports any failed records
    """

    @task
    def get_arxiv_ids(**context):
        """Collects the ids of the records that have been updated in the last two days.

        Returns: list of sets
        """
        return context["params"]["arxiv_ids"]

    @task
    def process_records(arxiv_ids, **context):
        """Process the record by downloading the versions,
        building the record and loading it to inspirehep.
         Args: set (str): The arXiv set to fetch records from.
        """

        workflow_management_hook = WorkflowManagementHook(HEP)

        s3_hook = S3Hook(aws_conn_id="s3_conn")

        xml_records = []
        for arxiv_id in arxiv_ids:
            xml_records.append(
                fetch_record_by_id(
                    connection_id="arxiv_oaipmh_connection",
                    metadata_prefix=context["params"]["metadata_prefix"],
                    arxiv_id=arxiv_id,
                )
            )

        parsed_records, failed_build_records = build_records(
            xml_records, context["run_id"]
        )

        failed_load_records = load_records(parsed_records, workflow_management_hook)

        return write_object(
            s3_hook,
            {
                "failed_build_records": failed_build_records,
                "failed_load_records": failed_load_records,
            },
        )

    arxiv_ids = get_arxiv_ids()
    failed_load_record_key = process_records(arxiv_ids)
    check_failures(failed_load_record_key)


arxiv_harvest_by_arxivid_dag()
