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

from inspirehep.records.api import ConferencesRecord, InspireRecord
from inspirehep.records.models import ConferenceLiterature


def test_conferences_create(base_app, db, es):
    data = faker.record("con")
    record = ConferencesRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="con", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_conferences_create_with_existing_control_number(base_app, db, create_pidstore):
    data = faker.record("con", with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="con",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        ConferencesRecord.create(data)


def test_conferences_create_with_invalid_data(base_app, db, create_pidstore):
    data = faker.record("con", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        ConferencesRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_conferences_update(base_app, db, es):
    data = faker.record("con", with_control_number=True)
    record = ConferencesRecord.create(data)

    assert data["control_number"] == record["control_number"]
    data_update = {"public_notes": [{"value": "UPDATED"}]}
    data.update(data_update)
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="con", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_conferences_create_or_update_with_new_record(base_app, db, es):
    data = faker.record("con")
    record = ConferencesRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="con", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_conferences_create_or_update_with_existing_record(base_app, db, es):
    data = faker.record("con", with_control_number=True)
    record = ConferencesRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data_update = {"public_notes": [{"value": "UPDATED"}]}
    data.update(data_update)

    record_updated = ConferencesRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="con", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_subclasses_for_conferences():
    expected = {"con": ConferencesRecord}
    assert expected == ConferencesRecord.get_subclasses()


def test_get_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("con")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert type(record_from_db) == ConferencesRecord


def test_create_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("con")
    record = InspireRecord.create(data)
    assert type(record) == ConferencesRecord
    assert record.pid_type == "con"

    record = ConferencesRecord.create(data)
    assert type(record) == ConferencesRecord
    assert record.pid_type == "con"


def test_create_or_update_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("con")
    record = InspireRecord.create_or_update(data)
    assert type(record) == ConferencesRecord
    assert record.pid_type == "con"

    data_update = {"titles": [{"title": "UPDATED"}]}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert type(record) == ConferencesRecord
    assert record.pid_type == "con"


def test_aut_citation_count_property_blows_up_on_wrong_pid_type(base_app, db, es):
    data = faker.record("con")
    record = ConferencesRecord.create(data)

    with pytest.raises(AttributeError):
        record.citation_count


def test_deleted_conference_clears_entries_in_conference_literature_table(
    base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }
    rec = create_record("lit", rec_data)
    assert ConferenceLiterature.query.filter_by(literature_uuid=rec.id).count() == 1
    conference.delete()

    assert ConferenceLiterature.query.filter_by(literature_uuid=rec.id).count() == 0


def test_hard_delete_conference_clears_entries_in_conference_literature_table(
    base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }
    rec = create_record("lit", rec_data)
    assert ConferenceLiterature.query.filter_by(literature_uuid=rec.id).count() == 1
    conference.hard_delete()

    assert ConferenceLiterature.query.filter_by(literature_uuid=rec.id).count() == 0
