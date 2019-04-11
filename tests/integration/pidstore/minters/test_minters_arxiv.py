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
from inspirehep.pidstore.minters.arxiv import ArxivMinter


def test_minter_arxiv_eprints(base_app, db, create_record_factory):
    arxiv_value_1 = faker.arxiv()
    arxiv_value_2 = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value_1}, {"value": arxiv_value_2}]}
    record = create_record_factory("lit", data=data)
    data = record.json

    ArxivMinter.mint(record.id, data)

    expected_pids_len = 2
    epxected_pids_values = [arxiv_value_1, arxiv_value_2]
    expected_pids_provider = "arxiv"
    expected_pids_status = PIDStatus.REGISTERED

    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="arxiv")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len
    for pid in result_pids:
        assert expected_pids_provider == pid.pid_provider
        assert expected_pids_status == pid.status
        assert pid.pid_value in epxected_pids_values


def test_minter_arxiv_eprints_empty(base_app, db, create_record_factory):
    record = create_record_factory("lit")
    data = record.json

    ArxivMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="arxiv"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len


def test_mitner_arxiv_eprints_already_existing(base_app, db, create_record_factory):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}

    record_with_arxiv = create_record_factory("lit", data=data)
    ArxivMinter.mint(record_with_arxiv.id, record_with_arxiv.json)

    record_with_existing_arxiv = create_record_factory("lit", data)
    with pytest.raises(PIDAlreadyExists):
        ArxivMinter.mint(record_with_existing_arxiv.id, record_with_existing_arxiv.json)


def test_mitner_arxiv_eprints_missing_schema(base_app, db, create_record_factory):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    record = create_record_factory("lit", data=data)

    record_data = record.json
    record_id = record.id
    record_data.pop("$schema")

    with pytest.raises(MissingSchema):
        ArxivMinter.mint(record_id, record_data)
