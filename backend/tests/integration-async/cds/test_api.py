# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
import requests
from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.cds.api import sync_identifiers
from inspirehep.cds.models import CDSRun, CDSRunStatus
from inspirehep.records.api import LiteratureRecord


def test_cds_sync_one_record_happy_flow(inspire_app_for_cds_sync):
    expected_external_identifiers = [{"schema": "CDS", "value": "1273173"}]
    LiteratureRecord.create(faker.record("lit", data={"control_number": 1203988}))
    db.session.commit()

    sync_identifiers("2020-07-01")

    runs = CDSRun.query.all()
    assert len(runs) == 1
    assert runs[0].status == CDSRunStatus.FINISHED
    assert runs[0].message == ""

    record = LiteratureRecord.get_record_by_pid_value("1203988")
    assert record["external_system_identifiers"] == expected_external_identifiers


def test_cds_sync_record_when_there_is_already_correct_cds_identifier(
    inspire_app_for_cds_sync,
):
    expected_external_identifiers = [{"schema": "CDS", "value": "1273173"}]
    LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 1203988,
                "external_system_identifiers": [{"schema": "CDS", "value": "1273173"}],
            },
        )
    )
    db.session.commit()

    sync_identifiers("2020-07-01")

    runs = CDSRun.query.all()
    assert len(runs) == 1
    assert runs[0].status == CDSRunStatus.FINISHED
    assert runs[0].message == ""

    record = LiteratureRecord.get_record_by_pid_value("1203988")
    assert record["external_system_identifiers"] == expected_external_identifiers


def test_cds_sync_record_when_there_is_already_other_cds_identifier(
    inspire_app_for_cds_sync,
):
    expected_external_identifiers = [
        {"schema": "CDS", "value": "1203999"},
        {"schema": "CDS", "value": "1273173"},
    ]
    LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 1203988,
                "external_system_identifiers": [{"schema": "CDS", "value": "1203999"}],
            },
        )
    )
    db.session.commit()

    sync_identifiers("2020-07-01")

    runs = CDSRun.query.all()
    assert len(runs) == 1
    assert runs[0].status == CDSRunStatus.FINISHED
    assert runs[0].message == ""

    record = LiteratureRecord.get_record_by_pid_value("1203988")
    assert record["external_system_identifiers"] == expected_external_identifiers


def test_cds_sync_task_fail(inspire_app_for_cds_sync):
    with pytest.raises(requests.exceptions.HTTPError):
        sync_identifiers("2022-09-15")

    runs = CDSRun.query.all()
    assert len(runs) == 1
    assert runs[0].status == CDSRunStatus.ERROR
    assert "500 Server Error" in runs[0].message


def test_cds_sync_continues_when_some_records_fails(inspire_app_for_cds_sync):
    expected_1203988_external_system_identifiers = [
        {"value": "1273173", "schema": "CDS"}
    ]
    expected_1314109_external_system_identifiers = [
        {"value": "1742265", "schema": "CDS"}
    ]
    expected_1314110_external_system_identifiers = [
        {"value": "2003162", "schema": "CDS"}
    ]
    LiteratureRecord.create(faker.record("lit", data={"control_number": 1203988}))
    LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 1314109,
                "external_system_identifiers": [{"schema": "CDS", "value": "1742265"}],
            },
        )
    )
    LiteratureRecord.create(faker.record("lit", data={"control_number": 1314110}))

    db.session.commit()

    sync_identifiers("2020-07-01")

    runs = CDSRun.query.all()
    assert len(runs) == 1
    assert runs[0].status == CDSRunStatus.FINISHED
    assert runs[0].message == ""

    assert (
        LiteratureRecord.get_record_by_pid_value("1203988")[
            "external_system_identifiers"
        ]
        == expected_1203988_external_system_identifiers
    )

    assert (
        LiteratureRecord.get_record_by_pid_value("1314109")[
            "external_system_identifiers"
        ]
        == expected_1314109_external_system_identifiers
    )
    assert (
        LiteratureRecord.get_record_by_pid_value("1314110")[
            "external_system_identifiers"
        ]
        == expected_1314110_external_system_identifiers
    )
