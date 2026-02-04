import datetime
import logging

from airflow.exceptions import AirflowSkipException
from airflow.sdk.bases.hook import BaseHook
from include.utils.constants import HEP_CREATE
from inspire_schemas.parsers.arxiv import ArxivParser
from sickle import Sickle, oaiexceptions

logger = logging.getLogger(__name__)


def fetch_records(
    connection_id, metadata_prefix, from_date, until_date=None, sets=None
):
    """Fetch the xml records a given set of sets.
    Args:
        connection_id (str): The connection id for the OAI-PMH server.
        metadata_prefix (str): The metadata prefix to use.
        from_date (str): The date from which to fetch records (YYYY-MM-DD).
        until_date (str, optional): The date until which to fetch records (YYYY-MM-DD).
        sets (str): The set to fetch records from. Defaults to 'arXiv'.
    Returns:
        list: A list of xml records.
    """

    conn = BaseHook.get_connection(connection_id)
    sickle = Sickle(conn.host)

    oaiargs = {
        "from": from_date,
        "metadataPrefix": metadata_prefix,
    }

    if until_date:
        oaiargs["until"] = until_date

    harvested_records = {}

    for set in sets:
        try:
            logger.info(
                f"Collecting records from arXiv from {from_date} "
                f"to {until_date} for set '{set}'"
            )
            for record in list(sickle.ListRecords(set=set, **oaiargs)):
                harvested_records[record.header.identifier] = record

        except oaiexceptions.NoRecordsMatch:
            raise AirflowSkipException(f"No records for '{set}'") from None

    return [record.raw for record in harvested_records.values()]


def fetch_record_by_id(connection_id, metadata_prefix, arxiv_id):
    """Fetch a single xml record by its arXiv id.
    Args:
        arxiv_id (str): The arXiv id of the record to fetch.
    Returns:
        str: The xml record.
    """

    conn = BaseHook.get_connection(connection_id)
    sickle = Sickle(conn.host)

    oaiargs = {
        "identifier": f"oai:arXiv.org:{arxiv_id}",
        "metadataPrefix": metadata_prefix,
    }

    logger.info(f"Collecting record from arXiv with id '{arxiv_id}'")
    try:
        record = sickle.GetRecord(**oaiargs)
    except oaiexceptions.IdDoesNotExist:
        raise AirflowSkipException(f"No record for id '{arxiv_id}'") from None

    return record.raw


def build_records(xml_records, submission_number):
    """Build the records from the arXiv xml response.
    Args:
        xml_records (list): The list of xml records.
        submission_number (str): The submission number for the acquisition source.
    Returns:
        tuple: A tuple containing the list of parsed records and failed records.
    """
    parsed_records = []
    failed_build_records = []
    for record in xml_records:
        try:
            parsed_object = ArxivParser(record)
            parsed_object.parse()
            parsed_object.builder.add_acquisition_source(
                source="arXiv",
                method="hepcrawl",
                date=datetime.datetime.now().isoformat(),
                submission_number=submission_number,
            )
            parsed_records.append(parsed_object.builder.record)
        except Exception:
            failed_build_records.append(record)

    return parsed_records, failed_build_records


def load_records(parsed_records, workflow_management_hook):
    """Load the built records to the backoffice.
    Args:
        parsed_records (list): The list of built records.
        workflow_management_hook: The workflow management hook to use.
    Returns:
        list: The list of failed to load records.
    """
    failed_load_records = []
    for record in parsed_records:
        logger.info(
            f"Loading record: " f"{record.get('arxiv_eprints',[{}])[0].get('value')}"
        )

        workflow_data = {
            "data": record,
            "workflow_type": HEP_CREATE,
        }
        try:
            logger.info(f"Loading record: {record.get('control_number')}")
            workflow_management_hook.post_workflow(
                workflow_data=workflow_data,
            )
        except Exception:
            logger.error(f"Failed to load record: {record.get('control_number')}")
            failed_load_records.append(record)

    return failed_load_records
