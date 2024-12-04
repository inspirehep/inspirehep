import datetime
import logging
from datetime import timedelta

from airflow.decorators import dag, task, task_group
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
def data_harvest_dag_task_group():
    """
    Initialize a DAG for data harvest workflow.
    """
    generic_http_hook = GenericHttpHook(http_conn_id="hepdata_connection")
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    data_schema = Variable.get("data_schema")

    @task(task_id="collect_ids")
    def collect_ids(**context):
        print("asasda")
        print(context)
        from_date = (datetime.datetime.now().date() - timedelta(days=2)).strftime(
            "%Y-%m-%d"
        )
        payload = {"inspire_ids": True, "last_updated": from_date, "sort_by": "latest"}
        hepdata_response = generic_http_hook.call_api(
            endpoint="/search/ids", method="GET", params=payload
        )

        return hepdata_response.json()

    @task_group
    def process_record(id):
        @task
        def download_record_versions(id):
            hepdata_response = generic_http_hook.call_api(
                endpoint=f"/record/ins{id}?format=json", method="GET"
            )
            hepdata_response.raise_for_status()
            payload = hepdata_response.json()

            record = {"base": payload}

            for version in range(1, payload["record"]["version"]):
                response = generic_http_hook.call_api(
                    endpoint=f"/record/ins{id}?format=json&version={version}"
                )
                record[version] = response.json()

            return record

        @task.virtualenv(
            requirements=["inspire-schemas"],
            system_site_packages=False,
            map_index_template="{{task.task_id}}",
        )
        def build_record(data_schema, payload, **context):
            import datetime
            import re

            from inspire_schemas.builders import DataBuilder

            print("asasda")
            print(context)

            print(payload)

            def add_version_specific_dois(record, builder):
                for data_table in record["data_tables"]:
                    builder.add_doi(data_table["doi"], material="part")
                for resource_with_doi in record["resources_with_doi"]:
                    builder.add_doi(resource_with_doi["doi"], material="part")

                builder.add_doi(record["record"]["hepdata_doi"], material="version")

            builder = DataBuilder(source="hepdata")

            base_record = payload["base"]

            for collaboration in base_record["record"]["collaborations"]:
                builder.add_collaboration(collaboration)
                # builder.add_accelerator_experiment(derived(collaboration))

            builder.add_abstract(base_record["record"]["data_abstract"])

            # not exactly as micha wants
            for keyword, item in base_record["record"]["data_keywords"].items():
                builder.add_keyword(keyword, item)

            builder.add_literature(
                doi=base_record["record"]["doi"],
                record={
                    "$ref": f"https://inspirehep.net/literature/{base_record['record']['inspire_id']}"
                },
            )

            for resource in base_record["record"]["resources"]:
                if resource["url"].startswith(
                    "https://www.hepdata.net/record/resource/"
                ):
                    continue
                builder.add_url(resource["url"], description=resource["description"])

            builder.add_title(base_record["record"]["title"])

            builder.add_acquisition_source(
                method="hepdata_harvest",
                submission_number=base_record["record"]["inspire_id"],
                datetime=datetime.datetime.now(datetime.UTC).isoformat(),
            )

            mtc = re.match(r"(.*?)\.v\d+", base_record["record"]["hepdata_doi"])

            if mtc:
                builder.add_doi(doi=mtc.group(1), material="data")
            else:
                builder.add_doi(
                    doi=base_record["record"]["hepdata_doi"], material="data"
                )

            print("hepdata_doi", base_record["record"]["hepdata_doi"])
            if str(base_record["record"]["hepdata_doi"]) == "10.17182/hepdata.156054":
                print("WWWWWWWWWWWW")
                quit()

            for _, record_version in payload.items():
                add_version_specific_dois(record_version, builder)

            data = builder.record
            data["$schema"] = data_schema
            return data

        @task
        def load_record(record):
            # must also check if its an update
            inspire_http_record_management_hook.post_record(
                data=record, pid_type="data"
            )

        hepdata_record_versions = download_record_versions(id)
        record = build_record(data_schema=data_schema, payload=hepdata_record_versions)
        load_record(record)

        # download_record_versions >> build_record >> load_record

    process_record.expand(id=collect_ids())


data_harvest_dag_task_group()
