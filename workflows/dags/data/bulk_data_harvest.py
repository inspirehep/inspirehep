import datetime
import logging

from airflow.decorators import dag, task
from airflow.exceptions import AirflowException
from airflow.macros import ds_add
from airflow.models import Variable
from airflow.models.param import Param
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from inspire_utils.dedupers import dedupe_list
from tenacity import RetryError

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2021, 1, 1),
    schedule=None,
    catchup=False,
    max_active_runs=5,
    tags=["data"],
    params={
        "last_updated_from": Param(type=["null", "string"], default=""),
        "last_updated_to": Param(type=["null", "string"], default=""),
    },
)
def bulk_data_harvest_dag():
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
    inspire_http_hook = InspireHttpHook()

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
            else ds_add(context["ds"], -366)
        )
        to_date = (
            context["params"]["last_updated_to"]
            if context["params"]["last_updated_from"]
            else context["ds"]
        )

        payload = {"inspire_ids": True, "last_updated": from_date, "sort_by": "latest"}
        hepdata_response = generic_http_hook.call_api(
            endpoint="/search/ids", method="GET", params=payload
        )
        payload = {
            "inspire_ids": True,
            "last_updated": to_date,
            "sort_by": "latest",
        }
        hepdata_to_response = generic_http_hook.call_api(
            endpoint="/search/ids", method="GET", params=payload
        )
        return list(set(hepdata_response.json()) - set(hepdata_to_response.json()))

    @task
    def download_record_versions(ids):
        """Download the versions of the record.

        Args: id (int): The id of the record.
        Returns: dict: The record versions.
        """
        payloads = []
        for id in ids:
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
            payloads.append(record)

        return payloads

    @task.virtualenv(
        requirements=["inspire-schemas==61.6.9"],
        system_site_packages=False,
    )
    def build_records(data_schema, inspire_url, payloads, **context):
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

        inspire_records = []
        for payload in payloads:
            builder = DataBuilder(source="HEPData")

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
                    doi=doi,
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

            inspire_records.append(data)
        return inspire_records

    @task
    def normalize_collaborations(records):
        """Normalize the collaborations in the record.

        Args: record (dict): The record to normalize.
        Returns: dict: The normalized record.
        """
        normalized_records = []
        for record in records:
            collaborations = record.get("collaborations", [])

            if not collaborations:
                continue

            response = inspire_http_hook.call_api(
                endpoint="api/curation/literature/collaborations-normalization",
                method="GET",
                data={"collaborations": collaborations},
            )
            response.raise_for_status()
            obj_accelerator_experiments = record.get("accelerator_experiments", [])
            normalized_accelerator_experiments = response.json()[
                "accelerator_experiments"
            ]

            if normalized_accelerator_experiments or obj_accelerator_experiments:
                record["accelerator_experiments"] = dedupe_list(
                    obj_accelerator_experiments + normalized_accelerator_experiments
                )
                record["collaborations"] = response.json()["normalized_collaborations"]

            normalized_records.append(record)
        return normalized_records

    @task
    def load_records(new_records):
        """Load the record to inspirehep.

        Args: new_record (dict): The record to create or update in inspire
        """

        responses = []

        for new_record in new_records:
            try:
                response = inspire_http_record_management_hook.get_record(
                    pid_type="doi", control_number=new_record["dois"][0]["value"]
                )
            except AirflowException:
                try:
                    logger.info("Creating Record")
                    post_response = inspire_http_record_management_hook.post_record(
                        data=new_record, pid_type="data"
                    )
                    logger.info(
                        f"Data Record Created: "
                        f"{post_response.json()['metadata']['self']['$ref']}"
                    )
                    responses.append(post_response.json())
                except RetryError:
                    logger.info(
                        f"Unable to create data record with doi "
                        f"{new_record['dois'][0]['value']}"
                    )
                continue

            old_record = response["metadata"]
            revision_id = response.get("revision_id", 0)
            old_record.update(new_record)
            logger.info(f"Updating Record: {old_record['control_number']}")
            try:
                update_response = inspire_http_record_management_hook.update_record(
                    data=old_record,
                    pid_type="data",
                    control_number=old_record["control_number"],
                    revision_id=revision_id + 1,
                )
                logger.info(
                    f"Data Record Updated: "
                    f"{update_response.json()['metadata']['self']['$ref']}"
                )
            except (RetryError, AirflowException):
                logger.info(
                    f"Unable to update data record {old_record['control_number']}"
                )
            responses.append(update_response.json())

        return responses

    hepdata_record_versions = download_record_versions(collect_ids())
    records = build_records(
        data_schema=data_schema, inspire_url=url, payloads=hepdata_record_versions
    )
    records = normalize_collaborations(records)
    load_records(records)


bulk_data_harvest_dag()
