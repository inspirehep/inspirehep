# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import pytest
from helpers.providers.faker import faker

from inspirehep.records.api import (
    AuthorsRecord,
    ConferencesRecord,
    DataRecord,
    ExperimentsRecord,
    InspireRecord,
    InstitutionsRecord,
    JobsRecord,
    JournalsRecord,
    LiteratureRecord,
)
from inspirehep.records.marshmallow.base import InspireAllFieldsWithRecidSchema
from inspirehep.records.marshmallow.conferences import (
    ConferencesMetadataRawFieldsSchemaV1,
)


def test_strip_empty_values():
    empty_fields = {"empty_string": "", "empty_array": [], "empty_dict": {}}
    data = faker.record("lit")
    data.update(empty_fields)
    data_stripped = InspireRecord.strip_empty_values(data)

    assert "empty_string" not in data_stripped
    assert "empty_array" not in data_stripped
    assert "empty_dict" not in data_stripped


def test_split_url_from_http_with_filename():
    request = "http://some_url.com/some_api/filename.txt"
    expected_response = {"file": "filename.txt", "bucket": None}
    assert InspireRecord.split_url(request) == expected_response


def test_split_url_from_http_with_filename_and_fake_bucket_id():
    request = "https://some_url.com/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/file.txt"
    expected_response = {"file": "file.txt", "bucket": None}

    assert InspireRecord.split_url(request) == expected_response


def test_split_url_from_local_api_with_old_filename():
    request = "/api/files/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/different_filename.pdf"
    expected_response = {
        "file": "different_filename.pdf",
        "bucket": "1b6d53a5-0d96-431f-bee6-1e07c59c0fbb",
    }

    assert InspireRecord.split_url(request) == expected_response


def test_split_url_from_local_api_with_new_file_key():
    request = (
        "/api/files/980e0985-be35-4301-af3d-e1ec6a1208e2/"
        "5b9cc946ba36be6a60d25708a81bb2c105f04c1f"
    )
    expected_response = {
        "file": "5b9cc946ba36be6a60d25708a81bb2c105f04c1f",
        "bucket": "980e0985-be35-4301-af3d-e1ec6a1208e2",
    }

    assert InspireRecord.split_url(request) == expected_response


def test_split_url_from_http_without_filename_and_hash():
    request = "http://some_url.com"
    with pytest.raises(ValueError):
        InspireRecord.split_url(request)


def test_split_url_from_local_api_without_filename_and_hash():
    request = "/api/files"
    with pytest.raises(ValueError):
        InspireRecord.split_url(request)


def test_split_url_from_local_api_with_wrong_file_hash():
    request = (
        "/api/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/"
        "5b9cc946ba36be6a60d25708a81bb2c105f04c1"
    )
    with pytest.raises(ValueError):
        InspireRecord.split_url(request)


def test_split_url_from_local_api_with_wrong_bucket_id():
    request = "/api/1b6d53a5-0d96-431f-bee6-e07c59c0fb/correct_file.txt"
    with pytest.raises(ValueError):
        InspireRecord.split_url(request)


def test_split_url_from_http_with_wrong_filename():
    request = "https://980e0985-be35-4301-af3d-e1ec6a1208e2/file_without_dot"
    with pytest.raises(ValueError):
        InspireRecord.split_url(request)


def test_split_url_from_local_api_without_filename():
    request = "/api/980e0985-be35-4301-af3d-e1ec6a1208e2"
    with pytest.raises(ValueError):
        InspireRecord.split_url(request)


def test_hash_check():
    correct_hashes = [
        "5b9cc946ba36be6a60d25708a81bb2c105f04c1f",
        "a1301e1ae9c4b2ca1b6cbc30ca7cc0dd2cb072b6",
        "37aa63c77398d954473262e1a0057c1e632eda77",
    ]

    wrong_hashes = ["file_name", "some_file.txt", "other_strange_file_name.pdf"]

    for hash in correct_hashes:
        assert InspireRecord.is_hash(hash) is True
    for wrong_hash in wrong_hashes:
        assert InspireRecord.is_hash(wrong_hash) is False


