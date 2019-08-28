# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest
from freezegun import freeze_time
from helpers.providers.faker import faker

from inspirehep.mailing.cli import mailing


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


@freeze_time("2019-09-29")
@mock.patch('inspirehep.mailing.cli.send_job_deadline_reminder')
def test_get_jobs_by_deadline_gets_job_expiring_today_and_skips_emails(
    mock_send_emails, app_cli_runner, base_app, db, es_clear, create_record
):
    today = "2019-09-29"
    data = faker.record("job")
    data['deadline_date'] = today
    data['status'] = 'open'
    create_record("job", data=data)

    result = app_cli_runner.invoke(mailing, ["notify_expired_jobs", "--dry-run"])

    assert result.exit_code == 0
    mock_send_emails.assert_not_called()


@freeze_time("2019-09-29")
@mock.patch('inspirehep.mailing.api.jobs.send_email')
def test_get_jobs_by_deadline_gets_job_expired_30_and_60_days_ago_and_send_emails(
    mock_send_emails, app_cli_runner, base_app, db, es_clear, create_jobs
):
    mock_config = {'JOBS_DEADLINE_PASSED_SENDER_EMAIL': 'jobs@inspirehep.info'}
    with mock.patch.dict(base_app.config, mock_config):
        result = app_cli_runner.invoke(mailing, ["notify_expired_jobs"])

    assert result.exit_code == 0
    assert mock_send_emails.call_count == 2

    call1 = mock_send_emails.mock_calls[0][2]
    assert call1['sender'] == 'jobs@inspirehep.info'
    assert call1['recipient'] == 'somebody@virginia.edu'
    assert call1['content']
    assert call1['cc'] == ['rcg6p@virginia.edu', 'rkh6j@virginia.edu']
    assert call1['subject'] == 'Expired deadline for your INSPIRE job: Experimental Particle Physics'

    call2 = mock_send_emails.mock_calls[1][2]
    assert call2['sender'] == 'jobs@inspirehep.info'
    assert call2['recipient'] == 'georgews@ntu.com'
    assert call2['content']
    assert call2['subject'] == 'Expired deadline for your INSPIRE job: Postdocs in Belle, CMS and Particle Astrophysics'
    assert call2['cc'] == ['hou.george@ntu.com']
