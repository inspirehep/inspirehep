import datetime

from inspire_schemas.parsers.arxiv import ArxivParser


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
