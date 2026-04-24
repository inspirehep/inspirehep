#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import pytest
from botocore.exceptions import ClientError
from inspirehep.files.api.s3 import S3
from inspirehep.records.errors import DownloadFileError, FileSizeExceededError


@pytest.fixture
def config_mock_fixture():
    with (
        mock.patch("inspirehep.files.api.s3.current_app") as app_mock,
        mock.patch("inspirehep.utils.current_app") as app_mock_2,
        mock.patch("inspirehep.records.errors.current_app") as errors_app_mock,
    ):
        app_mock.config = {
            "S3_BUCKET_PREFIX": "test-prefix-",
            "S3_AIRFLOW_BUCKET": "test-airflow-bucket",
            "PREFERRED_URL_SCHEME": "https",
            "SERVER_NAME": "inspire",
            "FILES_PUBLIC_PATH": "/file_prefix/",
            "S3_HOSTNAME": "https://s3.cern.ch",
            "FILES_SIZE_LIMIT": 10,
        }
        app_mock_2.config = {
            "S3_BUCKET_PREFIX": "test-prefix-",
            "S3_AIRFLOW_BUCKET": "test-airflow-bucket",
            "PREFERRED_URL_SCHEME": "https",
            "SERVER_NAME": "inspire",
            "FILES_PUBLIC_PATH": "/file_prefix/",
            "S3_HOSTNAME": "https://s3.cern.ch",
            "FILES_SIZE_LIMIT": 10,
        }
        errors_app_mock.config = {"FILES_SIZE_LIMIT": 10}
        yield app_mock


def test_generate_public_file_path(config_mock_fixture):
    s3 = S3(None, None)
    assert s3.public_file_path == "https://inspire/file_prefix/"


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://inspire/file_prefix/hash123456", True),
        ("https://inspire/api/hash123456", False),
        ("https://s3.cern.ch/test-prefix-h/hash1234546", False),
    ],
)
def test_is_public_url(url, expected, config_mock_fixture):
    s3 = S3(None, None)

    assert expected == s3.is_public_url(url)


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://inspire/file_prefix/hash123456", False),
        ("https://inspire/api/hash123456", False),
        ("https://s3.cern.ch/test-prefix-h/hash1234546", True),
    ],
)
def test_is_s3_url(url, expected, config_mock_fixture):
    s3 = S3(None, None)
    assert expected == s3.is_s3_url(url)


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://inspire/test-editor-prefix/hash123456", False),
        ("https://s3.cern.ch/test-prefix-h/hash1234546", True),
    ],
)
def test_is_s3_url_with_bucket_prefix(url, expected, config_mock_fixture):
    s3 = S3(None, None)
    assert expected == s3.is_s3_url_with_bucket_prefix(url)


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://inspire/test-airflow-bucket/hash123456", False),
        ("https://s3.cern.ch/test-prefix-h/hash1234546", False),
        ("https://s3.cern.ch/test-airflow-bucket/hash1234546", True),
    ],
)
def test_is_s3_url_from_airflow_bucket(url, expected, config_mock_fixture):
    s3 = S3(None, None)
    assert expected == s3.is_s3_url_from_airflow_bucket(url)


def test_get_bucket_and_key_from_url(config_mock_fixture):
    s3 = S3(None, None)
    url = "https://s3.cern.ch/test-airflow-bucket/documents/nested/file.pdf"

    assert s3.get_bucket_and_key_from_url(url) == (
        "test-airflow-bucket",
        "documents/nested/file.pdf",
    )


def test_generate_public_file_url(config_mock_fixture):
    s3 = S3(None, None)
    expected_url = "https://inspire/file_prefix/hash123456"
    public_url = s3.get_public_url("hash123456")
    assert public_url == expected_url
    assert s3.is_public_url(public_url) is True


def test_generate_s3_file_url(config_mock_fixture):
    s3 = S3(None, None)
    expected_url = "https://s3.cern.ch/test-prefix-h/hash123456"
    s3_url = s3.get_s3_url("hash123456")
    assert s3_url == expected_url
    assert s3.is_s3_url(s3_url) is True


def test_generate_s3_file_url_with_bucket_provided(config_mock_fixture):
    s3 = S3(None, None)
    expected_url = "https://s3.cern.ch/another-prefix/hash123456"
    s3_url = s3.get_s3_url("hash123456", "another-prefix")
    assert s3_url == expected_url
    assert s3.is_s3_url(s3_url) is True


def test_convert_s3_url_to_public_url(config_mock_fixture):
    s3 = S3(None, None)
    expected_url = "https://inspire/file_prefix/hash123456"
    s3_url = "https://s3.cern.ch/test-prefix-h/hash123456"
    assert s3.convert_to_public_url(s3_url) == expected_url


def test_convert_public_url_to_s3_url(config_mock_fixture):
    s3 = S3(None, None)
    public_url = "https://inspire/file_prefix/hash123456"
    expected_url = "https://s3.cern.ch/test-prefix-h/hash123456"
    assert s3.convert_to_s3_url(public_url) == expected_url


def test_download_file_from_s3_url_reads_body_when_file_size_is_allowed(
    config_mock_fixture,
):
    client = mock.Mock()
    s3 = S3(client, None)
    url = "https://s3.cern.ch/test-airflow-bucket/documents/file.pdf"
    body = mock.Mock()
    body.read.return_value = b"pdf-data"
    client.head_object.return_value = {"ContentLength": 8}
    client.get_object.return_value = {"Body": body}

    result = s3.download_file_from_s3_url(url)

    assert result == b"pdf-data"
    client.head_object.assert_called_once_with(
        Bucket="test-airflow-bucket",
        Key="documents/file.pdf",
    )
    client.get_object.assert_called_once_with(
        Bucket="test-airflow-bucket",
        Key="documents/file.pdf",
    )
    body.read.assert_called_once()


def test_download_file_from_s3_url_raises_when_file_size_exceeds_limit(
    config_mock_fixture,
):
    client = mock.Mock()
    s3 = S3(client, None)
    url = "https://s3.cern.ch/test-airflow-bucket/documents/file.pdf"
    client.head_object.return_value = {"ContentLength": 11}

    with pytest.raises(FileSizeExceededError):
        s3.download_file_from_s3_url(url)

    client.head_object.assert_called_once_with(
        Bucket="test-airflow-bucket",
        Key="documents/file.pdf",
    )
    client.get_object.assert_not_called()


def test_download_file_from_s3_url_wraps_s3_errors(config_mock_fixture):
    client = mock.Mock()
    s3 = S3(client, None)
    url = "https://s3.cern.ch/test-airflow-bucket/documents/file.pdf"
    client.head_object.side_effect = ClientError(
        {"Error": {"Code": "404", "Message": "Not Found"}},
        "HeadObject",
    )

    with pytest.raises(DownloadFileError):
        s3.download_file_from_s3_url(url)

    client.head_object.assert_called_once_with(
        Bucket="test-airflow-bucket",
        Key="documents/file.pdf",
    )
    client.get_object.assert_not_called()
