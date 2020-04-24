# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import pkg_resources
import pytest
from botocore.exceptions import ClientError
from helpers.utils import create_s3_bucket, create_s3_file
from mock import patch

from inspirehep.files.api import current_s3_instance

KEY = "b50c2ea2d26571e0c5a3411e320586289fd715c2"


def test_upload_file(app_with_s3):
    create_s3_bucket(KEY)
    filename = "file.txt"
    mimetype = "text/*"
    acl = "public-read"
    expected_content = "This is a demo file\n"
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "file.txt")
    )
    with open(record_fixture_path, "rb") as data:
        current_s3_instance.upload_file(data, KEY, filename, mimetype, acl)
    result = current_s3_instance.client.head_object(
        Bucket=current_s3_instance.get_bucket_for_file_key(KEY), Key=KEY
    )
    assert result["ContentDisposition"] == f'inline; filename="{filename}"'
    assert result["ContentType"] == mimetype
    content = (
        current_s3_instance.resource.Object(
            current_s3_instance.get_bucket_for_file_key(KEY), KEY
        )
        .get()["Body"]
        .read()
        .decode("utf-8")
    )
    assert content == expected_content


def test_delete_file(app_with_s3):
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY), KEY, "this is my data"
    )
    current_s3_instance.delete_file(KEY)
    with pytest.raises(ClientError):
        current_s3_instance.client.head_object(
            Bucket=current_s3_instance.get_bucket_for_file_key(KEY), Key=KEY
        )


def test_replace_file_metadata(app_with_s3):
    metadata = {"foo": "bar"}
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY),
        KEY,
        "this is my data",
        metadata,
    )
    filename = "file.txt"
    mimetype = "text/*"
    acl = "public-read"
    current_s3_instance.replace_file_metadata(KEY, filename, mimetype, acl)
    result = current_s3_instance.client.head_object(
        Bucket=current_s3_instance.get_bucket_for_file_key(KEY), Key=KEY
    )
    assert result["ContentDisposition"] == f'inline; filename="{filename}"'
    assert result["ContentType"] == mimetype
    assert result["Metadata"] == {}


def test_get_file_metadata(app_with_s3):
    expected_metadata = {"foo": "bar"}
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY),
        KEY,
        "this is my data",
        expected_metadata,
    )
    metadata = current_s3_instance.get_file_metadata(KEY)["Metadata"]
    assert metadata == expected_metadata


def test_file_exists_when_file_is_missing(app_with_s3):
    expected_result = False
    create_s3_bucket(KEY)
    result = current_s3_instance.file_exists(KEY)
    assert result == expected_result


@patch(
    "inspirehep.files.api.current_s3_instance.client.head_object",
    side_effect=ClientError({"Error": {"Code": "500", "Message": "Error"}}, "load"),
)
def test_file_exists_when_error_occurs(mock_client_head_object, app_with_s3):
    with pytest.raises(ClientError):
        current_s3_instance.file_exists(KEY)


def test_file_exists_when_file_is_there(app_with_s3):
    expected_result = True
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY), KEY, "this is my data"
    )
    result = current_s3_instance.file_exists(KEY)
    assert result == expected_result


def test_get_bucket(app_with_s3):
    key = "e50c2ea2d26571e0c5a3411e320586289fd715c2"
    expected_result = "inspire-files-e"
    result = current_s3_instance.get_bucket_for_file_key(key)
    assert result == expected_result


def test_get_file_url(app_with_s3):
    key = "e50c2ea2d26571e0c5a3411e320586289fd715c2"
    expected_result = f"https://s3.cern.ch/inspire-files-e/{key}"
    result = current_s3_instance.get_file_url(key)
    assert result == expected_result


def test_get_content_disposition_with_broken_filename(app_with_s3):
    expected_content_disposition = 'inline; filename="Mass_mm_.s"'
    result = current_s3_instance.get_content_disposition("Mass_mm\n.s;b\n")
    assert result == expected_content_disposition


def test_get_content_disposition_with_subformat(app_with_s3):
    expected_content_disposition = 'inline; filename="file.fulltext.pdf"'
    result = current_s3_instance.get_content_disposition("file.full;text.pdf;pdfa;a")
    assert result == expected_content_disposition


def test_get_content_disposition_without_extension(app_with_s3):
    expected_content_disposition = 'inline; filename="file"'
    result = current_s3_instance.get_content_disposition("file")
    assert result == expected_content_disposition
