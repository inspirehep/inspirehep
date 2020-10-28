# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.record_provider import RecordProvider
from helpers.utils import create_record
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import PIDAlreadyExists
from inspirehep.pidstore.providers.bai import InspireBAIProvider
from inspirehep.utils import flatten_list


def test_old_minter_bai(inspire_app, override_config):
    data = {"ids": [{"schema": "JACOW", "value": "JACoW-12345678"}]}
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        record = create_record("aut", data=data, other_pids=["bai"])
    expected_pids_len = 1
    epxected_pids_values = [record["ids"][1]["value"]]
    expected_pids_provider = "external"
    expected_pids_status = PIDStatus.REGISTERED
    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="bai")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len

    pid = result_pids[0]
    assert expected_pids_provider == pid.pid_provider
    assert expected_pids_status == pid.status
    assert pid.pid_value in epxected_pids_values


def test_old_minter_bai_empty(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        rec = create_record("aut")
    expected_pids_len = 0

    result_pids_len = PersistentIdentifier.query.filter_by(
        object_uuid=rec.id, pid_type="bai"
    ).count()

    assert expected_pids_len == result_pids_len


def test_old_minter_bai_already_existing(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        record_1 = create_record("aut", other_pids=["bai"])
    data2 = {"ids": record_1["ids"]}

    with pytest.raises(PIDAlreadyExists), override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=False
    ):
        create_record("aut", data2)


def test_if_old_bai_is_processed_on_authors_record_creation(
    inspire_app, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        record = create_record("aut", other_pids=["bai"])
    bai = record["ids"][0]["value"]
    assert (
        PersistentIdentifier.query.filter_by(
            pid_type="bai", pid_value=bai, object_uuid=record.id
        ).count()
        == 1
    )


def test_old_bai_minter_without_deleting_all_external_pids(
    inspire_app, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        rec = create_record("aut", other_pids=["bai"])
    rec_bai = rec["ids"][0]["value"]
    bai_pid = PersistentIdentifier.query.filter_by(pid_type="bai").one()

    assert bai_pid.pid_value == rec_bai

    new_bai = RecordProvider.bai()
    data = dict(rec)
    data["ids"][0]["value"] = new_bai
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        rec.update(data)
    bai_pid = PersistentIdentifier.query.filter_by(pid_type="bai").one()

    assert bai_pid.pid_value == new_bai
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        rec.delete()
    bai_count = PersistentIdentifier.query.filter_by(pid_type="bai").count()

    assert bai_count == 0


def test_minter_bai_provided(inspire_app, override_config):
    data = {
        "ids": [
            {"schema": "JACOW", "value": "JACoW-12345678"},
            {"schema": "INSPIRE BAI", "value": "K.Janeway.1"},
        ]
    }
    expected_pids_len = 1
    epxected_pids_values = [data["ids"][1]["value"]]
    expected_pids_provider = "bai"
    expected_pids_status = PIDStatus.REGISTERED
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        record = create_record("aut", data=data)
    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="bai")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len

    pid = result_pids[0]
    assert expected_pids_provider == pid.pid_provider
    assert expected_pids_status == pid.status
    assert pid.pid_value in epxected_pids_values


def test_minter_bai_new(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        record = create_record("aut")

    expected_pids_len = 1

    result_pids_len = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, status=PIDStatus.REGISTERED, pid_type="bai"
    ).count()

    assert expected_pids_len == result_pids_len
    bai_entry = record["ids"][0]
    assert bai_entry["schema"] == "INSPIRE BAI"


def test_minter_bai_already_existing(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        data = create_record("aut")
        data2 = {"ids": data["ids"]}
        with pytest.raises(PIDAlreadyExists):
            create_record("aut", data2)


def test_bai_minter_deletes_unused_pid(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        rec = create_record("aut")
    rec_bai = rec["ids"][0]["value"]
    bai_pid = PersistentIdentifier.query.filter_by(pid_type="bai").one()

    assert bai_pid.pid_value == rec_bai

    new_bai = RecordProvider.bai()
    data = dict(rec)
    data["ids"][0]["value"] = new_bai
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        rec.update(data)
    bais = [
        pid.pid_value
        for pid in PersistentIdentifier.query.filter_by(
            pid_type="bai", status=PIDStatus.REGISTERED, object_uuid=rec.id
        ).all()
    ]

    previous_bai = PersistentIdentifier.query.filter_by(
        pid_type="bai", pid_value=bai_pid.pid_value
    ).one_or_none()
    assert previous_bai is None

    assert new_bai in bais


def test_bai_minter_many_pids(inspire_app):
    data = {
        "ids": [
            {"schema": "INSPIRE BAI", "value": "K.Janeway.1"},
            {"schema": "INSPIRE BAI", "value": "K.Janeway.2"},
        ]
    }
    expected_bais = ["K.Janeway.1", "K.Janeway.2"]
    rec = create_record("aut", data=data)
    bais = flatten_list(
        PersistentIdentifier.query.with_entities(PersistentIdentifier.pid_value)
        .filter_by(pid_type="bai", status=PIDStatus.REGISTERED, object_uuid=rec.id)
        .all()
    )
    assert sorted(bais) == sorted(expected_bais)


def test_bai_minter_removes_all_pids_on_record_delete(inspire_app, override_config):
    data = {
        "ids": [
            {"schema": "INSPIRE BAI", "value": "K.Janeway.1"},
            {"schema": "INSPIRE BAI", "value": "K.Janeway.2"},
        ]
    }
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        rec = create_record("aut", data=data)
        rec.delete()
    bai_count = PersistentIdentifier.query.filter_by(
        pid_type="bai", object_uuid=rec.id
    ).count()

    assert bai_count == 0


def test_bai_minter_generates_correct_bai_when_numbers_are_not_consistent(
    inspire_app, override_config
):
    rec_1_expected_ids = [
        {"schema": "INSPIRE BAI", "value": "K.Janeway.1"},
        {"schema": "INSPIRE BAI", "value": "K.Janeway.3"},
    ]

    rec_2_expected_ids = [{"schema": "INSPIRE BAI", "value": "K.Janeway.4"}]

    data_1 = {
        "ids": [
            {"schema": "INSPIRE BAI", "value": "K.Janeway.1"},
            {"schema": "INSPIRE BAI", "value": "K.Janeway.3"},
        ],
        "name": {"value": "Janeway, Kathryn"},
    }

    data_2 = {"name": {"value": "Janeway, Kathryn"}}

    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        rec_1 = create_record("aut", data=data_1)
        rec_2 = create_record("aut", data=data_2)

    assert rec_1["ids"] == rec_1_expected_ids
    assert rec_2["ids"] == rec_2_expected_ids


def test_minter_bai_respects_feature_flag(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        record = create_record("aut")

    expected_pids_len = 0

    result_pids_len = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="bai"
    ).count()

    assert result_pids_len == expected_pids_len


def test_minter_bai_minting_of_existing_bais_works_when_feature_flag_is_turned_off(
    inspire_app, override_config
):
    data = {"ids": [{"schema": "INSPIRE BAI", "value": "K.Janeway.1"}]}
    expected_bai_value = "K.Janeway.1"
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=False):
        record = create_record("aut", data=data)

    bai = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="bai"
    ).one()

    assert bai.pid_value == expected_bai_value
    assert bai.object_uuid == record.id
    assert bai.status == PIDStatus.REGISTERED


def test_double_minting_same_record_not_breaks(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        data = {"ids": [{"schema": "INSPIRE BAI", "value": "K.Janeway.1"}]}
        record = create_record("aut", data=data)
        data = dict(record)
        bai_provider = InspireBAIProvider.create(
            pid_value=data["ids"][0]["value"], object_uuid=record.id
        )
        assert bai_provider.pid.object_uuid == record.id
