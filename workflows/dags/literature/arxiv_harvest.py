import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.exceptions import AirflowException, AirflowSkipException
from airflow.hooks.base import BaseHook
from airflow.macros import ds_add
from airflow.models.param import Param
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.s3 import read_object, write_object
from sickle import Sickle, oaiexceptions

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

    workflow_management_hook = WorkflowManagementHook(HEP)

    conn = BaseHook.get_connection("arxiv_oaipmh_connection")
    sickle = Sickle(conn.host)
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    s3_conn = BaseHook.get_connection("s3_conn")
    bucket_name = Variable.get("s3_bucket_name")

    @task(task_id="get_sets")
    def get_sets(**context):
        """Collects the ids of the records that have been updated in the last two days.

        Returns: list of sets
        """
        return context["params"]["sets"]

    @task_group
    def process_records(set):
        """Process the record by downloading the versions,
        building the record and loading it to inspirehep.
        """

        @task
        def fetch_records(set=None, **context):
            """Fetch the xml records for a given set.

            Args: set (str): The arXiv set to fetch records from.
            Returns: list: The list of raw xml records.
            """

            from_date = context["params"]["from"] or ds_add(context["ds"], -1)
            until_date = context["params"]["until"]

            oaiargs = {
                "from": from_date,
                "metadataPrefix": context["params"]["metadata_prefix"],
            }

            if until_date:
                oaiargs["until"] = until_date

            logger.info(
                f"Collecting records from arXiv from {from_date} "
                f"to {until_date} for set '{set}'"
            )
            try:
                records = list(sickle.ListRecords(set=set, **oaiargs))
            except oaiexceptions.NoRecordsMatch:
                raise AirflowSkipException(f"No records for '{set}'") from None

            return write_object(
                s3_hook,
                {"records": [record.raw for record in records]},
                bucket_name=bucket_name,
            )

        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.19", "boto3"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
        )
        def build_records(records_key, s3_creds, bucket_name, **context):
            """Build the records from the arXiv xml response.

            Args: records list(str): The list of raw xml records from arXiv.
            Returns: list(dict): The list of parsed records.
            """

            import sys

            sys.path.append("/opt/airflow/plugins")

            from include.utils.s3 import (
                get_s3_client,
                read_object,
                write_object,
            )
            from inspire_schemas.parsers.arxiv import ArxivParser

            s3_client = get_s3_client(s3_creds)
            records_data = read_object(s3_client, records_key, bucket_name=bucket_name)

            parsed_records = []
            failed_records = []
            for record in records_data["records"]:
                try:
                    parsed_records.append(ArxivParser(record).parse())
                except Exception:
                    failed_records.append(record)

            return write_object(
                s3_client,
                {"parsed_records": parsed_records, "failed_records": failed_records},
                bucket_name=bucket_name,
            )

        @task
        def load_records(records_key):
            """Load the  to backoffice / trigger workflow DAG.

            Args: new_records list(dict): The records to load.
            """
            data = read_object(s3_hook, records_key, bucket_name=bucket_name)

            failed_records = []
            for record in data["parsed_records"]:
                logger.info(
                    f"Loading record: "
                    f"{record.get('arxiv_eprints',[{}])[0].get('value')}"
                )

                workflow_data = {
                    "data": record,
                    "workflow_type": "HEP_CREATE",
                }
                try:
                    logger.info(f"Loading record: {record.get('control_number')}")
                    workflow_management_hook.post_workflow(
                        workflow_data=workflow_data,
                    )
                except Exception:
                    logger.error(
                        f"Failed to load record: {record.get('control_number')}"
                    )
                    failed_records.append(record)

            return write_object(
                s3_hook,
                {"failed_records": failed_records},
                bucket_name=bucket_name,
            )

        record_keys = fetch_records(set)
        build_record_keys = build_records(
            record_keys,
            s3_creds={
                "user": s3_conn.login,
                "secret": s3_conn.password,
                "host": s3_conn.extra_dejson.get("endpoint_url"),
            },
            bucket_name=bucket_name,
        )
        failed_load_record_keys = load_records(build_record_keys)

        return build_record_keys, failed_load_record_keys

    @task(task_id="check_failures")
    def check_failures(build_record_keys, failed_load_record_keys):
        """Check if there are any failed records and raise an exception if there are.

        Args: failed_records (list): The list of failed records.
        Raises: AirflowException: If there are any failed records.
        """

        def gather_failed_records(all_record_keys):
            """Gather all failed records from the given keys."""
            failed_records = []
            for key in all_record_keys:
                failed_records += read_object(s3_hook, key, bucket_name=bucket_name)[
                    "failed_records"
                ]
            return failed_records

        all_record_keys = build_record_keys + failed_load_record_keys
        failed_records = gather_failed_records(all_record_keys)

        if len(failed_records) > 0:
            raise AirflowException(f"The following records failed: {failed_records}")

        logger.info("No failed records")

    sets = get_sets()
    build_record_keys, failed_load_record_keys = process_records.expand(set=sets)
    check_failures(build_record_keys, failed_load_record_keys)


arxiv_harvest_dag()
