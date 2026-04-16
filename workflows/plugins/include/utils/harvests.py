import logging

from airflow.sdk.bases.hook import BaseHook
from airflow.sdk.exceptions import AirflowSkipException
from sickle import Sickle, oaiexceptions

logger = logging.getLogger(__name__)


def load_records(
    parsed_records,
    workflow_management_hook,
    workflow_type,
):
    """Load built records into backoffice workflows.

    Args:
        parsed_records (list): Built records to load.
        workflow_management_hook: Hook used to create workflows in backoffice.
        workflow_type (str): Workflow type assigned to each created workflow.

    Returns:
        list: Records that failed to load.
    """
    failed_load_records = []
    for record in parsed_records:
        workflow_data = {
            "data": record,
            "workflow_type": workflow_type,
        }
        try:
            workflow_management_hook.post_workflow(
                workflow_data=workflow_data,
            )
        except Exception:
            logger.exception(f"Failed to load record: {record}")
            failed_load_records.append(record)

    return failed_load_records


def fetch_records_oaipmh(
    connection_id, metadata_prefix, sets, from_date, until_date=None
):
    """Fetch the xml records for the given sets and date range from an OAI-PMH endpoint.
    Args:
        connection_id (str): The connection id for the OAI-PMH server.
        metadata_prefix (str): The metadata prefix to use.
        sets (list): The sets to fetch records from.
        from_date (str): The date from which to fetch records (YYYY-MM-DD).
        until_date (str, optional): The date until which to fetch records (YYYY-MM-DD).
    Returns:
        list: A list of xml records.
    """

    conn = BaseHook.get_connection(connection_id)
    sickle = Sickle(conn.host, max_retries=5)
    oaiargs = {
        "from": from_date,
        "metadataPrefix": metadata_prefix,
    }

    if until_date:
        oaiargs["until"] = until_date

    harvested_records = {}

    for set_name in sets:
        try:
            logger.info(
                f"Collecting records using connection '{connection_id}' "
                f"({conn.host}) from {from_date} to {until_date} for set '{set_name}'"
            )

            records = list(sickle.ListRecords(set=set_name, **oaiargs))

        except oaiexceptions.NoRecordsMatch:
            logger.info(f"No records for '{set_name}'")
            continue

        logger.info(f"Collected {len(records)} records for set '{set_name}'")
        for record in records:
            harvested_records[record.header.identifier] = record

    return [record.raw for record in harvested_records.values()]


def fetch_record_oaipmh_by_identifier(connection_id, metadata_prefix, identifier):
    """Fetch a single xml record by its OAI-PMH identifier."""

    conn = BaseHook.get_connection(connection_id)
    sickle = Sickle(conn.host, max_retries=5)

    oaiargs = {
        "identifier": identifier,
        "metadataPrefix": metadata_prefix,
    }

    logger.info(
        f"Collecting record using connection '{connection_id}' "
        f"({conn.host}) for identifier '{identifier}'"
    )
    try:
        record = sickle.GetRecord(**oaiargs)
    except oaiexceptions.IdDoesNotExist:
        raise AirflowSkipException(f"No record for identifier '{identifier}'") from None

    return record.raw