def test_bucket_uuid_check():
    correct_uuids = [
        "0dbb7c7f-b9e3-4d1d-8bbb-ae6d54e00000",
        "8f27dc2c-0ece-418d-841e-3a18cf10cd28",
        "8f27dc2c0ece418d841e3a18cf10cd28",
        "b23441a6-02c5483b-9e7e-7084dc600702",
    ]

    wrong_uuids = [
        "a1301e1ae9c4b2ca1b6cbc30ca7cc0dd2cb072b6",
        "file_name",
        "file-name.txt",
        "ee0e39c2-3760-4cce-a5a5-3a0643de309" "incorrect/",
        "0dbb7c7f-b9e3/d1d-8bbb-ae6d54e00000",
    ]

    for uuid in correct_uuids:
        assert InspireRecord.is_bucket_uuid(uuid) is True
    for wrong_uuid in wrong_uuids:
        assert InspireRecord.is_bucket_uuid(wrong_uuid) is False


def test_filenames_check():
    correct_filenames = ["filename.txt", "file.pdf", "some_name.png"]

    wrong_filenames = [
        "file/name.txt",
        "file_name",
        "file name",
        "some_file_name.more_letters",
        "^%&$RGFE#.#@$",
    ]

    for name in correct_filenames:
        assert InspireRecord.is_filename(name) is True
    for wrong_name in wrong_filenames:
        assert InspireRecord.is_filename(wrong_name) is False


def test_empty_data_for_hashing():
    with pytest.raises(ValueError):
        InspireRecord.hash_data(data=None)


def test_get_subclasses_from_inspire_records():
    expected = {
        "lit": LiteratureRecord,
        "aut": AuthorsRecord,
        "job": JobsRecord,
        "jou": JournalsRecord,
        "exp": ExperimentsRecord,
        "con": ConferencesRecord,
        "dat": DataRecord,
        "ins": InstitutionsRecord,
    }
    subclasses = InspireRecord.get_subclasses()

    assert subclasses == expected


def test_get_records_pid_from_field():
    data = {
        "references": [
            {
                "record": "http://labs.inspirehep.net/api/literature/98765",
                "reference": {
                    "misc": ["abcd", "defg"],
                    "label": "qwerty",
                    "record": {
                        "$ref": "http://labs.inspirehep.net/api/literature/339134"
                    },
                },
            }
        ],
        "publication_info": {"year": 1984},
        "some_stuff": {"other_stuff": "not_related"},
        "different_field": "http://labs.inspirehep.net/api/literature/329134",
        "other_record": {"$ref": ["http://labs.inspirehep.net/api/literature/319136"]},
    }

    path_1 = "references.reference.record"
    expected_1 = [("lit", "339134")]

    path_2 = "some_stuff"
    expected_2 = []

    path_3 = "other_record"
    expected_3 = [("lit", "319136")]

    assert InspireRecord._get_linked_pids_from_field(data, path_1) == expected_1
    assert InspireRecord._get_linked_pids_from_field(data, path_2) == expected_2
    assert InspireRecord._get_linked_pids_from_field(data, path_3) == expected_3


def test_on_not_deleted_record_index_on_InspireRecord():
    record = {"control_number": 1234, "deleted": False}
    expected = {"uuid": "1", "force_delete": False}
    expected_force_deleted = {"uuid": "1", "force_delete": True}

    assert InspireRecord._record_index(record, _id=1) == expected
    assert InspireRecord._record_index(record, _id=1, force_delete=False) == expected
    assert (
        InspireRecord._record_index(record, _id=1, force_delete=True)
        == expected_force_deleted
    )


def test_on_deleted_record_index_on_InspireRecord():
    record = {"control_number": 4321, "deleted": True}
    expected = {"uuid": "1", "force_delete": True}

    assert InspireRecord._record_index(record, _id=1) == expected
    assert InspireRecord._record_index(record, _id=1, force_delete=False) == expected
    assert InspireRecord._record_index(record, _id=1, force_delete=True) == expected


