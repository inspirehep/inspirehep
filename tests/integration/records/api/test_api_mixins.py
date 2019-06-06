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

import pytest
from flask import current_app
from fs.errors import ResourceNotFoundError
from invenio_records.errors import MissingModelError
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.records.api import InspireRecord
from inspirehep.records.api.mixins import FilesMixin
from inspirehep.records.fixtures import init_storage_path


def test_get_bucket_single(base_app, db, create_record_factory, init_files_db):
    expected_storage_class = current_app.config["RECORDS_DEFAULT_STORAGE_CLASS"]
    expected_location = current_app.config["RECORDS_DEFAULT_FILE_LOCATION_NAME"]

    record_factory = create_record_factory("lit")
    record = InspireRecord.get_record(record_factory.id)

    bucket = record.get_bucket()
    assert bucket.location.name == expected_location
    assert bucket.default_storage_class == expected_storage_class


def test_get_bucket_multiple_same_parameters(
    base_app, db, create_record_factory, init_files_db
):
    record_factory = create_record_factory("lit")
    record = InspireRecord.get_record(record_factory.id)

    bucket = record.get_bucket()
    bucket_copy = record.get_bucket()
    bucket_copy2 = record.get_bucket()
    assert bucket is not None
    assert bucket_copy is not None
    assert bucket_copy2 is not None
    assert bucket.id == bucket_copy.id
    assert bucket_copy2.id == bucket.id


def test_get_multiple_buckets_different_parameters(
    base_app, db, create_record_factory, init_files_db
):
    expected_default_storage_class = current_app.config["RECORDS_DEFAULT_STORAGE_CLASS"]
    expected_default_location = current_app.config["RECORDS_DEFAULT_FILE_LOCATION_NAME"]

    init_storage_path(name="second", uri="/tmp/test")

    record_factory = create_record_factory("lit")
    record_factory2 = create_record_factory("lit")
    record = InspireRecord.get_record(record_factory.id)
    record2 = InspireRecord.get_record(record_factory2.id)

    bucket_record_1 = record.get_bucket()
    bucket_record_2 = record2.get_bucket()

    assert bucket_record_1.id != bucket_record_2.id

    bucket2_record_1 = record.get_bucket(location="second")
    bucket3_record_1 = record.get_bucket(location="second", storage_class="A")
    bucket4_record_1 = record.get_bucket(storage_class="A")

    assert bucket_record_1.id != bucket2_record_1.id
    assert bucket_record_1.id != bucket3_record_1.id
    assert bucket_record_1.id != bucket4_record_1.id
    assert bucket2_record_1.id != bucket3_record_1.id
    assert bucket3_record_1.id != bucket4_record_1.id
    assert bucket2_record_1.id != bucket4_record_1.id

    assert bucket2_record_1.location.name == "second"
    assert bucket2_record_1.default_storage_class == expected_default_storage_class
    assert bucket3_record_1.location.name == "second"
    assert bucket3_record_1.default_storage_class == "A"
    assert bucket4_record_1.location.name == expected_default_location
    assert bucket4_record_1.default_storage_class == "A"


def test_files_access(base_app, db, create_record_factory, init_files_db):
    record_factory = create_record_factory("lit")
    record = InspireRecord.get_record(record_factory.id)

    assert record.files is not None
    assert len(record.files.keys) == 0

    record.files["test"] = BytesIO(b"TEST_FILE")
    assert "test" in record.files.keys
    assert len(record.files.keys) == 1


def test_files_on_object_without_model(
    base_app, db, create_record_factory, init_files_db
):
    record_factory = create_record_factory("lit")
    record = InspireRecord.get_record(record_factory.id)
    record.model = None

    with pytest.raises(MissingModelError):
        record.files.keys


def test_no_location(base_app, db, create_record_factory, init_files_db):
    record_factory = create_record_factory("lit")
    record = InspireRecord.get_record(record_factory.id)

    with pytest.raises(NoResultFound):
        record.get_bucket(location="FAKE_LOCATION")


