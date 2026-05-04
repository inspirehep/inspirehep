import datetime
import re

from inspire_schemas.parsers.arxiv import ArxivParser
from inspire_schemas.utils import RE_ARXIV_POST_2007, RE_ARXIV_PRE_2007


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


def eprint_to_datetime(eprint_value):
    """Convert the arXiv eprint value to a datetime object.
    Returns:
        datetime: The datetime object representing year and month of the eprint value.
    """
    if re.match(RE_ARXIV_POST_2007, eprint_value, flags=re.I):
        return datetime.datetime.strptime(eprint_value.split(".")[0], "%y%m")
    elif re.match(RE_ARXIV_PRE_2007, eprint_value, flags=re.I):
        return datetime.datetime.strptime(eprint_value.split("/")[1][0:4], "%y%m")
    else:
        raise ValueError(f"Invalid arXiv eprint value: {eprint_value}")
