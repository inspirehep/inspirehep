# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from helpers.utils import create_record, create_record_factory
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.minters.control_number import (
    AuthorsMinter,
    ConferencesMinter,
    DataMinter,
    ExperimentsMinter,
    InstitutionsMinter,
    JobsMinter,
    JournalsMinter,
    LiteratureMinter,
    SeminarsMinter,
)


def test_control_number_literature_without_control_number(inspire_app):
    record = create_record_factory("lit", with_pid=False)
    data = record.json

    LiteratureMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "lit"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_literature_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("lit", data=data, with_pid=False)
    data = record.json

    LiteratureMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "lit"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_authors_without_control_number(inspire_app):
    record = create_record_factory("aut", with_pid=False)
    data = record.json

    AuthorsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "aut"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_authors_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("aut", data=data, with_pid=False)
    data = record.json

    AuthorsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "aut"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_jobs_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("job", data=data, with_pid=False)
    data = record.json

    JobsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "job"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_jobs_without_control_number(inspire_app):
    record = create_record_factory("job", with_pid=False)
    data = record.json

    JobsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "job"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_journals_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("jou", data=data, with_pid=False)
    data = record.json

    JournalsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "jou"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_journals_without_control_number(inspire_app):
    record = create_record_factory("jou", with_pid=False)
    data = record.json

    JournalsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "jou"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_experiments_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("exp", data=data, with_pid=False)
    data = record.json

    ExperimentsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "exp"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_experiments_without_control_number(inspire_app):
    record = create_record_factory("exp", with_pid=False)
    data = record.json

    ExperimentsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "exp"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_conferences_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("con", data=data, with_pid=False)
    data = record.json

    ConferencesMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "con"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_conferences_without_control_number(inspire_app):
    record = create_record_factory("con", with_pid=False)
    data = record.json

    ConferencesMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "con"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_data_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("dat", data=data, with_pid=False)
    data = record.json

    DataMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "dat"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_data_without_control_number(inspire_app):
    record = create_record_factory("dat", with_pid=False)
    data = record.json

    DataMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "dat"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_institutions_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("ins", data=data, with_pid=False)
    data = record.json

    InstitutionsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "ins"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_institutions_without_control_number(inspire_app):
    record = create_record_factory("ins", with_pid=False)
    data = record.json

    InstitutionsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "ins"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_seminars_with_control_number(inspire_app):
    data = {"control_number": 1}
    record = create_record_factory("sem", data=data, with_pid=False)
    data = record.json

    SeminarsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "sem"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_seminars_without_control_number(inspire_app):
    record = create_record_factory("sem", with_pid=False)
    data = record.json

    SeminarsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "sem"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_not_deleting_pid_when_record_removed(inspire_app):
    record = create_record("lit")
    expected_cn = str(record["control_number"])
    cn_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()

    assert cn_pid.pid_value == expected_cn

    cn_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    assert cn_pid.pid_value == expected_cn

    record.delete()
    cn_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()

    cn_pid.status == PIDStatus.DELETED
