# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import uuid

import pytest
from helpers.providers.faker import faker
from helpers.utils import create_pidstore
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.records.api import InspireRecord, JournalsRecord


def test_journals_create(inspire_app):
    data = faker.record("jou")
    record = JournalsRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="jou", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_journals_create_with_existing_control_number(inspire_app):
    data = faker.record("jou", with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="jou",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        JournalsRecord.create(data)


def test_journals_create_with_invalid_data(inspire_app):
    data = faker.record("jou", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        JournalsRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_journals_update(inspire_app):
    data = faker.record("jou", with_control_number=True)
    record = JournalsRecord.create(data)

    assert data["control_number"] == record["control_number"]
    data_update = {"public_notes": [{"value": "UPDATED"}]}
    data.update(data_update)
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="jou", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_journals_create_or_update_with_new_record(inspire_app):
    data = faker.record("jou")
    record = JournalsRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="jou", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_journals_create_or_update_with_existing_record(inspire_app):
    data = faker.record("jou", with_control_number=True)
    record = JournalsRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data_update = {"public_notes": [{"value": "UPDATED"}]}
    data.update(data_update)

    record_updated = JournalsRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="jou", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_get_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("jou")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert type(record_from_db) == JournalsRecord


def test_create_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("jou")
    record = InspireRecord.create(data)
    assert type(record) == JournalsRecord
    assert record.pid_type == "jou"

    record = JournalsRecord.create(data)
    assert type(record) == JournalsRecord
    assert record.pid_type == "jou"


def test_create_or_update_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("jou")
    record = InspireRecord.create_or_update(data)
    assert type(record) == JournalsRecord
    assert record.pid_type == "jou"

    data_update = {"short_title": "Updated"}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert type(record) == JournalsRecord
    assert record.pid_type == "jou"


def test_aut_citation_count_property_blows_up_on_wrong_pid_type(inspire_app):
    data = faker.record("jou")
    record = JournalsRecord.create(data)

    with pytest.raises(AttributeError):
        record.citation_count
