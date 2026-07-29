from unittest.mock import MagicMock, patch

from include.utils.download_documents import load_document_to_s3


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
