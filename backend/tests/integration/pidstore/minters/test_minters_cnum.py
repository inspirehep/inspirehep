# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from copy import copy

import pytest
from helpers.utils import create_record
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from jsonschema.exceptions import ValidationError

from inspirehep.pidstore.minters.cnum import CNUMMinter
from inspirehep.records.api import ConferencesRecord


def test_minter_mint_cnum_more_than_once(app_clean):
    opening_date = "2005-09-16"
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "opening_date": opening_date,
    }
    record = create_record("con", data=data)

    expected_cnum = "C05-09-16"

    assert "cnum" in record
    assert record["cnum"] == expected_cnum

    expected_pids_len = 1
    epxected_pids_value = expected_cnum
    expected_pids_provider = "cnum"
    expected_pids_status = PIDStatus.REGISTERED

    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="cnum")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len
    result_pid = result_pids[0]
    assert result_pid.pid_provider == expected_pids_provider
    assert result_pid.status == expected_pids_status
    assert str(result_pid.pid_value) == epxected_pids_value

    # minting again to get cnums with ".X" part
    for i in range(1, 4):
        record = create_record("con", data=data)

        assert "cnum" in record
        assert record["cnum"] == f"{expected_cnum}.{i}"


def test_minter_mint_cnum_from_empty_opening_date(app_clean):
    record = create_record("con")

    assert "cnum" not in record

    expected_pids_count = 0
    pids_count = PersistentIdentifier.query.filter_by(
        object_uuid=record.id, pid_type="cnum"
    ).count()
    result_pids_len = pids_count

    assert result_pids_len == expected_pids_count


def test_minter_change_opening_date_doesnt_change_cnum(app_clean):
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "opening_date": "2005-09-16",
    }
    record = ConferencesRecord.create(data)
    expected_cnum = "C05-09-16"

    assert "cnum" in record
    assert record["cnum"] == expected_cnum

    record["opening_date"] = "2020-09-16"
    record.update(dict(record))

    updated_rec = ConferencesRecord.get_record_by_pid_value(record["control_number"])

    assert updated_rec["opening_date"] == "2020-09-16"
    assert updated_rec["cnum"] == expected_cnum


def test_minter_deleting_record_removes_cnum_pid(app_clean):
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "opening_date": "2005-09-16",
    }
    record = ConferencesRecord.create(data)
    expected_cnum = "C05-09-16"

    assert "cnum" in record
    assert record["cnum"] == expected_cnum

    record.hard_delete()
    pids_count = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="cnum")
        .count()
    )

    assert pids_count == 0


def test_minter_mints_cnum_of_migrated_record_having_already_cnum_field(app_clean):
    cnum = "C06-10-23"
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "opening_date": "2005-09-16",
        "cnum": cnum,  # different than opening_date on purpose
    }
    create_record("con", data=data)
    pid = (
        PersistentIdentifier.query.filter_by(pid_type="cnum")
        .filter_by(pid_value=cnum)
        .one_or_none()
    )

    assert pid


def test_minter_mints_cnum_of_migrated_record_fails_if_pid_already_exists(app_clean):
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "opening_date": "2005-09-16",
    }
    expected_cnum = "C05-09-16"
    rec = create_record("con", data=data)
    pid = (
        PersistentIdentifier.query.filter_by(pid_type="cnum")
        .filter_by(object_uuid=rec.id)
        .one_or_none()
    )

    assert pid.pid_value == expected_cnum

    data["cnum"] = expected_cnum

    with pytest.raises(PIDAlreadyExists):
        # a new record with same cnum is migrated
        create_record("con", data=data)


def test_minter_mints_cnum_from_partial_date_doesnt_happen_because_partial_date_is_not_valid(
    app_clean
):
    partial_date = "05-09-16"
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "opening_date": partial_date,
    }
    with pytest.raises(ValidationError):
        create_record("con", data=data)


def test_minter_mints_cnum_on_update_when_cnum_is_missing_in_db(app_clean):
    rec = create_record("con")
    record_cnums_count = PersistentIdentifier.query.filter_by(
        pid_type="cnum", object_uuid=str(rec.id)
    ).count()
    assert 0 == record_cnums_count
    data = dict(rec)
    data["cnum"] = "C05-01-01"
    rec.update(data)

    record_cnums = PersistentIdentifier.query.filter_by(
        pid_type="cnum", object_uuid=str(rec.id)
    ).all()

    expected_cnum = "C05-01-01"
    assert 1 == len(record_cnums)
    assert record_cnums[0].pid_value == expected_cnum


def test_generate_cnum_when_holes_in_cnums_sequence(app_clean):
    data = {"opening_date": "2020-01-01"}
    expected_cnum = "C20-01-01.2"
    rec1 = create_record("con", data)
    rec2 = create_record("con", data)
    rec1.hard_delete()
    rec3 = create_record("con", data)
    assert rec3.get("cnum") == expected_cnum


def test_generate_cnum_when_holes_in_cnums_sequence_and_weird_creation_order(app_clean):
    data = {"opening_date": "2020-01-01", "cnum": "C20-01-01.2"}
    rec1 = create_record("con", data)
    data["cnum"] = "C20-01-01.1"
    rec2 = create_record("con", data)
    data["cnum"] = "C20-01-01"
    rec3 = create_record("con", data)
    del data["cnum"]
    rec2.hard_delete()
    rec4 = create_record("con", data)
    assert rec4["cnum"] == "C20-01-01.3"


def test_generate_cnum_when_holes_in_cnums_sequence_and_big_holes(app_clean):
    data = {"opening_date": "2020-01-01", "cnum": "C20-01-01.20"}
    rec1 = create_record("con", data)
    data["cnum"] = "C20-01-01.31"
    rec2 = create_record("con", data)
    data["cnum"] = "C20-01-01.3"
    rec3 = create_record("con", data)
    del data["cnum"]
    rec2.hard_delete()
    rec4 = create_record("con", data)
    assert rec4["cnum"] == "C20-01-01.21"
