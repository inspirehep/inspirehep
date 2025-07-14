import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.exceptions import AirflowException, AirflowSkipException
from airflow.hooks.base import BaseHook
from airflow.models.param import Param
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from include.utils.alerts import task_failure_alert
from include.utils.s3 import read_dict_from_s3, write_dict_to_s3
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
    on_failure_callback=task_failure_alert,
)
def arxiv_harvest_dag():
    """Defines the DAG for the arXiv harvest workflow.

    Tasks:
    1. fetch_records: fetches records from arXiv using OAI-PMH protocol for each set.
    2. build_records: converts the raw XML records into json using the ArxivParser.
    3. load_record: ???
    """

    conn = BaseHook.get_connection("arxiv_oaipmh_connection")
    sickle = Sickle(conn.host)
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    s3_conn = BaseHook.get_connection("s3_conn")

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

            from_date = context["params"]["from"] or context["ds"]
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

            return write_dict_to_s3(
                s3_hook, {"records": [record.raw for record in records]}
            )

        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.18", "boto3"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
        )
        def build_records(records_key, s3_creds, **context):
            """Build the records from the arXiv xml response.

            Args: records list(str): The list of raw xml records from arXiv.
            Returns: list(dict): The list of parsed records.
            """

            import sys

            sys.path.append("/opt/airflow/plugins")

            from include.utils.s3 import (
                get_s3_client,
                read_dict_from_s3_client,
                write_dict_to_s3_client,
            )
            from inspire_schemas.parsers.arxiv import ArxivParser

            s3_client = get_s3_client(s3_creds)
            records_data = read_dict_from_s3_client(s3_client, records_key)

            parsed_records = []
            failed_records = []
            for record in records_data["records"]:
                try:
                    parsed_records.append(ArxivParser(record).parse())
                except Exception:
                    failed_records.append(record)

            return write_dict_to_s3_client(
                s3_client,
                {"parsed_records": parsed_records, "failed_records": failed_records},
            )

        @task
        def load_records(records_key):
            """Load the  to backoffice / trigger workflow DAG.

            Args: new_records list(dict): The records to load.
            """
            data = read_dict_from_s3(s3_hook, records_key)

            for record in data["parsed_records"]:
                logger.info(
                    f"Loading record: "
                    f"{record.get('arxiv_eprints',[{}])[0].get('value')}"
                )

        record_keys = fetch_records(set)
        record_keys_records = build_records(
            record_keys,
            s3_creds={
                "user": s3_conn.login,
                "secret": s3_conn.password,
                "host": s3_conn.extra_dejson.get("endpoint_url"),
            },
        )
        load_records(record_keys_records)

        return record_keys_records

    @task(task_id="summarize_failures")
    def check_failures(record_keys):
        """Check if there are any failed records and raise an exception if there are.

        Args: failed_records (list): The list of failed records.
        Raises: AirflowException: If there are any failed records.
        """
        failed_records = []

        for key in record_keys:
            failed_records += read_dict_from_s3(s3_hook, key)["failed_records"]

        if len(failed_records) > 0:
            raise AirflowException(f"The following records failed: {failed_records}")

        logger.info("No failed records")

    sets = get_sets()
    record_keys_records = process_records.expand(set=sets)
    check_failures(record_keys_records)


arxiv_harvest_dag()
