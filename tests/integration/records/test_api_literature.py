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
from mock import MagicMock, patch

from inspirehep.records.api import LiteratureRecord


def test_literature_create(base_app, db):
    data = faker.record()
    record = LiteratureRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_with_mutliple_pids(base_app, db, create_pidstore):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record(with_control_number=True, data=data)

    expected_pids_len = 3
    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record = LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    record_total_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id
    ).count()

    assert expected_pids_len == record_total_pids
    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value


def test_literature_create_with_existing_control_number(base_app, db, create_pidstore):
    data = faker.record(with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="lit",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        LiteratureRecord.create(data)


def test_literature_create_with_arxiv_eprints(base_app, db):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record(data=data)

    record = LiteratureRecord.create(data)
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    expected_arxiv_pid_value = arxiv_value
    expected_arxiv_pid_type = "arxiv"
    expected_arxiv_pid_provider = "arxiv"

    record_pid_arxiv = PersistentIdentifier.query.filter_by(
        pid_type="arxiv", object_uuid=record.id
    ).one()

    assert record.model.id == record_pid_arxiv.object_uuid
    assert expected_arxiv_pid_value == record_pid_arxiv.pid_value
    assert expected_arxiv_pid_type == record_pid_arxiv.pid_type
    assert expected_arxiv_pid_provider == record_pid_arxiv.pid_provider


def test_literature_create_with_dois(base_app, db):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    data = faker.record(data=data)

    record = LiteratureRecord.create(data)
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    expected_doi_pid_value = doi_value
    expected_doi_pid_type = "doi"
    expected_doi_pid_provider = "doi"
    record_pid_doi = PersistentIdentifier.query.filter_by(
        pid_type="doi", object_uuid=record.id
    ).one()

    assert record.model.id == record_pid_doi.object_uuid
    assert expected_doi_pid_value == record_pid_doi.pid_value
    assert expected_doi_pid_type == record_pid_doi.pid_type
    assert expected_doi_pid_provider == record_pid_doi.pid_provider


def test_literature_create_with_invalid_data(base_app, db, create_pidstore):
    data = faker.record(with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        LiteratureRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_literature_create_with_invalid_data_and_mutliple_pids(
    base_app, db, create_pidstore
):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record(with_control_number=True, data=data)
    data["invalid_key"] = "should throw an error"
    pid_lit_value = str(data["control_number"])
    pid_arxiv_value = arxiv_value
    pid_doi_value = doi_value

    with pytest.raises(ValidationError):
        LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_lit_value
    ).one_or_none()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_arxiv_value
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_doi_value
    ).one_or_none()

    assert record_lit_pid is None
    assert record_arxiv_pid is None
    assert record_doi_pid is None


def test_literature_update(base_app, db):
    data = faker.record(with_control_number=True)
    record = LiteratureRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data.update({"titles": [{"title": "UPDATED"}]})
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_literature_create_or_update_with_new_record(base_app, db):
    data = faker.record()
    record = LiteratureRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_or_update_with_existing_record(base_app, db):
    data = faker.record(with_control_number=True)
    record = LiteratureRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data.update({"titles": [{"title": "UPDATED"}]})

    record_updated = LiteratureRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value
