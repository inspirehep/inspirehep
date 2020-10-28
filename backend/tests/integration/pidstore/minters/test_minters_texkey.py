# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from helpers.utils import create_record
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import PIDAlreadyExistsError


def test_minter_mint_new_record_without_texkey(inspire_app, override_config):
    RANDOM_PART_SIZE = 3
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
    }
    with override_config(
        FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True,
        PIDSTORE_TEXKEY_RANDOM_PART_SIZE=RANDOM_PART_SIZE,
    ):
        record = create_record("lit", data=data)

    expected_pid_value_starts_with = "Janeway:2000"
    expected_pid_length = len(expected_pid_value_starts_with) + RANDOM_PART_SIZE
    pid = (
        PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == record.id)
        .filter(PersistentIdentifier.pid_type == "texkey")
        .one()
    )
    assert pid.pid_value.startswith(expected_pid_value_starts_with)
    assert len(pid.pid_value) == expected_pid_length


def test_minter_mint_new_record_with_texkey(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
        "texkeys": ["Janeway:2000abc"],
    }
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)

    expected_pid_value = "Janeway:2000abc"
    pid = (
        PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == record.id)
        .filter(PersistentIdentifier.pid_type == "texkey")
        .one()
    )
    assert pid.pid_value == expected_pid_value


def test_minter_mint_new_record_with_texkey_when_texkey_already_in_use(
    inspire_app, override_config
):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
        "texkeys": ["Janeway:2000abc"],
    }
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)

        with pytest.raises(PIDAlreadyExistsError):
            record = create_record("lit", data=data)


def test_minter_mint_record_update_with_texkey_changed(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
    }
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)
        data = dict(record)
        data["publication_info"][0]["year"] = 1999
        record.update(data)

    pid_current = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_value == record["texkeys"][0]
    ).one()
    pid_old = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_value == record["texkeys"][1]
    ).one()

    assert pid_old.pid_value != pid_current.pid_value

    assert len(record["texkeys"]) == 2
    assert pid_current.status == PIDStatus.REGISTERED
    assert pid_old.status == PIDStatus.REGISTERED

    data = dict(record)
    data["publication_info"][0]["year"] = 2000
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record.update(data)

    old_pid_active = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_value == pid_current.pid_value
    ).one()
    pid_active = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_value == record["texkeys"][0]
    ).one()
    pid_old = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_value == record["texkeys"][1]
    ).one()

    assert pid_old.pid_value != pid_active.pid_value
    assert old_pid_active.pid_value != pid_active.pid_value

    assert len(record["texkeys"]) == 3
    assert old_pid_active.status == PIDStatus.REGISTERED
    assert pid_active.status == PIDStatus.REGISTERED
    assert pid_old.status == PIDStatus.REGISTERED


def test_minter_deletes_pids_when_record_is_deleted(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
        "texkeys": ["Janeway:2000abc", "Janeway:2000def"],
    }
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)

    pids = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_type == "texkey"
    ).all()
    assert len(pids) == 2
    assert pids[0].status == PIDStatus.REGISTERED
    assert pids[1].status == PIDStatus.REGISTERED

    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record.delete()
    pids = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_type == "texkey"
    ).all()
    assert len(pids) == 2
    assert pids[0].status == PIDStatus.DELETED
    assert pids[1].status == PIDStatus.DELETED


def test_minter_texkey_featureflag_test(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
    }
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=False):
        record = create_record("lit", data=data)

    pid_count = (
        PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == record.id)
        .filter(PersistentIdentifier.pid_type == "texkey")
        .count()
    )
    assert pid_count == 0


def test_minter_ignores_texkey_pid_when_missing_data_to_create_it(
    inspire_app, override_config
):
    data = {"authors": [{"full_name": "Janeway, K."}]}
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)
    pid_count = (
        PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == record.id)
        .filter(PersistentIdentifier.pid_type == "texkey")
        .count()
    )

    assert "texkey" not in record
    assert pid_count == 0

    data = {"publication_info": [{"year": 2000}]}
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)
    pid_count = (
        PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == record.id)
        .filter(PersistentIdentifier.pid_type == "texkey")
        .count()
    )

    assert "texkey" not in record
    assert pid_count == 0


def test_minter_creates_record_with_texkey_provided_and_new_one_when_metadata_requires_it(
    inspire_app, override_config
):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
        "texkeys": ["Janeway:1999abc", "Janewaj:2000def"],
    }

    expected_existing_texkeys = ["Janeway:1999abc", "Janewaj:2000def"]
    expected_new_texkey = "Janeway:2000"
    expected_texkeys_count = 3
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)

    assert len(record["texkeys"]) == expected_texkeys_count

    pids_from_pidstore = (
        PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == record.id)
        .filter(PersistentIdentifier.pid_type == "texkey")
        .all()
    )

    assert len(pids_from_pidstore) == expected_texkeys_count
    assert record["texkeys"][0].startswith(expected_new_texkey)
    assert record["texkeys"][1] in expected_existing_texkeys
    assert record["texkeys"][2] in expected_existing_texkeys

    all_expected_texkeys = record["texkeys"]

    assert pids_from_pidstore[0].pid_value in all_expected_texkeys
    assert pids_from_pidstore[1].pid_value in all_expected_texkeys
    assert pids_from_pidstore[2].pid_value in all_expected_texkeys


def test_minter_reuses_texkey_from_deleted_record_if_specified_in_metadata(
    inspire_app, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        expected_texkey = "Texkey:2000abcd"
        data = {"texkeys": [expected_texkey]}
        record = create_record("lit", data=data)
        record.delete()
        record_2 = create_record("lit", data=data)
    texkey = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_value == expected_texkey
    ).one()
    assert texkey.object_uuid == record_2.id
    assert texkey.status == PIDStatus.REGISTERED


def test_minter_undeleting_record(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
    }
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = create_record("lit", data=data)
        record.delete()
        data = dict(record)
        del data["deleted"]
        record.update(data)
    texkey = PersistentIdentifier.query.filter(
        PersistentIdentifier.object_uuid == record.id,
        PersistentIdentifier.pid_type == "texkey",
    ).one()
    assert texkey.status == PIDStatus.REGISTERED
