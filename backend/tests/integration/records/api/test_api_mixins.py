# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


import hashlib
import os
import uuid
from io import BytesIO

import mock
import pytest
from flask import current_app
from invenio_files_rest.models import Bucket, FileInstance, Location, ObjectVersion
from invenio_records.errors import MissingModelError
from requests.exceptions import ConnectionError
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.errors import DownloadFileError
from inspirehep.records.fixtures import init_storage_path


@pytest.mark.vcr()
def test_add_external_file(base_app, db, es, create_record, enable_files):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
    )

    expected_size = 1
    expected_checksum = "md5:a5bf966e8196d9f9339291583adda61a"
    expected_key = "b25ae02034a6ac608a408fd992cc99c7ac386408"
    expected_filename = "S1-2D-Lambda-Kappa-Tkappa.png"

    result_file = record["_files"][0]
    result_file_len = len(record["_files"])
    result_file_checksum = result_file["checksum"]
    result_file_key = result_file["key"]
    result_file_filename = result_file["filename"]

    assert expected_size == result_file_len
    assert expected_checksum == result_file_checksum
    assert expected_key == result_file_key
    assert expected_filename == result_file_filename


@pytest.mark.vcr()
def test_add_local_file(base_app, db, es, create_record, enable_files):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
    )

    record_bucket = record.bucket_id
    record_file_key = record["_files"][0]["key"]

    record_local = create_record("lit")
    record_local.add_file(f"/api/files/{record.bucket_id}/{record_file_key}")

    assert record.bucket.objects[0].file_id == record_local.bucket.objects[0].file_id

    expected_size = 1
    expected_checksum = "md5:a5bf966e8196d9f9339291583adda61a"
    expected_key = "b25ae02034a6ac608a408fd992cc99c7ac386408"
    expected_filename = "b25ae02034a6ac608a408fd992cc99c7ac386408"

    result_file = record_local["_files"][0]
    result_file_len = len(record_local["_files"])
    result_file_checksum = result_file["checksum"]
    result_file_key = result_file["key"]
    result_file_filename = result_file["filename"]

    assert expected_size == result_file_len
    assert expected_checksum == result_file_checksum
    assert expected_key == result_file_key
    assert expected_filename == result_file_filename


@pytest.mark.vcr()
def test_add_local_file_which_does_not_exist_and_should_download_from_original_url(
    base_app, db, es, create_record, enable_files
):
    record = create_record("lit")
    record.add_file(
        "/api/files/153aecf2-0661-4834-a66d-95f4e7b56197/b25ae02034a6ac608a408fd992cc99c7ac386408",
        original_url="http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png",
    )

    expected_size = 1
    expected_checksum = "md5:a5bf966e8196d9f9339291583adda61a"
    expected_key = "b25ae02034a6ac608a408fd992cc99c7ac386408"
    expected_filename = "S1-2D-Lambda-Kappa-Tkappa.png"

    result_file = record["_files"][0]
    result_file_len = len(record["_files"])
    result_file_checksum = result_file["checksum"]
    result_file_key = result_file["key"]
    result_file_filename = result_file["filename"]

    assert expected_size == result_file_len
    assert expected_checksum == result_file_checksum
    assert expected_key == result_file_key
    assert expected_filename == result_file_filename


@pytest.mark.vcr()
def test_add_local_file_which_does_not_exist_without_original_url(
    base_app, db, es, create_record, enable_files
):
    record = create_record("lit")
    with pytest.raises(DownloadFileError):
        record.add_file(
            "/api/files/153aecf2-0661-4834-a66d-95f4e7b56197/b25ae02034a6ac608a408fd992cc99c7ac386408"
        )


@pytest.mark.vcr()
def test_add_external_file_twice_and_only_store_it_once(
    base_app, db, es, create_record, enable_files
):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
    )

    record_2 = create_record("lit")
    record_2.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
    )
    assert record.bucket.objects[0].file_id == record_2.bucket.objects[0].file_id


@pytest.mark.vcr()
def test_add_external_file_with_filename(base_app, db, es, create_record, enable_files):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png",
        filename="jessicajones.pdf",
    )
    expected_filename = "jessicajones.pdf"

    filename = record["_files"][0]["filename"]

    assert expected_filename == filename


@pytest.mark.vcr()
def test_add_external_file_with_original_url(
    base_app, db, es, create_record, enable_files
):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png",
        original_url="http://inspirehep.net/record/1759621/files/jessicajones.pdf",
    )
    expected_filename = "jessicajones.pdf"

    filename = record["_files"][0]["filename"]

    assert expected_filename == filename


@pytest.mark.vcr()
def test_add_external_file_with_url(base_app, db, es, create_record, enable_files):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
    )
    expected_filename = "S1-2D-Lambda-Kappa-Tkappa.png"

    filename = record["_files"][0]["filename"]

    assert expected_filename == filename


@pytest.mark.vcr()
def test_add_external_file_with_url(base_app, db, es, create_record, enable_files):
    record = create_record("lit")
    record.add_file(
        "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
    )
    expected_filename = "S1-2D-Lambda-Kappa-Tkappa.png"

    filename = record["_files"][0]["filename"]

    assert expected_filename == filename


@pytest.mark.vcr()
def test_add_external_which_is_404(base_app, db, es, create_record, enable_files):
    record = create_record("lit")
    with pytest.raises(ConnectionError):
        record.add_file("http://whatever/404")


@pytest.mark.vcr()
def test_regression_create_record_without_bucket(
    base_app, db, es, create_record_factory
):
    record = create_record_factory("lit", with_validation=True)
    record_control_number = record.json["control_number"]
    with mock.patch.dict(base_app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        assert "_bucket" not in record_from_db
        assert record_from_db._bucket is None

        record_from_db.add_file(
            "http://inspirehep.net/record/1759621/files/S1-2D-Lambda-Kappa-Tkappa.png"
        )
        expected_filename = "S1-2D-Lambda-Kappa-Tkappa.png"
        filename = record_from_db["_files"][0]["filename"]
        assert "_bucket" in record_from_db
        assert record_from_db._bucket
        assert expected_filename == filename


def test_regression_create_record_without_bucket_and_calling_files_should_create_a_bucket(
    base_app, db, es, create_record_factory
):
    record = create_record_factory("lit", with_validation=True)
    record_control_number = record.json["control_number"]
    with mock.patch.dict(base_app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        assert "_bucket" not in record_from_db
        assert record_from_db._bucket is None
        record_from_db.files
        assert "_bucket" in record_from_db
        assert record_from_db._bucket


def test_regression_create_bucket_with_different_location(
    base_app, db, es, create_record_factory
):
    record = create_record_factory("lit", with_validation=True)
    record_control_number = record.json["control_number"]

    with mock.patch.dict(base_app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        bucket = record_from_db.create_bucket(location="default", storage_class="A")
        expected_location = Location.get_by_name("default").uri
        assert expected_location == bucket.location.uri
        assert "A" == bucket.default_storage_class
