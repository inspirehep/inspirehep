# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import json

import mock
import pytest
from helpers.providers.faker import faker

from inspirehep.records.api import InspireRecord


@pytest.fixture(scope="module")
def app_config(app_config):
    # Should be in this format format and length
    # NOTE: Change this with the correct token to record new cassettes
    app_config["MAILCHIMP_API_TOKEN"] = "11111111111111111111111111111111-us3"
    app_config["MAILTRAIN_API_TOKEN"] = "1111111111111111111111111111111111111111"
    app_config["MAILTRAIN_URL"] = "https://lists.labs.inspirehep.net"
    app_config["MAILTRAIN_JOBS_WEEKLY_LIST_ID"] = "xKU-qcq8U"
    return app_config


def mock_job_create_and_update_time(date, data=None):
    record_data = faker.record("job", data=data)
    record = InspireRecord.create(record_data)
    mock_datetime = mock.PropertyMock(return_value=date)
    type(record).created = mock_datetime
    type(record).updated = mock_datetime
    record._index()
    return record


@pytest.fixture(scope="function")
def create_jobs(base_app, db, es_clear, shared_datadir, create_record):
    now_utc = datetime.datetime.utcnow()

    data = json.loads((shared_datadir / "1444586.json").read_text())
    job_5_days_old = mock_job_create_and_update_time(
        now_utc - datetime.timedelta(days=5), data=data
    )

    data = json.loads((shared_datadir / "1468124.json").read_text())
    job_6_days_old = mock_job_create_and_update_time(
        now_utc - datetime.timedelta(days=6), data=data
    )

    data = json.loads((shared_datadir / "1616162.json").read_text())
    job_7_days_old = mock_job_create_and_update_time(
        now_utc - datetime.timedelta(days=7), data=data
    )

    data = json.loads((shared_datadir / "1600035.json").read_text())
    job_8_days_old = mock_job_create_and_update_time(
        now_utc - datetime.timedelta(days=8), data=data
    )

    job_30_days_old = json.loads((shared_datadir / "1735925.json").read_text())
    create_record("job", data=job_30_days_old)

    job_60_days_old = json.loads((shared_datadir / "1745106.json").read_text())
    create_record("job", data=job_60_days_old)

    es_clear.indices.refresh("records-jobs")
