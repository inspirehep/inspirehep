# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import uuid

import pytest
from helpers.providers.faker import faker
from helpers.utils import create_pidstore, create_record
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.records.api import DataRecord, InspireRecord
from inspirehep.records.models import RecordCitations


def test_data_create(inspire_app):
    data = faker.record("dat")
    record = DataRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="dat", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_data_create_with_existing_control_number(inspire_app):
    data = faker.record("dat", with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="dat",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        DataRecord.create(data)


def test_data_create_with_invalid_data(inspire_app):
    data = faker.record("dat", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        DataRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_data_update(inspire_app):
    data = faker.record("dat", with_control_number=True)
    record = DataRecord.create(data)

    assert data["control_number"] == record["control_number"]
    data_update = {"dois": [{"value": "10.1000/UPDATED"}]}
    data.update(data_update)
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="dat", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_data_create_or_update_with_new_record(inspire_app):
    data = faker.record("dat")
    record = DataRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="dat", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_data_create_or_update_with_existing_record(inspire_app):
    data = faker.record("dat", with_control_number=True)
    record = DataRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data_update = {"dois": [{"value": "10.1000/UPDATED"}]}
    data.update(data_update)

    record_updated = DataRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="dat", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_get_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("dat")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert isinstance(record_from_db, DataRecord)


def test_create_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("dat")
    record = InspireRecord.create(data)
    assert isinstance(record, DataRecord)
    assert record.pid_type == "dat"

    record = DataRecord.create(data)
    assert isinstance(record, DataRecord)
    assert record.pid_type == "dat"


def test_create_or_update_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("dat", with_control_number=True)
    record = InspireRecord.create_or_update(data)
    assert isinstance(record, DataRecord)
    assert record.pid_type == "dat"

    data_update = {"deleted": True}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert isinstance(record, DataRecord)
    assert record.pid_type == "dat"


def test_create_record_update_citation_table_for_literature_citation(inspire_app):
    data = faker.record("dat")
    record = DataRecord.create(data)

    data2 = faker.record("lit", data_citations=[record["control_number"]])
    record2 = InspireRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_data_citation_count_property(inspire_app):
    data = faker.record("dat")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", data_citations=[record["control_number"]])
    record2 = InspireRecord.create(data2)

    assert record.citation_count == 1
    assert record2.citation_count == 0


def test_cn_redirection_works_for_data(inspire_app):
    redirected_record = create_record("dat")
    record = create_record("dat", data={"deleted_records": [redirected_record["self"]]})

    original_record = DataRecord.get_uuid_from_pid_value(
        redirected_record["control_number"], original_record=True
    )
    new_record = DataRecord.get_uuid_from_pid_value(redirected_record["control_number"])

    assert original_record != new_record
    assert original_record == redirected_record.id
    assert new_record == record.id
