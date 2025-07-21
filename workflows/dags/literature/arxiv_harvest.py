import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.exceptions import AirflowException
from airflow.hooks.base import BaseHook
from airflow.macros import ds_add
from airflow.models.param import Param
from include.utils.alerts import task_failure_alert
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
    3. load_record: pushes records to the backoffice
    """

    conn = BaseHook.get_connection("arxiv_oaipmh_connection")
    sickle = Sickle(conn.host)

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
                return []
            return [record.raw for record in records]

        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.18"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
            multiple_outputs=True,
        )
        def build_records(records, **context):
            """Build the records from the arXiv xml response.

            Args: records list(str): The list of raw xml records from arXiv.
            Returns: list(dict): The list of parsed records.
            """
            from inspire_schemas.parsers.arxiv import ArxivParser

            parsed_records = []
            failed_records = []
            for record in records:
                try:
                    parsed_records.append(ArxivParser(record).parse())
                except Exception:
                    failed_records.append(record)
            return {"parsed_records": parsed_records, "failed_records": failed_records}

        @task
        def load_records(new_records):
            """Load the record to backoffice / trigger workflow DAG.

            Args: new_records list(dict): The records to load.
            """
            for record in new_records:
                logger.info(f"Loading record: {record.get('control_number')}")

        records = fetch_records(set)
        records = build_records(records)
        load_records(records["parsed_records"])

        return records["failed_records"]

    @task(task_id="summarize_failures")
    def check_failures(failed_records):
        """Check if there are any failed records and raise an exception if there are.

        Args: failed_records (list): The list of failed records.
        Raises: AirflowException: If there are any failed records.
        """
        failed_records = [item for sublist in failed_records for item in sublist]
        if len(failed_records) > 0:
            raise AirflowException(f"The following records failed: {failed_records}")

        logger.info("No failed records")

    sets = get_sets()
    failed_records = process_records.expand(set=sets)
    check_failures(failed_records)


arxiv_harvest_dag()
