# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


import hashlib
import json
import os
import uuid
from io import BytesIO

import pytest
from flask import current_app
from fs.errors import ResourceNotFoundError
from helpers.providers.faker import faker
from invenio_pidstore.models import PersistentIdentifier, RecordIdentifier
from invenio_records.errors import MissingModelError
from invenio_records.models import RecordMetadata
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.api.base import InspireQueryBuilder
from inspirehep.records.errors import MissingSerializerError, WrongRecordSubclass
from inspirehep.records.fixtures import init_storage_path


def test_query_builder_returns_not_deleted(base_app, db, create_record_factory):
    create_record_factory("lit", data={"deleted": True})
    not_deleted_record = create_record_factory("lit", data={"deleted": False})

    not_deleted_records = InspireQueryBuilder().not_deleted().query().all()

    assert len(not_deleted_records) == 1
    assert not_deleted_records[0].json == not_deleted_record.json


def test_query_builder_returns_by_collections(base_app, db, create_record_factory):
    literature_record = create_record_factory(
        "lit", data={"_collections": ["Literature"]}
    )
    create_record_factory("lit", data={"_collections": ["Other"]})

    literature_records = (
        InspireQueryBuilder().by_collections(["Literature"]).query().all()
    )

    assert len(literature_records) == 1
    assert literature_records[0].json == literature_record.json


def test_query_builder_returns_no_duplicates(base_app, db, create_record_factory):
    create_record_factory("lit", with_pid=False, data={"control_number": 1})
    create_record_factory("lit", with_pid=False, data={"control_number": 1})
    create_record_factory("lit", with_pid=False, data={"control_number": 1})

    literature_records = InspireQueryBuilder().no_duplicates().query().all()

    assert len(literature_records) == 1


# FIXME: maybe too brittle, need to find another way to test chainability
def test_query_builder_returns_no_duplicated_not_deleted_by_collections(
    base_app, db, create_record_factory
):
    record = create_record_factory(
        "lit",
        data={"deleted": False, "_collections": ["Literature"], "control_number": 1},
    )
    create_record_factory(
        "lit", data={"deleted": False, "_collections": ["Other"], "control_number": 2}
    )
    create_record_factory(
        "lit",
        with_pid=False,
        data={"deleted": False, "_collections": ["Literature"], "control_number": 1},
    )
    create_record_factory("lit", data={"deleted": True, "_collections": ["Literature"]})

    records = (
        InspireQueryBuilder()
        .by_collections(["Literature"])
        .not_deleted()
        .no_duplicates()
        .query()
        .all()
    )

    assert len(records) == 1
    assert records[0].json == record.json


def test_base_get_record(base_app, db, create_record_factory):
    record = create_record_factory("lit")

    expected_record = InspireRecord.get_record(record.id)

    assert expected_record == record.json


def test_base_get_records(base_app, db, create_record_factory):
    records = [
        create_record_factory("lit"),
        create_record_factory("lit"),
        create_record_factory("lit"),
    ]
    record_uuids = [record.id for record in records]

    expected_records = InspireRecord.get_records(record_uuids)

    for record in records:
        assert record.json in expected_records


def test_get_uuid_from_pid_value(base_app, db, create_record_factory):
    record = create_record_factory("lit")
    record_uuid = record.id
    record_pid_type = record._persistent_identifier.pid_type
    record_pid_value = record._persistent_identifier.pid_value

    expected_record_uuid = InspireRecord.get_uuid_from_pid_value(
        record_pid_value, pid_type=record_pid_type
    )

    assert expected_record_uuid == record_uuid


def test_soft_delete_record(base_app, db, create_record_factory, init_files_db):
    record_factory = create_record_factory("lit")
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record.delete()
    record_pid = PersistentIdentifier.query.filter_by(
        object_uuid=record.id
    ).one_or_none()

    assert "deleted" in record
    assert record_pid is None


def test_hard_delete_record(base_app, db, create_record_factory, create_pidstore):
    record_factory = create_record_factory("lit")
    create_pidstore(record_factory.id, "pid1", faker.control_number())
    create_pidstore(record_factory.id, "pid2", faker.control_number())
    create_pidstore(record_factory.id, "pid3", faker.control_number())

    pid_value_rec = record_factory.json["control_number"]
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record_pids = PersistentIdentifier.query.filter_by(object_uuid=record.id).all()

    assert 4 == len(record_pids)
    assert record_factory.json == record

    record.hard_delete()
    record = RecordMetadata.query.filter_by(id=record_uuid).one_or_none()
    record_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record_uuid
    ).one_or_none()
    record_identifier = RecordIdentifier.query.filter_by(
        recid=pid_value_rec
    ).one_or_none()

    assert record is None
    assert record_pids is None
    assert record_identifier is None