def test_get_subclasses():
    subclasses = InspireRecord.get_subclasses()
    expected_subclasses = {
        "lit": LiteratureRecord,
        "aut": AuthorsRecord,
        "job": JobsRecord,
        "jou": JournalsRecord,
        "exp": ExperimentsRecord,
        "con": ConferencesRecord,
        "dat": DataRecord,
        "ins": InstitutionsRecord,
    }

    assert subclasses == expected_subclasses


@mock.patch("invenio_records.api.Record.get_record")
@mock.patch(
    "inspirehep.records.api.base.PidStoreBase.get_pid_type_from_schema",
    return_value="lit",
)
@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord.get_record",
    return_value=LiteratureRecord({}),
)
def test_finding_proper_class_in_get_record_lit(
    get_record_mock, get_pid_mock, invenio_record_mock
):
    created_record = InspireRecord.get_record(id_="something")
    expected_record_type = LiteratureRecord

    assert type(created_record) == expected_record_type


@mock.patch("invenio_records.api.Record.get_record")
@mock.patch(
    "inspirehep.records.api.base.PidStoreBase.get_pid_type_from_schema",
    return_value="aut",
)
@mock.patch(
    "inspirehep.records.api.authors.AuthorsRecord.get_record",
    return_value=AuthorsRecord(data={}),
)
def test_finding_proper_class_in_get_record_aut(
    get_record_mock, get_pid_mock, invenio_record_mock
):
    created_record = InspireRecord.get_record(id_="something")
    expected_record_type = AuthorsRecord

    assert type(created_record) == expected_record_type


def test_record_index_static_method():
    data = {"control_number": 123}

    expected_1 = {"uuid": "1", "force_delete": False}

    expected_1_deleted = {"uuid": "1", "force_delete": True}

    assert expected_1 == InspireRecord._record_index(data, _id=1)
    assert expected_1_deleted == InspireRecord._record_index(
        data, _id=1, force_delete=True
    )


def test_record_deleted_index_static_method():
    data = {"control_number": 123, "deleted": True}

    expected_1 = {"uuid": "1", "force_delete": True}

    expected_1_deleted = {"uuid": "1", "force_delete": True}

    assert expected_1 == InspireRecord._record_index(data, _id=1)
    assert expected_1_deleted == InspireRecord._record_index(
        data, _id=1, force_delete=False
    )


@mock.patch("inspirehep.records.api.base.InspireRecord._get_records_ids_by_pids")
def test_get_records_ids_by_pids_function_is_properly_called_with_parameters(PI_mock):
    pids = [("lit", 1), ("lit", 2), ("lit", 3), ("lit", 4), ("lit", 5)]
    ids_generator = InspireRecord.get_records_ids_by_pids(pids, 3)
    # Calling generator to process all elements so mocked function
    # _get_records_ids_by_pids will be called with parameters
    [t for t in ids_generator]
    expected_call_list = [
        mock.call([("lit", 1), ("lit", 2), ("lit", 3)]),
        mock.call([("lit", 4), ("lit", 5)]),
    ]

    assert PI_mock.call_count == 2
    assert PI_mock.call_args_list == expected_call_list


def test_populate_recid_from_ref():

    record_data = {
        "simple_key": {"$ref": "http://x/y/1"},
        "key_with_record": {"$ref": "http://x/y/2"},
        "record": {"$ref": "http://x/y/3"},
        "embedded_list": [{"record": {"$ref": "http://x/y/4"}}],
        "embedded_record": {"record": {"$ref": "http://x/y/5"}},
    }

    class TestRecidSchema(InspireAllFieldsWithRecidSchema):
        pass

    TestRecidSchema().populate_recid_from_ref(record_data)

    assert record_data["simple_key_recid"] == 1
    assert record_data["key_with_recid"] == 2
    assert record_data["recid"] == 3
    assert record_data["embedded_list"][0]["recid"] == 4
    assert record_data["embedded_record"]["recid"] == 5


def test_populate_recid_from_ref_handles_deleted_records():
    record_data = {
        "deleted_records": [{"$ref": "http://x/y/1"}, {"$ref": "http://x/y/2"}]
    }

    class TestRecidSchema(InspireAllFieldsWithRecidSchema):
        pass

    TestRecidSchema().populate_recid_from_ref(record_data)

    assert record_data["deleted_recids"] == [1, 2]