def test_download_files(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):

    record_metadata = create_record_factory("lit")
    record_metadata2 = create_record_factory("lit")

    record = InspireRecord.get_record(record_metadata.id)
    record2 = InspireRecord.get_record(record_metadata2.id)
    with pytest.raises(ResourceNotFoundError):
        record._download_file_from_url(url="http://missing_url.com")
    with pytest.raises(FileNotFoundError):
        record._download_file_from_local_storage(
            url=f"/api/files/{uuid.uuid4()}/{hashlib.sha1(b'test-hash').hexdigest()}"
        )

    key = record._download_file_from_url("http://document_url.cern.ch/file.pdf")
    assert key is not None
    assert isinstance(key, str)
    assert key in record.files.keys

    dir_path = os.path.dirname(os.path.realpath(__file__))
    expected_file_data = open(
        f"{dir_path}/../test_data/test_document.pdf", mode="rb"
    ).read()

    expected_hash = hashlib.sha1(expected_file_data).hexdigest()

    file_data = record.files[key].obj.file.storage().open().read()

    assert expected_hash == key
    assert expected_file_data == file_data

    bucket_id = record.files[key].bucket_id
    local_uri = f"/api/files/{bucket_id}/{key}"

    key2 = record2._download_file_from_local_storage(url=local_uri)
    assert key2 is not None
    assert key2 in record2.files.keys
    assert expected_hash == key2

    file_data2 = record2.files[key].obj.file.storage().open().read()
    assert expected_file_data == file_data2


