# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.faker import faker
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema
from inspirehep.pidstore.minters.doi import DoiMinter


def test_minter_dois(base_app, db, es, create_record_factory):
    doi_value_1 = faker.doi()
    doi_value_2 = faker.doi()
    data = {"dois": [{"value": doi_value_1}, {"value": doi_value_2}]}
    record = create_record_factory("lit", data=data, with_validation=True)
    data = record.json

    DoiMinter.mint(record.id, data)

    expected_pids_len = 2
    epxected_pids_values = [doi_value_1, doi_value_2]
    expected_pids_provider = "external"
    expected_pids_status = PIDStatus.REGISTERED

    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="doi")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len
    for pid in result_pids:
        assert expected_pids_provider == pid.pid_provider
        assert expected_pids_status == pid.status
        assert pid.pid_value in epxected_pids_values


def test_minter_dois_duplicate(base_app, db, es, create_record_factory):
    doi_value_1 = faker.doi()
    data = {
        "dois": [
            {"value": doi_value_1, "material": "data"},
            {"value": doi_value_1, "material": "erratum"},
        ]
    }
    record = create_record_factory("lit", data=data, with_validation=True)
    data = record.json
    DoiMinter.mint(record.id, data)

    epxected_pid_value = doi_value_1
    expected_pid_provider = "external"
    expected_pid_status = PIDStatus.REGISTERED

    result_pid = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="doi")
        .one()
    )

    assert expected_pid_provider == result_pid.pid_provider
    assert expected_pid_status == result_pid.status
    assert epxected_pid_value == result_pid.pid_value


def test_minter_dois_empty(base_app, db, es, create_record_factory):
    record = create_record_factory("lit", with_validation=True)
    data = record.json

    DoiMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="doi"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len


def test_mitner_dois_already_existing(base_app, db, es, create_record_factory):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    record_with_doi = create_record_factory("lit", data=data, with_validation=True)
    DoiMinter.mint(record_with_doi.id, record_with_doi.json)

    record_with_existing_doi = create_record_factory("lit", data)
    with pytest.raises(PIDAlreadyExists):
        DoiMinter.mint(record_with_existing_doi.id, record_with_existing_doi.json)


def test_mitner_dois_missing_schema(base_app, db, es, create_record_factory):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    record = create_record_factory("lit", data=data)

    record_data = record.json
    record_id = record.id
    record_data.pop("$schema")

    with pytest.raises(MissingSchema):
        DoiMinter.mint(record_id, record_data)
