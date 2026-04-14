import logging
from io import BytesIO
from urllib.parse import urlparse

import requests
from airflow.providers.amazon.aws.utils.connection_wrapper import AwsConnectionWrapper
from airflow.sdk import Variable
from airflow.sdk.bases.hook import BaseHook
from hooks.generic_http_hook import GenericHttpHook
from include.utils.s3 import S3JsonStore

ARXIV_CONNECTION_ID = "arxiv_connection"
S3_PUBLISHER_CONNECTION_ID = "s3_elsevier_conn"


logger = logging.getLogger(__name__)


def is_connection_url(url, connection_id):
    """Checks if the given URL is a connection URL.

    Args:
        url (str): The URL to check.
        connection_id (str): The ID of the connection to use for the check.
    """
    conn = BaseHook.get_connection(connection_id)
    url_hostname = urlparse(url).hostname
    if conn.conn_type == "aws":
        conn_wrapper = AwsConnectionWrapper(conn)
        aws_url = conn_wrapper.endpoint_url
        return urlparse(aws_url).hostname == url_hostname
    return (urlparse(conn.host).hostname or conn.host) == url_hostname


def _get_upload_object(url):
    if is_connection_url(url, ARXIV_CONNECTION_ID):
        return _download_from_arxiv(url)
    if is_connection_url(url, S3_PUBLISHER_CONNECTION_ID):
        return _download_from_s3(url)
    return _download_from_url(url)


def _download_from_url(url):
    response = requests.get(
        url,
        stream=True,
        timeout=int(Variable.get("DOWNLOAD_FILE_TO_WORKFLOW_TIMEOUT", 300)),
    )
    response.raise_for_status()
    return response.raw


def _download_from_s3(url):
    s3_publisher_store = S3JsonStore(S3_PUBLISHER_CONNECTION_ID)
    publisher_bucket_name, key = s3_publisher_store.parse_s3_url(url)
    document_obj = s3_publisher_store.hook.get_key(key, publisher_bucket_name)
    return BytesIO(document_obj.get()["Body"].read())


def _download_from_arxiv(url):
    arxiv_hook = GenericHttpHook(http_conn_id=ARXIV_CONNECTION_ID)
    endpoint = urlparse(url).path
    response = arxiv_hook.call_api(
        endpoint=endpoint,
        extra_options={"stream": True, "allow_redirects": True},
    )
    return response.raw


def load_document_to_s3(workflow_id, document, s3_store):
    bucket_name = s3_store.get_default_bucket_name()
    upload_object = None

    url = document["url"]
    filename = document["key"]

    if s3_store.hook.check_for_key(f"{workflow_id}/documents/{filename}"):
        logger.info("Document already downloaded from %s", url)
        return

    logger.info("Downloading document key:%s url:%s", filename, url)
    upload_object = _get_upload_object(url)

    if not upload_object:
        return

    s3_key = f"{workflow_id}/documents/{filename}"
    s3_store.hook.load_file_obj(
        upload_object,
        s3_key,
        replace=True,
    )

    logger.info("Document downloaded from %s", url)
    return f"{s3_store.hook.conn.meta.endpoint_url}/{bucket_name}/{s3_key}"
