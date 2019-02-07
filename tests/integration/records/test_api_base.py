# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

from __future__ import absolute_import, division, print_function

import pytest
from helpers.providers.faker import faker
from invenio_pidstore.models import PersistentIdentifier, RecordIdentifier
from invenio_records.models import RecordMetadata

from inspirehep.records.api import InspireRecord
from inspirehep.records.api.base import InspireQueryBuilder


def test_query_builder_returns_not_deleted(base_app, db, create_record):
    create_record("lit", data={"deleted": True})
    not_deleted_record = create_record("lit", data={"deleted": False})

    not_deleted_records = InspireQueryBuilder().not_deleted().query().all()

    assert len(not_deleted_records) == 1
    assert not_deleted_records[0].json == not_deleted_record.json


def test_query_builder_returns_by_collections(base_app, db, create_record):
    literature_record = create_record("lit", data={"_collections": ["Literature"]})
    create_record("lit", data={"_collections": ["Other"]})

    literature_records = (
        InspireQueryBuilder().by_collections(["Literature"]).query().all()
    )

    assert len(literature_records) == 1
    assert literature_records[0].json == literature_record.json


def test_query_builder_returns_no_duplicates(base_app, db, create_record):
    create_record("lit", with_pid=False, data={"control_number": 1})
    create_record("lit", with_pid=False, data={"control_number": 1})
    create_record("lit", with_pid=False, data={"control_number": 1})

    literature_records = InspireQueryBuilder().no_duplicates().query().all()

    assert len(literature_records) == 1


# FIXME: maybe too brittle, need to find another way to test chainability
def test_query_builder_returns_no_duplicated_not_deleted_by_collections(
    base_app, db, create_record
):
    record = create_record(
        "lit",
        data={"deleted": False, "_collections": ["Literature"], "control_number": 1},
    )
    create_record(
        "lit", data={"deleted": False, "_collections": ["Other"], "control_number": 2}
    )
    create_record(
        "lit",
        with_pid=False,
        data={"deleted": False, "_collections": ["Literature"], "control_number": 1},
    )
    create_record("lit", data={"deleted": True, "_collections": ["Literature"]})

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


def test_base_get_record(base_app, db, create_record):
    record = create_record("lit")

    expected_record = InspireRecord.get_record(record.id)

    assert expected_record == record.json


def test_base_get_records(base_app, db, create_record):
    records = [create_record("lit"), create_record("lit"), create_record("lit")]
    record_uuids = [record.id for record in records]

    expected_records = InspireRecord.get_records(record_uuids)

    for record in records:
        assert record.json in expected_records


def test_get_uuid_from_pid_value(base_app, db, create_record):
    record = create_record("lit")
    record_uuid = record.id
    record_pid_type = record._persistent_identifier.pid_type
    record_pid_value = record._persistent_identifier.pid_value

    expected_record_uuid = InspireRecord.get_uuid_from_pid_value(
        record_pid_value, pid_type=record_pid_type
    )

    assert expected_record_uuid == record_uuid


def test_soft_delete_record(base_app, db, create_record):
    record_factory = create_record("lit")
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record.delete()
    record_pid = PersistentIdentifier.query.filter_by(
        object_uuid=record.id
    ).one_or_none()

    assert "deleted" in record
    assert record_pid is None


def test_hard_delete_record(base_app, db, create_record, create_pidstore):
    record_factory = create_record("lit")
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


def test_redirect_records(base_app, db, create_record):
    current_factory = create_record("lit")
    other_factory = create_record("lit")

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


def test_get_records_by_pids(base_app, db, create_record):
    records = [create_record("lit"), create_record("lit"), create_record("lit")]

    pids = [("lit", str(record.json["control_number"])) for record in records]

    expected_result_len = 3
    expected_result = [record.json for record in records]

    result = InspireRecord.get_records_by_pids(pids)
    result = list(result)

    assert expected_result_len == len(result)
    for record in result:
        assert record in expected_result


def test_get_records_by_pids_with_not_existing_pids(base_app, db, create_record):
    pids = [("lit", "123"), ("aut", "234"), ("lit", "345")]

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_records_by_pids_with_empty(base_app, db, create_record):
    pids = []

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_linked_records_in_field(base_app, db, create_record):
    record_reference = create_record("lit")
    record_reference_control_number = record_reference.json["control_number"]
    record_reference_uri = "http://localhost:5000/api/literature/{}".format(
        record_reference_control_number
    )

    data = {"references": [{"record": {"$ref": record_reference_uri}}]}

    record = create_record("lit", data=data)

    expected_result_len = 1
    expected_result = [record_reference.json]

    result = InspireRecord.get_linked_records_in_field(record.json, "references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_empty(base_app, db, create_record):
    expected_result_len = 0
    expected_result = []

    result = InspireRecord.get_linked_records_in_field({}, "references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_not_existing_linked_record(
    base_app, db, create_record
):
    record_reference_uri = "http://localhost:5000/api/literature/{}".format(123)

    data = {"references": [{"record": {"$ref": record_reference_uri}}]}

    record = create_record("lit", data=data)

    expected_result_len = 0
    expected_result = []

    result = InspireRecord.get_linked_records_in_field(record.json, "references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_with_different_pid_types(
    base_app, db, create_record
):
    record_reference_lit = create_record("lit")
    record_reference_lit_control_number = record_reference_lit.json["control_number"]
    record_reference_lit_uri = "http://localhost:5000/api/literature/{}".format(
        record_reference_lit_control_number
    )

    record_reference_aut = create_record("aut")
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

    record = create_record("lit", data=data)

    expected_result_len = 2
    expected_result = [record_reference_lit.json, record_reference_aut.json]

    result = InspireRecord.get_linked_records_in_field(record.json, "references.record")
    result = list(result)

    assert expected_result_len == len(result)
    for record in result:
        assert record in expected_result
