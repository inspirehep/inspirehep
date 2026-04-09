import datetime
import logging

from airflow.sdk.bases.hook import BaseHook
from airflow.sdk.exceptions import AirflowSkipException
from inspire_schemas.parsers.arxiv import ArxivParser
from sickle import Sickle, oaiexceptions

logger = logging.getLogger(__name__)


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
