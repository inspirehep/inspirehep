# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import uuid

import pytest
from helpers.providers.faker import faker
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.records.api import InspireRecord, InstitutionsRecord


def test_institutions_create(base_app, db, es):
    data = faker.record("ins")
    record = InstitutionsRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="ins", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_institutions_create_with_existing_control_number(
    base_app, db, create_pidstore
):
    data = faker.record("ins", with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="ins",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        InstitutionsRecord.create(data)


def test_institutions_create_with_invalid_data(base_app, db, create_pidstore):
    data = faker.record("ins", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        InstitutionsRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_institutions_update(base_app, db, es):
    data = faker.record("ins", with_control_number=True)
    record = InstitutionsRecord.create(data)

    assert data["control_number"] == record["control_number"]
    data_update = {"public_notes": [{"value": "UPDATED"}]}
    data.update(data_update)
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="ins", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_institutions_create_or_update_with_new_record(base_app, db, es):
    data = faker.record("ins")
    record = InstitutionsRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="ins", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_institutions_create_or_update_with_existing_record(base_app, db, es):
    data = faker.record("ins", with_control_number=True)
    record = InstitutionsRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data_update = {"public_notes": [{"value": "UPDATED"}]}
    data.update(data_update)

    record_updated = InstitutionsRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="ins", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_subclasses_for_institutions():
    expected = {"ins": InstitutionsRecord}
    assert expected == InstitutionsRecord.get_subclasses()


def test_get_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("ins")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert type(record_from_db) == InstitutionsRecord


def test_create_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("ins")
    record = InspireRecord.create(data)
    assert type(record) == InstitutionsRecord
    assert record.pid_type == "ins"

    record = InstitutionsRecord.create(data)
    assert type(record) == InstitutionsRecord
    assert record.pid_type == "ins"


def test_create_or_update_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("ins")
    record = InspireRecord.create_or_update(data)
    assert type(record) == InstitutionsRecord
    assert record.pid_type == "ins"

    data_update = {"deleted": True}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert type(record) == InstitutionsRecord
    assert record.pid_type == "ins"


def test_aut_citation_count_property_blows_up_on_wrong_pid_type(base_app, db, es):
    data = faker.record("ins")
    record = InstitutionsRecord.create(data)

    with pytest.raises(AttributeError):
        record.citation_count
