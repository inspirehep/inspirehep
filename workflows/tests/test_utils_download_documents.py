import gzip
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest
import requests
from include.utils.download_documents import (
    _download_from_url,
    load_document_to_s3,
)
from urllib3 import HTTPResponse


def _response(body, headers=None):
    response = requests.Response()
    response.status_code = 200
    response.headers.update(headers or {})
    response.raw = HTTPResponse(
        body=BytesIO(body),
        headers=headers or {},
        preload_content=False,
        decode_content=False,
    )
    return response


@patch("include.utils.download_documents._get_upload_object")
def test_load_document_to_s3_returns_url_when_document_already_exists(
    mock_get_upload_object,
):
    workflow_id = "workflow-id"
    filename = "document.pdf"
    bucket_name = "data-store"
    endpoint_url = "http://s3:9000"
    s3_key = f"{workflow_id}/documents/{filename}"
    s3_store = MagicMock()
    s3_store.get_default_bucket_name.return_value = bucket_name
    s3_store.hook.conn.meta.endpoint_url = endpoint_url
    s3_store.hook.check_for_key.return_value = True

    result = load_document_to_s3(
        workflow_id,
        {"key": filename, "url": "https://example.org/document.pdf"},
        s3_store,
    )

    assert result == f"{endpoint_url}/{bucket_name}/{s3_key}"
    s3_store.hook.check_for_key.assert_called_once_with(s3_key)
    mock_get_upload_object.assert_not_called()
    s3_store.hook.load_file_obj.assert_not_called()


@patch("include.utils.download_documents.Variable.get", return_value=300)
@patch("include.utils.download_documents.requests.get")
def test_download_from_url_returns_decoded_content(mock_get, mock_variable_get):
    pdf_bytes = b"%PDF-1.4 fake pdf content"
    response = requests.Response()
    response.status_code = 200
    response.raw = HTTPResponse(
        body=BytesIO(gzip.compress(pdf_bytes)),
        headers={"Content-Encoding": "gzip"},
        preload_content=False,
        decode_content=False,
    )
    mock_get.return_value = response

    result = _download_from_url("https://example.org/document.pdf")

    assert result.read() == pdf_bytes


@pytest.mark.parametrize(
    "body",
    [
        b"<!DOCTYPE html><html><script>alert(1)</script></html>",
        b"<svg xmlns='http://www.w3.org/2000/svg'/>",
        b"<?xml version='1.0'?><article/>",
        b"MZ\x90\x00 executable",
        b"x" * 2000 + b"%PDF-1.4",
        b"<html><script>alert(1)</script>%PDF-1.4</html>",
        b"junk%PDF-1.4",
        b"%PDF",
        b"",
    ],
)
@patch("include.utils.download_documents.Variable.get", side_effect=lambda k, d: d)
@patch("include.utils.download_documents.requests.get")
def test_download_from_url_rejects_non_pdf(mock_get, mock_variable_get, body):
    mock_get.return_value = _response(body)

    with pytest.raises(ValueError, match="not a PDF"):
        _download_from_url("https://example.org/doc.pdf")


@patch("include.utils.download_documents.Variable.get", side_effect=lambda k, d: d)
def test_download_from_url_rejects_non_http_url(mock_variable_get):
    with pytest.raises(ValueError, match="No connection adapters"):
        _download_from_url("file:///etc/passwd")


@patch(
    "include.utils.download_documents.Variable.get",
    side_effect=lambda key, default: 100 if key == "DOWNLOAD_FILE_MAX_SIZE" else 300,
)
@patch("include.utils.download_documents.requests.get")
def test_download_from_url_rejects_document_larger_than_max_size(
    mock_get, mock_variable_get
):
    mock_get.return_value = _response(b"%PDF-1.4" + b"x" * 200)

    with pytest.raises(ValueError, match="larger than the maximum"):
        _download_from_url("https://example.org/doc.pdf")
