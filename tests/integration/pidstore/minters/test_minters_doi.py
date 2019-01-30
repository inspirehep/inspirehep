# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest

from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema
from inspirehep.pidstore.minters.doi import DoiMinter


def test_minter_dois(base_app, db, create_record):
    data = {
        "dois": [
            {"value": "10.1016/j.nuclphysa.2018.12.006"},
            {"value": "10.1016/j.nuclphysa.2018.12.003"},
        ]
    }
    record = create_record("lit", data=data)
    data = record.json

    DoiMinter.mint(record.id, data)

    expected_pids_len = 2
    epxected_pids_values = [
        "10.1016/j.nuclphysa.2018.12.006",
        "10.1016/j.nuclphysa.2018.12.003",
    ]
    expected_pids_provider = "doi"
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


def test_minter_arxiv_eprints_empty(base_app, db, create_record):
    record = create_record("lit")
    data = record.json

    DoiMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="doi"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len
