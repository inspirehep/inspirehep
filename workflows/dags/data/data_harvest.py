import datetime
import logging

from airflow.decorators import dag, task, task_group
from airflow.macros import ds_add
from airflow.models import Variable
from airflow.models.param import Param
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from tenacity import RetryError

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="@daily",
    catchup=False,
    tags=["data"],
    max_active_runs=5,
    params={"last_updated": Param(type=["null", "string"], default="")},
)
def data_harvest_dag():
    """Defines the DAG for the HEPData harvest workflow.

    Tasks:
    1. collect_ids: Obtains all new data ids to process.
    2. download_record_versions: fetches a data record and all its previous versions
    3. build_record: Build a record that is compatible with the INSPIRE data schema
    4. load_record: Creates or Updates the record on INSPIRE.
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
            context["params"]["last_updated"]
            if context["params"]["last_updated"]
            else ds_add(context["ds"], -1)
        )
        payload = {"inspire_ids": True, "last_updated": from_date, "sort_by": "latest"}
        hepdata_response = generic_http_hook.call_api(
            endpoint="/search/ids", method="GET", params=payload
        )

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

        @task.virtualenv(
            requirements=["inspire-schemas"],
            system_site_packages=False,
        )
        def build_record(data_schema, inspire_url, payload, **context):
            """Build the record from the payload.

            Args: data_schema (str): The schema of the data.
                    payload (dict): The payload of the record.

            Returns: dict: The built record.
            """
            import datetime
            import re

            from inspire_schemas.builders import DataBuilder

            def add_version_specific_dois(record, builder):
                """Add dois to the record."""
                for data_table in record["data_tables"]:
                    builder.add_doi(data_table["doi"], material="part")
                for resource_with_doi in record["resources_with_doi"]:
                    builder.add_doi(resource_with_doi["doi"], material="part")

                builder.add_doi(record["record"]["hepdata_doi"], material="version")

            def add_keywords(record, builder):
                """Add keywords to the record."""
                for keyword, item in record.get("data_keywords", {}).items():
                    if keyword == "cmenergies":
                        if len(item) >= 1 and "lte" in item[0] and "gte" in item[0]:
                            builder.add_keyword(
                                f"{keyword}: {item[0]['lte']}-{item[0]['gte']}"
                            )
                    elif keyword == "observables":
                        for value in item:
                            builder.add_keyword(f"observables: {value}")
                    else:
                        for value in item:
                            builder.add_keyword(value)

            builder = DataBuilder(source="inspirehep")

            builder.add_creation_date(datetime.datetime.now(datetime.UTC).isoformat())

            base_record = payload["base"]

            for collaboration in base_record["record"]["collaborations"]:
                builder.add_collaboration(collaboration)

            builder.add_abstract(base_record["record"]["data_abstract"])

            add_keywords(base_record["record"], builder)

            doi = base_record["record"].get("doi")
            inspire_id = base_record["record"]["inspire_id"]

            if doi:
                builder.add_literature(
                    doi={"value": doi},
                    record={"$ref": f"{inspire_url}/api/literature/{inspire_id}"},
                )
            else:
                builder.add_literature(
                    record={"$ref": f"{inspire_url}/api/literature/{inspire_id}"},
                )

            for resource in base_record["record"]["resources"]:
                if resource["url"].startswith(
                    "https://www.hepdata.net/record/resource/"
                ):
                    continue
                builder.add_url(resource["url"], description=resource["description"])

            builder.add_title(base_record["record"]["title"])

            builder.add_acquisition_source(
                method="inspirehep",
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

            for _, record_version in payload.items():
                add_version_specific_dois(record_version, builder)

            data = builder.record
            data["$schema"] = data_schema
            return data

        @task
        def load_record(new_record):
            """Load the record to inspirehep.

            Args: new_record (dict): The record to create or update in inspire
            """

            try:
                response = inspire_http_record_management_hook.get_record(
                    pid_type="doi", control_number=new_record["dois"][0]["value"]
                )
            except RetryError:
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
        load_record(record)

    process_record.expand(record_id=collect_ids())


data_harvest_dag()
