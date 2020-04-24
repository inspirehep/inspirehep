# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.faker import faker
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import PIDAlreadyExists
from inspirehep.pidstore.minters.bai import BAIMinter
from inspirehep.records.api import AuthorsRecord


def test_minter_bai(inspire_app):
    data = {"ids": [{"schema": "JACOW", "value": "JACoW-12345678"}]}
    record_data = faker.record("aut", data=data, other_pids=["bai"])
    BAIMinter.mint(None, record_data)
    expected_pids_len = 1
    epxected_pids_values = [record_data["ids"][1]["value"]]
    expected_pids_provider = "external"
    expected_pids_status = PIDStatus.REGISTERED
    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=None)
        .filter_by(pid_type="bai")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len

    pid = result_pids[0]
    assert expected_pids_provider == pid.pid_provider
    assert expected_pids_status == pid.status
    assert pid.pid_value in epxected_pids_values


def test_minter_bai_empty(inspire_app):
    record_data = faker.record("aut")
    BAIMinter.mint(None, record_data)

    expected_pids_len = 0

    result_pids_len = PersistentIdentifier.query.filter_by(
        object_uuid=None, pid_type="bai"
    ).count()

    assert expected_pids_len == result_pids_len


def test_minter_bai_already_existing(inspire_app):
    data = faker.record("aut", other_pids=["bai"])
    BAIMinter.mint(None, data)
    data2 = {"ids": data["ids"]}
    record_data2 = faker.record("aut", data2)
    with pytest.raises(PIDAlreadyExists):
        BAIMinter.mint(None, record_data2)


def test_if_bai_is_processed_on_authors_record_creation(inspire_app):
    data = faker.record("aut", other_pids=["bai"])
    bai = data["ids"][0]["value"]
    rec = AuthorsRecord.create(data)
    assert (
        PersistentIdentifier.query.filter_by(pid_type="bai", pid_value=bai).count() == 1
    )
