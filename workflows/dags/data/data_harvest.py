import datetime
import logging
import time

from airflow.sdk import Param, Variable, dag, task
from airflow.sdk.execution_time.macros import ds_add
from hooks.generic_http_hook import GenericHttpHook
from include.utils import workflows
from include.utils.alerts import FailedDagNotifier
from include.utils.data import (
    build_record,
    delay_calculator,
    download_record_versions,
    load_record,
)
from include.utils.s3 import S3JsonStore
from literature.check_failures_task import check_failures

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
        generic_http_hook = GenericHttpHook(http_conn_id="hepdata_connection")
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

    @task
    def process_records(record_ids, **context):
        """Process the record by downloading the versions,
        building the record and loading it to inspirehep.
        """

        failed_records = {
            "download_failed": [],
            "build_failed": [],
            "load_failed": [],
            "normalize_failed": [],
        }

        s3_json_store = S3JsonStore(aws_conn_id="s3_conn")

        data_schema = Variable.get("data_schema")
        hepdata_records = []

        delay = delay_calculator(len(record_ids))

        logger.info(f"Processing {len(record_ids)} records.")
        for record_id in record_ids:
            try:
                hepdata_records.append(download_record_versions(record_id))
                time.sleep(delay)
            except Exception as e:
                logger.error(
                    f"Error occurred while downloading "
                    f"versions for record {record_id}: {e}"
                )
                failed_records["download_failed"].append(record_id)

        logger.info(f"Retrieved HEPData records for {len(hepdata_records)} records.")

        data_records = []
        for hepdata_record in hepdata_records:
            hepdata_record_id = hepdata_record["base"]["record"]["id"]
            try:
                data_record = build_record(data_schema, hepdata_record)
            except Exception as e:
                logger.error(
                    f"Error occurred while building " f"record {hepdata_record_id}: {e}"
                )
                failed_records["build_failed"].append(hepdata_record_id)
                continue

            try:
                normalizations = workflows.normalize_collaborations(data_record)
                if normalizations:
                    accelerator_experiments, normalized_collaborations = normalizations
                    data_record["accelerator_experiments"] = accelerator_experiments
                    data_record["collaborations"] = normalized_collaborations

                logger.info(f"Normalized collaborations for record {data_record}.")
            except Exception as e:
                logger.error(
                    f"Error occurred while normalizing collaborations "
                    f"for record {data_record}: {e}"
                )
                failed_records["normalize_failed"].append(hepdata_record_id)
                continue

            data_records.append(data_record)

        for data_record in data_records:
            try:
                load_record(data_record)
            except Exception as e:
                logger.error(f"Error occurred while loading record {data_record}: {e}")
                failed_records["load_failed"].append(data_record)

        return s3_json_store.write_object(
            failed_records, f"harvests/data/{context['run_id']}.json"
        )

    collected_ids_key = collect_ids()
    failed_records_key = process_records(collected_ids_key)

    check_failures(
        failed_records_key,
    )


data_harvest_dag()