def test_redirect_records(base_app, db, create_record_factory):
    current_factory = create_record_factory("lit")
    other_factory = create_record_factory("lit")

    current = InspireRecord.get_record(current_factory.id)
    other = InspireRecord.get_record(other_factory.id)

    current.redirect(other)

    current_pids = PersistentIdentifier.query.filter(
        PersistentIdentifier.object_uuid == current_factory.id
    ).all()
    other_pid = PersistentIdentifier.query.filter(
        PersistentIdentifier.object_uuid == other_factory.id
    ).one()

    assert current["deleted"] is True
    for current_pid in current_pids:
        assert current_pid.get_redirect() == other_pid


def test_get_records_by_pids(base_app, db, create_record_factory):
    records = [
        create_record_factory("lit"),
        create_record_factory("lit"),
        create_record_factory("lit"),
    ]

    pids = [("lit", str(record.json["control_number"])) for record in records]

    expected_result_len = 3
    expected_result = [record.json for record in records]

    result = InspireRecord.get_records_by_pids(pids)
    result = list(result)

    assert expected_result_len == len(result)
    for record in result:
        assert record in expected_result


def test_get_records_by_pids_with_not_existing_pids(
    base_app, db, create_record_factory
):
    pids = [("lit", "123"), ("aut", "234"), ("lit", "345")]

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_records_by_pids_with_empty(base_app, db, create_record_factory):
    pids = []

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_linked_records_in_field(base_app, db, create_record_factory):
    record_reference = create_record_factory("lit")
    record_reference_control_number = record_reference.json["control_number"]
    record_reference_uri = "http://localhost:5000/api/literature/{}".format(
        record_reference_control_number
    )

    data = {"references": [{"record": {"$ref": record_reference_uri}}]}

    record = create_record_factory("lit", data=data)

    expected_result_len = 1
    expected_result = [record_reference.json]

    result = LiteratureRecord.get_record_by_pid_value(
        record.json["control_number"]
    ).get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_empty(base_app, db, create_record_factory):
    expected_result_len = 0
    expected_result = []
    record = InspireRecord({})
    result = record.get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_not_existing_linked_record(
    base_app, db, create_record_factory
):
    record_reference_uri = "http://localhost:5000/api/literature/{}".format(123)

    data = {"references": [{"record": {"$ref": record_reference_uri}}]}

    record = create_record_factory("lit", data=data)

    expected_result_len = 0
    expected_result = []

    result = LiteratureRecord.get_record_by_pid_value(
        record.json["control_number"]
    ).get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_with_different_pid_types(
    base_app, db, create_record_factory
):
    record_reference_lit = create_record_factory("lit")
    record_reference_lit_control_number = record_reference_lit.json["control_number"]
    record_reference_lit_uri = "http://localhost:5000/api/literature/{}".format(
        record_reference_lit_control_number
    )

    record_reference_aut = create_record_factory("aut")
    record_reference_aut_control_number = record_reference_aut.json["control_number"]
    record_reference_aut_uri = "http://localhost:5000/api/authors/{}".format(
        record_reference_aut_control_number
    )

    data = {
        "references": [
            {"record": {"$ref": record_reference_lit_uri}},
            {"record": {"$ref": record_reference_aut_uri}},
        ]
    }

    record = create_record_factory("lit", data=data)

    expected_result_len = 2
    expected_result = [record_reference_lit.json, record_reference_aut.json]

    result = LiteratureRecord.get_record_by_pid_value(
        record.json["control_number"]
    ).get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    for record in result:
        assert record in expected_result


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
        f"{dir_path}/test_data/test_document.pdf", mode="rb"
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


def test_delete_record_with_files(
    fsopen_mock, base_app, db, create_record_factory, init_files_db, enable_files
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord.get_record(record_metadata.id)
    file_metadata = record._add_file(url="http://figure_url.cern.ch/file.png")
    record_metadata2 = create_record_factory("lit")
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


def test_record_throws_exception_when_serializer_is_not_set(
    base_app, db, create_record_factory
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord(record_metadata.json)
    with pytest.raises(MissingSerializerError):
        record.get_serialized_data()


def test_create_record_throws_exception_if_wrong_subclass_used(base_app, db):
    data = faker.record("aut")
    with pytest.raises(WrongRecordSubclass):
        LiteratureRecord.create(data)


def test_get_earliest_date(base_app, db, datadir, create_record_factory, disable_files):
    data = json.loads((datadir / "1366189.json").read_text())
    record = LiteratureRecord.create(data=data)

    assert record.get_earliest_date() == "2015-05-05"
