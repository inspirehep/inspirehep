import datetime
import logging
from datetime import timedelta

from airflow.decorators import dag, task
from airflow.models import Variable
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="@daily",
    catchup=False,
    tags=["data"],
)
def data_harvest_dag():
    """
    Initialize a DAG for data harvest workflow.
    """
    generic_http_hook = GenericHttpHook(http_conn_id="hepdata_connection")
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    data_schema = Variable.get("data_schema")

    @task
    def collect_ids():
        from_date = (datetime.datetime.now().date() - timedelta(days=1)).strftime(
            "%Y-%m-%d"
        )
        # http sensor
        payload = {"inspire_ids": True, "last_updated": from_date, "sort_by": "latest"}
        hepdata_response = generic_http_hook.call_api(
            endpoint="/search/ids", method="GET", params=payload
        )

        return hepdata_response.json()

    @task(map_index_template="{{id}}")
    def download_record(id):
        hepdata_response = generic_http_hook.call_api(
            endpoint=f"/record/ins{id}?format=json", method="GET"
        )
        return hepdata_response.json()

    @task.virtualenv(requirements=["inspire-schemas"], system_site_packages=False)
    def transform_record(data_schema, record):
        from inspire_schemas.builders import LiteratureBuilder

        builder = LiteratureBuilder()

        data = builder.record
        data["$schema"] = data_schema
        data.update({"_collections": ["Data"]})  # to delete

        return data

    @task
    def load_record(record):
        inspire_http_record_management_hook.post_record(data=record, pid_type="data")

    ids = collect_ids()
    records = download_record.expand(id=ids)
    built_records = transform_record.partial(data_schema=data_schema).expand(
        record=records
    )
    load_record.expand(record=built_records)


data_harvest_dag()
