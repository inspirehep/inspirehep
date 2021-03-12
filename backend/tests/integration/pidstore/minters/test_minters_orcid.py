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
from idutils import is_isni, is_orcid
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema, PIDAlreadyExists
from inspirehep.pidstore.minters.orcid import OrcidMinter


def test_minter_orcid(inspire_app):
    orcid_value = faker.orcid()
    data = {
        "ids": [
            {"schema": "JACOW", "value": "JACoW-12345678"},
            {"schema": "ORCID", "value": orcid_value},
        ]
    }
    record = create_record_factory("aut", data=data)
    data = record.json

    OrcidMinter.mint(record.id, data)

    expected_pids_len = 1
    epxected_pids_values = [orcid_value]
    expected_pids_provider = "external"
    expected_pids_status = PIDStatus.REGISTERED

    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="orcid")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len

    pid = result_pids[0]
    assert expected_pids_provider == pid.pid_provider
    assert expected_pids_status == pid.status
    assert pid.pid_value in epxected_pids_values


def test_minter_orcid_empty(inspire_app):
    record = create_record_factory("aut")
    data = record.json

    OrcidMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="orcid"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len


def test_minter_orcid_already_existing(inspire_app):
    orcid_value = faker.orcid()
    data = {"ids": [{"value": orcid_value, "schema": "ORCID"}]}

    record_with_orcid = create_record_factory("aut", data=data)
    OrcidMinter.mint(record_with_orcid.id, record_with_orcid.json)

    record_with_existing_orcid = create_record_factory("aut", data)
    with pytest.raises(PIDAlreadyExists):
        OrcidMinter.mint(record_with_existing_orcid.id, record_with_existing_orcid.json)


def test_minter_orcid_missing_schema(inspire_app):
    orcid_value = faker.orcid()
    data = {"ids": [{"value": orcid_value, "schema": "ORCID"}]}
    record = create_record_factory("aut", data=data)

    record_data = record.json
    record_id = record.id
    record_data.pop("$schema")

    with pytest.raises(MissingSchema):
        OrcidMinter.mint(record_id, record_data)


def test_orcid_number_generator(inspire_app):
    orcid = RecordProvider.orcid()
    assert is_isni(orcid)
    assert is_orcid(orcid)


def test_orcid_minter_without_deleting_all_external_pids(inspire_app):
    rec = create_record("aut", other_pids=["orcid"])
    orcid = rec["ids"][0]["value"]

    orcid_pid = PersistentIdentifier.query.filter_by(pid_type="orcid").one()
    assert orcid_pid.pid_value == orcid

    new_orcid = RecordProvider.orcid()
    data = dict(rec)
    data["ids"][0]["value"] = new_orcid
    rec.update(data)

    orcid_pid = PersistentIdentifier.query.filter_by(pid_type="orcid").one()
    assert orcid_pid.pid_value == new_orcid

    rec.delete()
    assert PersistentIdentifier.query.filter_by(pid_type="orcid").count() == 0
