# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.faker import faker
from helpers.providers.record_provider import RecordProvider
from helpers.utils import create_record, create_record_factory
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema, PIDAlreadyExists
from inspirehep.pidstore.minters.doi import DoiMinter


def test_minter_dois(inspire_app):
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


def test_minter_dois_duplicate(inspire_app):
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


def test_minter_dois_empty(inspire_app):
    record = create_record_factory("lit", with_validation=True)
    data = record.json

    DoiMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="doi"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len


def test_mitner_dois_already_existing(inspire_app):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    record_with_doi = create_record_factory("lit", data=data, with_validation=True)
    DoiMinter.mint(record_with_doi.id, record_with_doi.json)

    record_with_existing_doi = create_record_factory("lit", data)
    with pytest.raises(PIDAlreadyExists):
        DoiMinter.mint(record_with_existing_doi.id, record_with_existing_doi.json)


def test_mitner_dois_missing_schema(inspire_app):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    record = create_record_factory("lit", data=data)

    record_data = record.json
    record_id = record.id
    record_data.pop("$schema")

    with pytest.raises(MissingSchema):
        DoiMinter.mint(record_id, record_data)


def test_new_doi_converted_to_lowercase(inspire_app):
    expected_doi = "10.1109/tpel.2019.2900393"
    doi_value = "10.1109/TPEL.2019.2900393"
    data = {"dois": [{"value": doi_value}]}
    create_record("lit", data=data)
    doi = PersistentIdentifier.query.filter_by(pid_type="doi").first()
    assert expected_doi == doi.pid_value


def test_adding_same_doi_different_case_raises_pid_already_exists(inspire_app):
    doi_value_1 = "10.1109/tpel.2019.2900393"
    doi_value_2 = "10.1109/TPEL.2019.2900393"
    data_1 = {"dois": [{"value": doi_value_1}]}
    data_2 = {"dois": [{"value": doi_value_2}]}
    create_record("lit", data=data_1)
    with pytest.raises(PIDAlreadyExists):
        create_record("lit", data=data_2)


def test_adding_record_with_duplicated_dois_different_case(inspire_app):
    doi_value_1 = "10.1109/tpel.2019.2900393"
    doi_value_2 = "10.1109/TPEL.2019.2900393"

    expected_doi = "10.1109/tpel.2019.2900393"
    expected_dois_count = 1

    expected_dois_in_record = [{"value": doi_value_1}, {"value": doi_value_2}]
    data = {"dois": [{"value": doi_value_1}, {"value": doi_value_2}]}
    record = create_record("lit", data=data)
    pids = PersistentIdentifier.query.filter_by(pid_type="doi").all()

    assert record["dois"] == expected_dois_in_record
    assert expected_dois_count == len(pids)
    assert expected_doi == pids[0].pid_value


def test_doi_minter_without_deleting_all_external_pids(inspire_app):
    rec = create_record("lit", dois=True)
    doi = rec["dois"][0]["value"]

    doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()
    assert doi_pid.pid_value == doi

    data = dict(rec)
    new_doi = RecordProvider.doi()
    data["dois"][0]["value"] = new_doi
    rec.update(data)

    doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()
    assert doi_pid.pid_value == new_doi

    rec.delete()
    assert PersistentIdentifier.query.filter_by(pid_type="doi").count() == 0


def test_multiple_doi_minter_without_deleting_all_external_pids(inspire_app):
    rec = create_record("lit", dois=3)

    assert PersistentIdentifier.query.filter_by(pid_type="doi").count() == 3

    data = dict(rec)
    data["dois"] = data["dois"][0:2]
    rec.update(data)

    assert PersistentIdentifier.query.filter_by(pid_type="doi").count() == 2
