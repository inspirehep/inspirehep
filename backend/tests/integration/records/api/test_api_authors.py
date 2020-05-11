# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
import uuid

import pytest
from helpers.providers.faker import faker
from helpers.utils import create_pidstore, create_record
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.records.api import AuthorsRecord, InspireRecord


def test_authors_create(inspire_app):
    data = faker.record("aut")
    record = AuthorsRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="aut", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_authors_create_with_existing_control_number(inspire_app):
    data = faker.record("aut", with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="aut",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        AuthorsRecord.create(data)


def test_authors_create_with_invalid_data(inspire_app):
    data = faker.record("aut", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        AuthorsRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_authors_update(inspire_app):
    data = faker.record("aut", with_control_number=True)
    record = AuthorsRecord.create(data)

    assert data["control_number"] == record["control_number"]
    data_update = {
        "name": {
            "name_variants": ["UPDATED"],
            "preferred_name": "UPDATED",
            "value": "UPDATED",
        }
    }
    data.update(data_update)
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="aut", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_authors_create_or_update_with_new_record(inspire_app):
    data = faker.record("aut")
    record = AuthorsRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="aut", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_or_update_with_existing_record(inspire_app):
    data = faker.record("aut", with_control_number=True)
    record = AuthorsRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data_update = {
        "name": {
            "name_variants": ["UPDATED"],
            "preferred_name": "UPDATED",
            "value": "UPDATED",
        }
    }
    data.update(data_update)

    record_updated = AuthorsRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="aut", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_get_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("aut")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert type(record_from_db) == AuthorsRecord


def test_create_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("aut")
    record = InspireRecord.create(data)
    assert type(record) == AuthorsRecord
    assert record.pid_type == "aut"

    record = AuthorsRecord.create(data)
    assert type(record) == AuthorsRecord
    assert record.pid_type == "aut"


def test_create_or_update_record_from_db_depending_on_its_pid_type(inspire_app):
    data = faker.record("aut")
    record = InspireRecord.create_or_update(data)
    assert type(record) == AuthorsRecord
    assert record.pid_type == "aut"

    data_update = {"name": {"value": "UPDATED"}}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert type(record) == AuthorsRecord
    assert record.pid_type == "aut"


def test_get_author_papers(inspire_app):
    author = create_record("aut")

    author_cn = author["control_number"]
    lit_data = {
        "authors": [
            {
                "record": {
                    "$ref": f"https://labs.inspirehep.net/api/authors/{author_cn}"
                },
                "full_name": author["name"]["value"],
            }
        ]
    }
    lit_1 = create_record("lit", data=lit_data)
    lit_2 = create_record("lit")

    author_papers = author.get_papers_uuids()
    assert str(lit_1.id) in author_papers
    assert str(lit_2.id) not in author_papers
