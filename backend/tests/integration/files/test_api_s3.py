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
from mock import patch

from inspirehep.files.api import current_s3_instance

BUCKET = "inspire-files-b"
KEY = "b50c2ea2d26571e0c5a3411e320586289fd715c2"


def test_upload_file(base_app, appctx, s3, create_s3_bucket):
    create_s3_bucket(BUCKET)
    filename = "file.txt"
    mimetype = "text/*"
    acl = "public-read"
    expected_content = "This is a demo file\n"
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "file.txt")
    )
    with open(record_fixture_path, "rb") as data:
        current_s3_instance.upload_file(data, KEY, filename, mimetype, acl)
    result = current_s3_instance.client.head_object(Bucket=BUCKET, Key=KEY)
    assert result["ContentDisposition"] == f'attachment; filename="{filename}"'
    assert result["ContentType"] == mimetype
    content = (
        current_s3_instance.resource.Object(BUCKET, KEY)
        .get()["Body"]
        .read()
        .decode("utf-8")
    )
    assert content == expected_content


def test_delete_file(base_app, appctx, s3, create_s3_bucket, create_s3_file):
    create_s3_bucket(BUCKET)
    create_s3_file(BUCKET, KEY, "this is my data")
    current_s3_instance.delete_file(KEY)
    with pytest.raises(ClientError):
        current_s3_instance.client.head_object(Bucket=BUCKET, Key=KEY)


def test_replace_file_metadata(base_app, appctx, s3, create_s3_bucket, create_s3_file):
    metadata = {"foo": "bar"}
    create_s3_bucket(BUCKET)
    create_s3_file(BUCKET, KEY, "this is my data", metadata)
    filename = "file.txt"
    mimetype = "text/*"
    acl = "public-read"
    current_s3_instance.replace_file_metadata(KEY, filename, mimetype, acl)
    result = current_s3_instance.client.head_object(Bucket=BUCKET, Key=KEY)
    assert result["ContentDisposition"] == f'attachment; filename="{filename}"'
    assert result["ContentType"] == mimetype
    assert result["Metadata"] == {}


def test_get_file_metadata(base_app, appctx, s3, create_s3_bucket, create_s3_file):
    expected_metadata = {"foo": "bar"}
    create_s3_bucket(BUCKET)
    create_s3_file(BUCKET, KEY, "this is my data", expected_metadata)
    metadata = current_s3_instance.get_file_metadata(KEY)
    assert metadata == expected_metadata


def test_file_exists_when_file_is_missing(base_app, appctx, s3, create_s3_bucket):
    expected_result = False
    create_s3_bucket(BUCKET)
    result = current_s3_instance.file_exists(KEY)
    assert result == expected_result


def test_file_exists_when_error_occurs(base_app, appctx):
    with patch.object(current_s3_instance, "resource") as mock_resource:
        error_response = {"Error": {"Code": "500", "Message": "Error"}}
        mock_resource.Object(
            current_s3_instance.get_bucket(KEY), KEY
        ).load.side_effect = ClientError(error_response, "load")
        with pytest.raises(ClientError):
            current_s3_instance.file_exists(KEY)


def test_file_exists_when_file_is_there(
    base_app, appctx, s3, create_s3_bucket, create_s3_file
):
    expected_result = True
    create_s3_bucket(BUCKET)
    create_s3_file(BUCKET, KEY, "this is my data")
    result = current_s3_instance.file_exists(KEY)
    assert result == expected_result


def test_get_bucket(base_app, appctx):
    key = "e50c2ea2d26571e0c5a3411e320586289fd715c2"
    expected_result = "inspire-files-e"
    result = current_s3_instance.get_bucket(key)
    assert result == expected_result


def test_get_file_url(base_app, appctx):
    key = "e50c2ea2d26571e0c5a3411e320586289fd715c2"
    expected_result = f"https://s3.cern.ch/inspire-files-e/{key}"
    result = current_s3_instance.get_file_url(key)
    assert result == expected_result
