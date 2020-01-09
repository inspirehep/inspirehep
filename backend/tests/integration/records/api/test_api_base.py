# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


import json
from copy import copy

import pytest
from helpers.providers.faker import faker
from invenio_pidstore.models import PersistentIdentifier, PIDStatus, RecordIdentifier
from invenio_records.models import RecordMetadata

from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.errors import MissingSerializerError, WrongRecordSubclass


def test_base_get_record(base_app, db, es, create_record_factory):
    record = create_record_factory("lit")

    expected_record = InspireRecord.get_record(record.id)

    assert expected_record == record.json


def test_base_get_records(base_app, db, es, create_record_factory):
    records = [
        create_record_factory("lit"),
        create_record_factory("lit"),
        create_record_factory("lit"),
    ]
    record_uuids = [record.id for record in records]

    expected_records = InspireRecord.get_records(record_uuids)

    for record in records:
        assert record.json in expected_records


def test_get_uuid_from_pid_value(base_app, db, es, create_record_factory):
    record = create_record_factory("lit")
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
    record_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert "deleted" in record
    assert PIDStatus.DELETED == record_pid.status


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


def test_regression_hard_delete_record_with_string_pid_value(
    base_app, db, es_clear, create_record_factory, create_pidstore
):
    record_factory = create_record_factory("lit", with_indexing=True)
    create_pidstore(record_factory.id, "pid1", "STRING")

    pid_value_rec = record_factory.json["control_number"]
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record_pids = PersistentIdentifier.query.filter_by(object_uuid=record.id).all()

    assert 2 == len(record_pids)
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


def test_get_records_by_pids(base_app, db, es, create_record_factory):
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


def test_get_records_by_pids_with_empty(base_app, db, es, create_record_factory):
    pids = []

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_linked_records_in_field(base_app, db, es, create_record_factory):
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


def test_get_linked_records_in_field_empty(base_app, db, es, create_record_factory):
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


def test_record_throws_exception_when_serializer_is_not_set(
    base_app, db, create_record_factory
):
    record_metadata = create_record_factory("lit")
    record = InspireRecord(record_metadata.json)
    with pytest.raises(MissingSerializerError):
        record.get_enhanced_es_data()


def test_create_record_throws_exception_if_wrong_subclass_used(base_app, db, es):
    data = faker.record("aut")
    with pytest.raises(WrongRecordSubclass):
        LiteratureRecord.create(data)


def test_earliest_date(base_app, db, datadir):
    data = json.loads((datadir / "1366189.json").read_text())
    record = LiteratureRecord.create(data=data)

    assert record.earliest_date == "2015-05-05"


def test_get_citation_annual_summary(base_app, db, create_record):
    literature1 = create_record("lit", faker.record("lit"))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature1["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature1["control_number"]],
            data={"preprint_date": "2013-01-01"},
        ),
    )
    literature2 = create_record("lit", faker.record("lit"))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature2["control_number"]],
            data={"preprint_date": "2012-01-01"},
        ),
    )
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature2["control_number"]],
            data={"preprint_date": "2013-01-01"},
        ),
    )

    results1 = literature1.citations_by_year
    expected_response1 = [{"year": 2010, "count": 1}, {"year": 2013, "count": 1}]

    assert results1 == expected_response1

    results2 = literature2.citations_by_year
    expected_response2 = [{"year": 2012, "count": 1}, {"year": 2013, "count": 1}]

    assert results2 == expected_response2


def test_record_create_and_update_with_legacy_creation_date(app, db):
    data = {"legacy_creation_date": "2000-01-01"}
    data = faker.record("lit", data=data)
    record = InspireRecord.create(data)

    result_record_model = RecordMetadata.query.filter_by(id=record.id).one()
    result_record_model_created = str(result_record_model.created)
    assert result_record_model_created == "2000-01-01 00:00:00"

    data["legacy_creation_date"] = "2000-01-02"
    data["control_number"] = record["control_number"]
    record.update(data)

    result_record_model_updated = RecordMetadata.query.filter_by(id=record.id).one()
    result_record_model_updated_created = str(result_record_model.created)
    assert result_record_model_updated_created == "2000-01-02 00:00:00"


def test_update_record_without_control_number(app, db, create_record):
    rec = create_record("lit")
    data = copy(rec)
    del data["control_number"]
    with pytest.raises(ValueError):
        rec.update(data)


def test_update_record_with_different_control_number(app, db, create_record):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record = InspireRecord.create(data1)
    with pytest.raises(ValueError):
        record.update(data2)
