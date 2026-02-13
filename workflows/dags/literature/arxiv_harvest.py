import datetime
import logging

from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Param, dag, task
from airflow.sdk.execution_time.macros import ds_add
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.arxiv import build_records, fetch_records, load_records
from include.utils.s3 import write_object
from literature.check_failures_task import check_failures

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="0 2 * * *",
    catchup=False,
    tags=["literature", "arxiv", "harvest"],
    params={
        "metadata_prefix": Param(type=["null", "string"], default="arXiv"),
        "from": Param(type=["null", "string"], default=None),
        "until": Param(type=["null", "string"], default=None),
        "sets": Param(
            type="array",
            default=[
                "cs",
                "econ",
                "eess",
                "math",
                "physics",
                "physics:astro-ph",
                "physics:cond-mat",
                "physics:gr-qc",
                "physics:hep-ex",
                "physics:hep-lat",
                "physics:hep-ph",
                "physics:hep-th",
                "physics:math-ph",
                "physics:nlin",
                "physics:nucl-ex",
                "physics:nucl-th",
                "physics:physics",
                "physics:quant-ph",
                "q-bio",
                "q-fin",
                "stat",
            ],
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def arxiv_harvest_dag():
    """Defines the DAG for the arXiv harvest workflow.

    Tasks:
    1. fetch_records: fetches records from arXiv using OAI-PMH protocol for each set.
    2. build_records: converts the raw XML records into json using the ArxivParser.
    3. load_record: pushes records to the backoffice
    4. check_failures: checks and reports any failed records
    """

    @task
    def get_sets(**context):
        """Collects the ids of the records that have been updated in the last two days.

        Returns: list of sets
        """
        return context["params"]["sets"]

    @task
    def process_records(sets, **context):
        """Process the record by downloading the versions,
        building the record and loading it to inspirehep.
         Args: set (str): The arXiv set to fetch records from.
        """

        workflow_management_hook = WorkflowManagementHook(HEP)

        s3_hook = S3Hook(aws_conn_id="s3_conn")

        from_date = context["params"]["from"] or ds_add(context["ds"], -1)
        until_date = context["params"]["until"]

        xml_records = fetch_records(
            connection_id="arxiv_oaipmh_connection",
            metadata_prefix=context["params"]["metadata_prefix"],
            from_date=from_date,
            until_date=until_date,
            sets=sets,
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

    sets = get_sets()
    failed_load_record_key = process_records(sets)
    check_failures(failed_load_record_key)


arxiv_harvest_dag()
