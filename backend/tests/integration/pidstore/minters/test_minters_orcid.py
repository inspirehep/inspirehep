# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.faker import faker
from helpers.utils import create_record_factory
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema, PIDAlreadyExists
from inspirehep.pidstore.minters.orcid import OrcidMinter


def test_minter_orcid(app_clean):
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


def test_minter_orcid_empty(app_clean):
    record = create_record_factory("aut")
    data = record.json

    OrcidMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="orcid"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len


def test_minter_orcid_already_existing(app_clean):
    orcid_value = faker.orcid()
    data = {"ids": [{"value": orcid_value, "schema": "ORCID"}]}

    record_with_orcid = create_record_factory("aut", data=data)
    OrcidMinter.mint(record_with_orcid.id, record_with_orcid.json)

    record_with_existing_orcid = create_record_factory("aut", data)
    with pytest.raises(PIDAlreadyExists):
        OrcidMinter.mint(record_with_existing_orcid.id, record_with_existing_orcid.json)


def test_minter_orcid_missing_schema(app_clean):
    orcid_value = faker.orcid()
    data = {"ids": [{"value": orcid_value, "schema": "ORCID"}]}
    record = create_record_factory("aut", data=data)

    record_data = record.json
    record_id = record.id
    record_data.pop("$schema")

    with pytest.raises(MissingSchema):
        OrcidMinter.mint(record_id, record_data)
