import datetime
import json
import logging
from urllib.parse import urlparse

from include.utils.constants import HEP_PUBLISHER_CREATE
from include.utils.harvests import load_records

logger = logging.getLogger(__name__)


def _is_local_path(url):
    parsed_url = urlparse(url)
    return not parsed_url.scheme.startswith("http")


def _parse_record(
    record, subdirectory_name, s3_store, output_bucket, submission_number
):
    """Update document URLs to point to S3 and add acquisition source metadata."""
    for document in record.get("documents", []):
        document["original_url"] = document["url"]
        if _is_local_path(document["url"]):
            file_name = document["url"].split("/")[-1]
            file_key = f"{subdirectory_name}{file_name}"
            document["url"] = s3_store.key_to_s3_url(file_key, output_bucket)
            logger.info("Updating document %s", document)

    record["acquisition_source"] = {
        "source": "DESY",
        "method": "hepcrawl",
        "datetime": datetime.datetime.now().isoformat(),
        "submission_number": submission_number,
    }

    return record


def process_subdirectory(
    subdirectory_name,
    s3_store,
    input_bucket,
    output_bucket,
    workflow_management_hook,
    submission_number,
):
    jsonl_file_name = f"{subdirectory_name.strip('/')}.jsonl"
    jsonl_s3_path = f"{subdirectory_name}{jsonl_file_name}"

    failed_parse_records = []
    failed_load_records = []
    json_records = []

    jsonl_content = s3_store.hook.read_key(jsonl_s3_path, input_bucket)

    for line in jsonl_content.splitlines():
        if not line.strip():
            continue
        try:
            json_records.append(json.loads(line))
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in line: %s", line)
            failed_parse_records.append(line)

    logger.info("Got %d JSON records in %s", len(json_records), jsonl_file_name)

    json_records = [
        _parse_record(
            record,
            subdirectory_name=subdirectory_name,
            s3_store=s3_store,
            output_bucket=output_bucket,
            submission_number=submission_number,
        )
        for record in json_records
    ]

    s3_store.move_all_files_for_subdirectory(
        subdirectory_name, input_bucket, output_bucket
    )

    failed_load_records = load_records(
        json_records,
        workflow_management_hook,
        workflow_type=HEP_PUBLISHER_CREATE,
    )

    return {
        "failed_parse_records": failed_parse_records,
        "failed_load_records": failed_load_records,
    }
