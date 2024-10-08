#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.faker import faker
from helpers.providers.record_provider import RecordProvider
from helpers.utils import create_record, create_record_factory
from inspirehep.pidstore.errors import MissingSchema, PIDAlreadyExists
from inspirehep.pidstore.minters.arxiv import ArxivMinter
from invenio_pidstore.models import PersistentIdentifier, PIDStatus


def test_minter_arxiv_eprints(inspire_app):
    arxiv_value_1 = faker.arxiv()
    arxiv_value_2 = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value_1}, {"value": arxiv_value_2}]}
    record = create_record_factory("lit", data=data, with_validation=True)
    data = record.json

    ArxivMinter.mint(record.id, data)

    expected_pids_len = 2
    epxected_pids_values = [arxiv_value_1, arxiv_value_2]
    expected_pids_provider = "external"
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


def test_minter_arxiv_eprints_empty(inspire_app):
    record = create_record_factory("lit", with_validation=True)
    data = record.json

    ArxivMinter.mint(record.id, data)

    expected_pids_len = 0

    result_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="arxiv"
    ).all()
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len


def test_minter_arxiv_eprints_duplicate(inspire_app):
    arxiv_value_1 = faker.arxiv()
    data = {
        "arxiv_eprints": [
            {"value": arxiv_value_1, "categories": ["cond-mat"]},
            {"value": arxiv_value_1, "categories": ["astro-ph"]},
        ]
    }
    record = create_record_factory("lit", data=data, with_validation=True)
    data = record.json

    ArxivMinter.mint(record.id, data)

    epxected_pid_value = arxiv_value_1
    expected_pid_provider = "external"
    expected_pid_status = PIDStatus.REGISTERED

    result_pid = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="arxiv")
        .one()
    )

    assert expected_pid_provider == result_pid.pid_provider
    assert expected_pid_status == result_pid.status
    assert epxected_pid_value == result_pid.pid_value


def test_mitner_arxiv_eprints_already_existing(inspire_app):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}

    record_with_arxiv = create_record_factory("lit", data=data, with_validation=True)
    ArxivMinter.mint(record_with_arxiv.id, record_with_arxiv.json)

    record_with_existing_arxiv = create_record_factory("lit", data)
    with pytest.raises(PIDAlreadyExists):
        ArxivMinter.mint(record_with_existing_arxiv.id, record_with_existing_arxiv.json)


def test_mitner_arxiv_eprints_missing_schema(inspire_app):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    record = create_record_factory("lit", data=data)

    record_data = record.json
    record_id = record.id
    record_data.pop("$schema")

    with pytest.raises(MissingSchema):
        ArxivMinter.mint(record_id, record_data)


def test_arxiv_minter_without_deleting_all_external_pids(inspire_app):
    rec = create_record("lit", arxiv_eprints=True)
    data = dict(rec)
    old_arxiv = rec["arxiv_eprints"][0]["value"]
    new_arxiv = RecordProvider.arxiv()
    data["arxiv_eprints"][0]["value"] = new_arxiv
    rec.update(data)

    expected_arxiv_old_pid_count = 0
    expected_arxiv_new_pid_count = 1
    expected_recid_pid_status = "R"

    arxiv_old_pid_count = PersistentIdentifier.query.filter_by(
        pid_value=old_arxiv, pid_type="arxiv"
    ).count()
    arxiv_new_pid_count = PersistentIdentifier.query.filter_by(
        pid_value=new_arxiv, pid_type="arxiv"
    ).count()
    recid_pid = PersistentIdentifier.query.filter_by(
        pid_value=str(rec["control_number"]), pid_type="lit"
    ).one()

    assert arxiv_old_pid_count == expected_arxiv_old_pid_count
    assert arxiv_new_pid_count == expected_arxiv_new_pid_count
    assert recid_pid.status == expected_recid_pid_status

    rec.delete()

    expected_arxiv_old_pid_count = 0
    expected_arxiv_new_pid_count = 0
    expected_recid_pid_status = PIDStatus.DELETED

    arxiv_old_pid_count = PersistentIdentifier.query.filter_by(
        pid_value=old_arxiv, pid_type="arxiv"
    ).count()
    arxiv_new_pid_count = PersistentIdentifier.query.filter_by(
        pid_value=new_arxiv, pid_type="arxiv"
    ).count()
    recid_pid = PersistentIdentifier.query.filter_by(
        pid_value=str(rec["control_number"]), pid_type="lit"
    ).one()

    assert arxiv_old_pid_count == expected_arxiv_old_pid_count
    assert arxiv_new_pid_count == expected_arxiv_new_pid_count
    assert recid_pid.status == expected_recid_pid_status
