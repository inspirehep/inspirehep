# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from invenio_pidstore.models import PersistentIdentifier

from inspirehep.pidstore.minters.control_number import AuthorsMinter, LiteratureMinter


def test_control_number_literature_without_control_number(base_app, db, create_record):
    record = create_record("lit", with_pid=False)
    data = record.json

    LiteratureMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "lit"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_literature_with_control_number(base_app, db, create_record):
    data = {"control_number": 1}
    record = create_record("lit", data=data, with_pid=False)
    data = record.json

    LiteratureMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "lit"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_authors_without_control_number(base_app, db, create_record):
    record = create_record("aut", with_pid=False)
    data = record.json

    AuthorsMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "aut"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_authors_with_control_number(base_app, db, create_record):
    data = {"control_number": 1}
    record = create_record("aut", data=data, with_pid=False)
    data = record.json

    AuthorsMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "aut"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid
