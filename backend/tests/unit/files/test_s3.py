# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import pytest

from inspirehep.files.api.s3 import S3


@pytest.fixture(scope="function")
def config_mock_fixture():
    with mock.patch("inspirehep.files.api.s3.current_app") as app_mock, mock.patch(
        "inspirehep.utils.current_app"
    ) as app_mock_2:
        app_mock.config = {
            "S3_BUCKET_PREFIX": "test-prefix-",
            "PREFERRED_URL_SCHEME": "https",
            "SERVER_NAME": "inspire",
            "FILES_PUBLIC_PATH": "/file_prefix/",
            "S3_HOSTNAME": "https://s3.cern.ch",
        }
        app_mock_2.config = {
            "S3_BUCKET_PREFIX": "test-prefix-",
            "PREFERRED_URL_SCHEME": "https",
            "SERVER_NAME": "inspire",
            "FILES_PUBLIC_PATH": "/file_prefix/",
            "S3_HOSTNAME": "https://s3.cern.ch",
        }
        yield app_mock


def test_generate_public_file_path(config_mock_fixture):
    s3 = S3(None, None)
    assert s3.public_file_path == "https://inspire/file_prefix/"


def test_is_public_url(config_mock_fixture):
    s3 = S3(None, None)
    file_public_url = "https://inspire/file_prefix/hash123456"
    wrong_url = "https://inspire/api/hash123456"
    s3_url = "https://s3.cern.ch/test-prefix-h/hash1234546"

    assert s3.is_public_url(file_public_url) is True
    assert s3.is_public_url(wrong_url) is False
    assert s3.is_public_url(s3_url) is False


def test_is_s3_url(config_mock_fixture):
    s3 = S3(None, None)
    file_public_url = "https://inspire/file_prefix/hash123456"
    wrong_url = "https://inspire/api/hash123456"
    s3_url = "https://s3.cern.ch/test-prefix-h/hash1234546"

    assert s3.is_s3_url(file_public_url) is False
    assert s3.is_s3_url(wrong_url) is False
    assert s3.is_s3_url(s3_url) is True


@pytest.mark.parametrize(
    "url,expected",
    [
        ("https://inspire/test-editor-prefix/hash123456", False),
        ("https://s3.cern.ch/test-prefix-h/hash1234546", True),
    ],
)
def test_is_s3_url_with_bucket_prefix(url, expected, config_mock_fixture):
    s3 = S3(None, None)
    assert s3.is_s3_url_with_bucket_prefix(url) is expected


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
