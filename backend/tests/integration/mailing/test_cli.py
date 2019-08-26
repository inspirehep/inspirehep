# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest
from freezegun import freeze_time

from inspirehep.mailing.api.jobs import (
    get_jobs_from_last_week,
    send_jobs_weekly_campaign,
)
from inspirehep.mailing.cli import mailing
from inspirehep.records.api import InspireRecord


@pytest.mark.vcr()
def test_send_weekly_jobs(
    app_cli_runner, base_app, db, es_clear, create_jobs, vcr_cassette
):
    result = app_cli_runner.invoke(mailing, ["send_weekly_jobs"])
    assert result.exit_code == 0
    assert "Campaign sent" in result.output
    assert vcr_cassette.all_played


def test_send_weekly_jobs_with_no_jobs(app_cli_runner, db, es_clear):
    result = app_cli_runner.invoke(mailing, ["send_weekly_jobs"])
    assert result.exit_code == 0
    assert "No jobs found from last week skipping" in result.output


@pytest.mark.vcr()
def test_send_weekly_jobs_test(app_cli_runner, db, es_clear, create_jobs, vcr_cassette):
    result = app_cli_runner.invoke(
        mailing, ["send_weekly_jobs", "--test-emails", "jessica@jones.com"]
    )
    assert result.exit_code == 0
    assert "Campaign sent" in result.output
    assert vcr_cassette.all_played


def test_send_weekly_jobs_api_missing_exception(
    app_cli_runner, base_app, db, es_clear, create_jobs
):
    with mock.patch.dict(base_app.config, {"MAILCHIMP_API_TOKEN": None}):
        result = app_cli_runner.invoke(mailing, ["send_weekly_jobs"])
        assert result.exit_code == -1
