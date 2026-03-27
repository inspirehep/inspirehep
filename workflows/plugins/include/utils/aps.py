import datetime
import logging
from urllib.parse import parse_qsl, urlparse

from inspire_schemas.parsers.jats import JatsParser
from requests.utils import parse_header_links

logger = logging.getLogger(__name__)


def build_articles_params(set_name, from_date, until_date, per_page, date):
    """Build the APS articles request params."""
    params = {}
    if set_name:
        params["set"] = set_name
    if from_date:
        params["from"] = from_date
    if until_date:
        params["until"] = until_date
    if per_page:
        params["per_page"] = per_page
    if date:
        params["date"] = date

    return params


def extract_next_params(response):
    """Extract the next APS page params from the Link header."""
    link_header = response.headers.get("Link")
    if not link_header:
        logger.info("APS response has no Link header, stopping pagination")
        return None

    if isinstance(link_header, bytes):
        link_header = link_header.decode("utf-8")

    for link in parse_header_links(link_header):
        if link.get("rel") != "next":
            continue

        next_url = link.get("url")
        if not next_url:
            logger.info("APS next pagination link is missing a URL")
            return None

        parsed_url = urlparse(next_url)
        params = dict(parse_qsl(parsed_url.query))
        logger.info("Following APS next page with params: %s", params)
        return params

    logger.info("APS response has no next pagination link")
    return None


def build_record(doi, xml_text, xml_url, submission_number):
    """Parse an APS JATS article into a HEP record."""
    file_name = f"{doi}.xml"
    parser = JatsParser(xml_text, source="APS")
    parser.attach_fulltext_document(file_name, xml_url)
    record = parser.parse()
    record["acquisition_source"] = {
        "source": "APS",
        "method": "hepcrawl",
        "datetime": datetime.datetime.now().isoformat(),
        "submission_number": submission_number,
    }
    return record


def _download_document_stream(url, aps_hook, headers):
    """Download an APS document stream using the authenticated APS hook."""
    base_url = aps_hook.get_url()
    if not url.startswith(base_url):
        raise ValueError(f"APS document URL must start with {base_url}: {url}")

    endpoint = url.replace(base_url, "")
    response = aps_hook.call_api(
        endpoint=endpoint,
        headers=headers,
        extra_options={"stream": True, "allow_redirects": True},
    )
    return response.raw


def store_record_documents(record, storage_prefix, s3_store, aps_hook, headers):
    """Download APS record documents to S3 and rewrite their URLs."""
    documents = record.get("documents", [])

    for document in documents:
        original_url = document["url"]
        s3_key = f"{storage_prefix}/{document['key']}"
        logger.info("Storing APS document %s in S3", document["key"])
        upload_object = _download_document_stream(original_url, aps_hook, headers)
        s3_store.hook.load_file_obj(upload_object, s3_key, replace=True)
        document["original_url"] = original_url
        document["url"] = s3_store.key_to_s3_url(s3_key)
