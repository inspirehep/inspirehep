import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.exceptions import AirflowException
from airflow.macros import ds_add
from airflow.models import Variable
from airflow.sdk import Param
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils import workflows
from include.utils.alerts import FailedDagNotifier
from inspire_schemas.parsers.hepdata import HEPDataParser

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="@daily",
    catchup=False,
    tags=["data"],
    params={
        "last_updated_from": Param(type=["null", "string"], default=""),
        "last_updated_to": Param(type=["null", "string"], default=""),
    },
    on_failure_callback=FailedDagNotifier(),
)
def data_harvest_dag():
    """Defines the DAG for the HEPData harvest workflow.

    Tasks:
    1. collect_ids: Obtains all new data ids to process.
    2. download_record_versions: fetches a data record and all its previous versions
    3. build_record: Build a record that is compatible with the INSPIRE data schema
    4. normalize_collaborations: Normalize the collaborations in the record.
    5. load_record: Creates or Updates the record on INSPIRE.
    """
    generic_http_hook = GenericHttpHook(http_conn_id="hepdata_connection")
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    data_schema = Variable.get("data_schema")
    url = inspire_http_record_management_hook.get_url()

    @task(task_id="collect_ids")
    def collect_ids(**context):
        """Collects the ids of the records that have been updated in the last two days.

        Returns: list of ids
        """
        from_date = (
            context["params"]["last_updated_from"]
            if context["params"]["last_updated_from"]
            else ds_add(context["ds"], -2)
        )
        to_date = context["params"]["last_updated_to"]

        payload = {"inspire_ids": True, "last_updated": from_date, "sort_by": "latest"}
        hepdata_response = generic_http_hook.call_api(
            endpoint="/search/ids", method="GET", params=payload
        )
        if to_date:
            payload = {
                "inspire_ids": True,
                "last_updated": to_date,
                "sort_by": "latest",
            }
            hepdata_to_response = generic_http_hook.call_api(
                endpoint="/search/ids", method="GET", params=payload
            )
            return list(set(hepdata_response.json()) - set(hepdata_to_response.json()))

        return hepdata_response.json()

    @task_group
    def process_record(record_id):
        """Process the record by downloading the versions,
        building the record and loading it to inspirehep.
        """

        @task(max_active_tis_per_dag=5)
        def download_record_versions(id):
            """Download the versions of the record.

            Args: id (int): The id of the record.
            Returns: dict: The record versions.
            """
            hepdata_response = generic_http_hook.call_api(
                endpoint=f"/record/ins{id}?format=json"
            )
            payload = hepdata_response.json()

            record = {"base": payload}
            for version in range(1, payload["record"]["version"]):
                response = generic_http_hook.call_api(
                    endpoint=f"/record/ins{id}?format=json&version={version}"
                )
                response.raise_for_status()
                record[version] = response.json()

            return record

        @task
        def build_record(data_schema, inspire_url, payload, **context):
            """Build the record from the payload.

            Args: data_schema (str): The schema of the data.
                    payload (dict): The payload of the record.

            Returns: dict: The built record.
            """
            parser = HEPDataParser(payload, inspire_url)
            data = parser.parse()
            data["$schema"] = data_schema
            return data

        @task
        def normalize_collaborations(record):
            """Normalize the collaborations in the record.

            Args: record (dict): The record to normalize.
            Returns: dict: The normalized record.
            """
            normalizations = workflows.normalize_collaborations(record)

            if normalizations:
                accelerator_experiments, normalized_collaborations = normalizations
                record["accelerator_experiments"] = accelerator_experiments
                record["collaborations"] = normalized_collaborations
            return record

        @task
        def load_record(new_record):
            """Load the record to inspirehep.

            Args: new_record (dict): The record to create or update in inspire
            """

            try:
                response = inspire_http_record_management_hook.get_record(
                    pid_type="doi", control_number=new_record["dois"][0]["value"]
                )
            except AirflowException:
                logger.info("Creating Record")
                post_response = inspire_http_record_management_hook.post_record(
                    data=new_record, pid_type="data"
                )
                logger.info(
                    f"Data Record Created: "
                    f"{post_response.json()['metadata']['self']['$ref']}"
                )
                return post_response.json()

            old_record = response["metadata"]
            revision_id = response.get("revision_id", 0)
            old_record.update(new_record)
            logger.info(f"Updating Record: {old_record['control_number']}")
            response = inspire_http_record_management_hook.update_record(
                data=old_record,
                pid_type="data",
                control_number=old_record["control_number"],
                revision_id=revision_id + 1,
            )
            logger.info(
                f"Data Record Updated: "
                f"{response.json()['metadata']['self']['$ref']}"
            )
            return response.json()

        hepdata_record_versions = download_record_versions(record_id)
        record = build_record(
            data_schema=data_schema, inspire_url=url, payload=hepdata_record_versions
        )
        record = normalize_collaborations(record)
        load_record(record)

    process_record.expand(record_id=collect_ids())


data_harvest_dag()