def test_resolving_download_method(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record_metadata2 = create_record_factory("lit")

    record = InspireRecord.get_record(record_metadata.id)
    record2 = InspireRecord.get_record(record_metadata2.id)

    assert record._find_and_add_file("http://missing_url.com") is None
    assert (
        record._find_and_add_file(
            f"/api/files/{uuid.uuid4()}/{hashlib.sha1(b'test-hash').hexdigest()}"
        )
        is None
    )

    key = record._find_and_add_file(
        url=f"/api/files/{uuid.uuid4()}/{hashlib.sha1(b'test-hash').hexdigest()}",
        original_url="http://document_url.cern.ch/file.pdf",
    )

    assert key is not None
    assert key in record.files.keys

    bucket_id = record.files[key].bucket_id
    local_uri = f"/api/files/{bucket_id}/{key}"

    key2 = record2._find_and_add_file(url=local_uri)

    assert key2 is not None
    assert key2 == key
    assert key2 in record2.files.keys


def test_add_file_default_parameters(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)

    expected_filename = "file.pdf"
    expected_original_url = "http://document_url.cern.ch/file.pdf"

    with pytest.raises(FileNotFoundError):
        record._add_file(url="http://wrong-url")
    file_metadata = record._add_file(expected_original_url)
    assert file_metadata is not None
    assert file_metadata["filename"] == expected_filename
    assert file_metadata["key"] in record.files.keys
    assert file_metadata["hidden"] is False
    assert file_metadata["fulltext"] is True
    assert file_metadata["original_url"] == expected_original_url

    key = file_metadata["key"]
    expected_url = f"/api/files/{record.files[key].bucket_id}/{key}"
    assert file_metadata["url"] == expected_url


def test_add_file_changed_parameters(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)

    expected_filename = "file_name_for_file.pdf"
    expected_original_url = "http://document_url.cern.ch/file.pdf"

    file_metadata = record._add_file(
        url="http://figure_url.cern.ch/file.png",
        original_url=expected_original_url,
        fulltext=False,
        hidden=True,
        filename=expected_filename,
    )
    assert file_metadata is not None
    assert file_metadata["filename"] == expected_filename
    assert file_metadata["key"] in record.files.keys
    assert file_metadata["hidden"] is True
    assert file_metadata["fulltext"] is False
    assert file_metadata["original_url"] == expected_original_url

    expected_filename = "file.pdf"
    file_metadata = record._add_file(
        url="http://no-file/file.png", original_url=expected_original_url
    )

    assert file_metadata is not None
    assert file_metadata["filename"] == expected_filename


def test_resolving_filename(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)
    expected_filename = "file.png"

    file_metadata = record._add_file(
        url="http://figure_url.cern.ch/file.png", key=expected_filename
    )

    assert expected_filename == file_metadata["filename"]

    file_metadata = record._add_file(
        url="http://figure_url.cern.ch/file.png",
        original_url=f"http://some_path/{expected_filename}",
    )

    assert expected_filename == file_metadata["filename"]

    file_metadata = record._add_file(
        url=f"http://figure_url.cern.ch/{expected_filename}",
        original_url=f"http://some_path/not.proper.filename",
    )

    assert expected_filename == file_metadata["filename"]

    file_metadata = record._add_file(
        url=f"http://figure_url.cern.ch/some_strange_path",
        original_url=f"http://some_path/not.proper.filename",
    )

    assert file_metadata["key"] == file_metadata["filename"]


def test_add_file_already_attached(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)
    expected_filename = "file.png"

    file_metadata = record._add_file(
        url="http://figure_url.cern.ch/file.png", key=expected_filename
    )

    file_metadata2 = record._add_file(url="http://figure_url.cern.ch/file.png")

    assert file_metadata["key"] == file_metadata2["key"]
    assert len(record.files.keys) == 1
    record_metadata2 = create_record_factory("lit")
    record2 = InspireRecord.get_record(record_metadata2.id)

    assert record.id != record2.id

    file_metadata3 = record2._add_file(url="http://figure_url.cern.ch/file.png")

    assert file_metadata["key"] == file_metadata3["key"]

    file1_obj = record.files[file_metadata["key"]].obj
    file3_obj = record2.files[file_metadata3["key"]].obj

    assert file1_obj.bucket_id != file3_obj.bucket_id
    assert file1_obj.file_id == file3_obj.file_id

    url = f"/api/files/{record2.files.bucket.id}/{file3_obj.key}"

    file_metadata4 = record2._add_file(url=url)

    assert file_metadata4 is not None


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_delete_record_with_files(
    fsopen_mock, base_app, db, create_record, init_files_db, enable_files
):
    record_metadata = create_record("lit")
    record = InspireRecord.get_record(record_metadata.id)
    file_metadata = record._add_file(url="http://figure_url.cern.ch/file.png")
    record_metadata2 = create_record("lit")
    record2 = InspireRecord.get_record(record_metadata2.id)

    assert record.id != record2.id

    file_metadata2 = record2._add_file(url="http://figure_url.cern.ch/file.png")
    file1_obj = record.files[file_metadata["key"]].obj
    file2_obj = record2.files[file_metadata2["key"]].obj

    assert file1_obj.file_id == file2_obj.file_id

    record.delete()

    assert len(record.files.keys) == 0
    assert file1_obj.is_head is False

    file1_versions = file1_obj.get_versions(file1_obj.bucket_id, file1_obj.key)
    file1_updated = [file for file in file1_versions if file.is_head is True][0]

    assert file1_updated.is_head is True
    assert file1_updated.deleted is True

    assert file1_updated.file_id is None

    assert file2_obj.is_head is True
    assert file2_obj.deleted is False
    assert file2_obj.file_id is not None


def test_copy_local_file_with_failed_hash_verification(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)
    file_metadata = record._add_file(url="http://figure_url.cern.ch/file.png")
    record.files[file_metadata["key"]] = BytesIO(b"different file content")

    record_metadata2 = create_record_factory("lit")
    record2 = InspireRecord.get_record(record_metadata2.id)
    file_metadata2 = record2._add_file(url="http://figure_url.cern.ch/file.png")
    assert file_metadata is not None

    file1_obj = record.files[file_metadata["key"]].obj
    file2_obj = record2.files[file_metadata2["key"]].obj

    assert file1_obj.file_id != file2_obj.file_id


def test_copy_file_with_old_type_key(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)
    record.files["file_name.txt"] = BytesIO(b"Some file content")
    record_metadata2 = create_record_factory("lit")
    record2 = InspireRecord.get_record(record_metadata2.id)

    url = f"/api/files/{record.files.bucket.id}/file_name.txt"

    key = record2._download_file_from_local_storage(url=url)
    assert key is not None
    assert key != "file_name.txt"

    file1_obj = record.files["file_name.txt"].obj
    file2_obj = record2.files[key]

    assert file1_obj.file_id == file2_obj.file_id
    assert file1_obj.bucket_id != file2_obj.bucket_id


def test_find_local_file_with_null_parameters(
    fsopen_mock, base_app, db, create_record_factory, init_files_db
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)
    assert record._find_local_file(key=None, bucket_id=None) is None
