import datetime
import logging

from inspire_dojson.api import cds_marcxml2record
from lxml import etree

logger = logging.getLogger(__name__)


def build_records(xml_records, submission_number):
    """Convert CDS OAI-PMH MARCXML payloads into HEP records."""
    parsed_records = []
    failed_build_records = []

    for record in xml_records:
        try:
            marcxml_record = extract_marcxml_record(record)
            parsed_record = cds_marcxml2record(marcxml_record)
            parsed_record["acquisition_source"] = {
                "source": "CDS",
                "method": "hepcrawl",
                "datetime": datetime.datetime.now().isoformat(),
                "submission_number": submission_number,
            }
            parsed_records.append(parsed_record)
            for document in parsed_record.get("documents", []):
                document["original_url"] = document["url"]
        except Exception:
            logger.exception("Failed to parse CDS record")
            failed_build_records.append(record)

    return parsed_records, failed_build_records


def extract_marcxml_record(xml_record):
    """Extract the inner MARCXML ``record`` node from the OAI-PMH envelope."""
    root = etree.fromstring(xml_record.encode("utf-8"))
    marcxml_record = root.xpath("//*[local-name()='record']")[-1]
    return etree.tostring(marcxml_record, encoding="unicode")
