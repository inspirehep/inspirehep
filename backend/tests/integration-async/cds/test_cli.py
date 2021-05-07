# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import datetime
import uuid

from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.cds.models import CDSRun, CDSRunStatus
from inspirehep.records.api import LiteratureRecord


def test_cds_sync(inspire_app_for_cds_sync, cli):
    expected_external_identifiers = [{"schema": "CDS", "value": "1273173"}]
    LiteratureRecord.create(faker.record("lit", data={"control_number": 1203988}))
    db.session.commit()

    result = cli.invoke(["cds", "sync", "--since", "2020-07-01"])
    assert "Starting CDS Sync." in result.output
    assert "Task didn't finish correctly." not in result.output

    record = LiteratureRecord.get_record_by_pid_value("1203988")
    assert record.get("external_system_identifiers") == expected_external_identifiers


def test_cds_sync_fail(inspire_app_for_cds_sync, cli):
    result = cli.invoke(["cds", "sync", "--since", "2022-09-15"])

    assert "Starting CDS Sync." in result.output
    assert "Task didn't finish correctly." in result.output


def test_cds_sync_feature_flag_check_in_cli(inspire_app, cli, override_config):
    with override_config(
        FEATURE_FLAG_ENABLE_CDS_SYNC=False, CDS_SERVER_API="http://localhost:9876/api/"
    ):
        result = cli.invoke(["cds", "sync"])
    assert "Feature flag for CDS sync is not enabled." in result.output


def test_cds_sync_checks_cds_server_url(inspire_app, cli, override_config):
    with override_config(FEATURE_FLAG_ENABLE_CDS_SYNC=True, CDS_SERVER_API=""):
        result = cli.invoke(["cds", "sync", "--since", "2020-11-11"])
    assert "Server config is missing." in result.output


def test_cds_sync_determines_last_run_date_correctly(inspire_app_for_cds_sync, cli):
    expected_external_identifiers = [{"schema": "CDS", "value": "123123"}]
    LiteratureRecord.create(faker.record("lit", data={"control_number": 321321}))
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 24),
            status=CDSRunStatus.FINISHED,
        )
    )
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 25),
            status=CDSRunStatus.ERROR,
        )
    )
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 23),
            status=CDSRunStatus.RUNNING,
        )
    )
    db.session.commit()

    cli.invoke(["cds", "sync"])

    record = LiteratureRecord.get_record_by_pid_value("321321")
    assert record.get("external_system_identifiers") == expected_external_identifiers
