import logging

from airflow.sdk.exceptions import AirflowException
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from inspire_schemas.parsers.hepdata import HEPDataParser

logger = logging.getLogger(__name__)

generic_http_hook = GenericHttpHook(http_conn_id="hepdata_connection")


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


def build_record(data_schema, payload):
    """Build the record from the payload.

    Args: data_schema (str): The schema of the data.
            payload (dict): The payload of the record.

    Returns: dict: The built record.
    """

    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    inspire_url = inspire_http_record_management_hook.get_url()

    parser = HEPDataParser(payload, inspire_url)
    data = parser.parse()
    data["$schema"] = data_schema
    return data


def load_record(new_record):
    """Load the record to inspirehep.

    Args: new_record (dict): The record to create or update in inspire
    """
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

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
        f"Data Record Updated: " f"{response.json()['metadata']['self']['$ref']}"
    )
    return response.json()
