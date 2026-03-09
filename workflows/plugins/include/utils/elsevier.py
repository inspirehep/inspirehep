import datetime
import logging
import zipfile
from io import BytesIO
from xml.etree import ElementTree

from include.utils.constants import HEP_CREATE
from inspire_schemas.parsers.elsevier import ElsevierParser

logger = logging.getLogger(__name__)


def extract_package_entries(feed_xml):
    """Extract package name + URL pairs from the Elsevier atom feed."""
    root = ElementTree.fromstring(feed_xml)
    entries = []
    for entry in root.findall(".//{*}entry"):
        title = entry.findtext("{*}title")
        link = entry.find("{*}link")
        href = link.attrib.get("href") if link is not None else None
        if title and href:
            entries.append({"name": title.strip(), "url": href})
    return entries


def process_package(package_key, s3_store, submission_number, workflow_management_hook):
    """Process an Elsevier package: extract articles and post workflows."""
    zip_obj = s3_store.hook.get_key(package_key)
    zip_bytes = zip_obj.get()["Body"].read()

    with zipfile.ZipFile(BytesIO(zip_bytes)) as zip_package:
        failed_records = []
        for zip_info in zip_package.infolist():
            if zip_info.is_dir() or not zip_info.filename.lower().endswith(".xml"):
                continue
            xml_text = zip_package.read(zip_info).decode("utf-8", errors="ignore")
            failed_record = process_article(
                zip_info.filename,
                xml_text,
                submission_number,
                s3_store,
                workflow_management_hook,
            )
            if failed_record:
                failed_records.append(failed_record)

    return failed_records


def process_article(
    file_name, xml_text, submission_number, s3_store, workflow_management_hook
):
    parser = ElsevierParser(xml_text)
    try:
        doi = parser.get_identifier()
        if not parser.should_record_be_harvested():
            logger.info(
                "Skipping file %s because required metadata is missing",
                file_name,
            )
            return

        file_key = f"articles/{doi}.xml"
        s3_store.hook.load_string(xml_text, file_key, replace=True)

        s3_host = s3_store.hook.conn.meta.endpoint_url
        document_url = f"{s3_host}/{s3_store.bucket_name}/{file_key}"

        parser.attach_fulltext_document(file_key, document_url)
        record = parser.parse()
        record["acquisition_source"] = {
            "source": "Elsevier",
            "method": "hepcrawl",
            "datetime": datetime.datetime.now().isoformat(),
            "submission_number": submission_number,
        }
        workflow_management_hook.post_workflow(
            workflow_data={"data": record, "workflow_type": HEP_CREATE}
        )
    except Exception as e:
        return {"doi": doi, "file": file_name, "error": str(e)}
