# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from datetime import datetime

import mock
from freezegun import freeze_time
from helpers.providers.faker import faker

from inspirehep.mailing.cli import mailing


@freeze_time(datetime(2019, 9, 17, 6, 0, 0))
def test_update_weekly_jobs(app_cli_runner, base_app, db, es_clear, create_jobs, redis):
    config = {
        "WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY",
        "WEEKLY_JOBS_EMAIL_TITLE": "Weekly jobs",
    }
    with mock.patch.dict(base_app.config, config):
        result = app_cli_runner.invoke(mailing, ["update_weekly_jobs"])
    assert result.exit_code == 0
    assert "Campaign updated" in result.output

    expected_redis_content = [
        str(datetime(2019, 9, 17, 6, 0, 0).timestamp()),
        "Weekly jobs",
        '<!doctype html>\n<html xmlns="http://www.w3.org/1999/xhtml"',
    ]
    expected_keys = ["timestamp", "title", "html"]
    redis_content = redis.hmget(config["WEEKLY_JOBS_EMAIL_REDIS_KEY"], expected_keys)
    assert expected_redis_content[0] == redis_content[0]
    assert expected_redis_content[1] == redis_content[1]
    assert redis_content[2].startswith(expected_redis_content[2])


@freeze_time(datetime(2019, 9, 17, 6, 0, 0))
def test_update_weekly_jobs_populates_rss_feed(
    app_cli_runner, app, db, es_clear, create_jobs, redis, api_client
):
    config = {
        "WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY",
        "WEEKLY_JOBS_EMAIL_TITLE": "Weekly jobs",
    }
    with mock.patch.dict(app.config, config):
        result = app_cli_runner.invoke(mailing, ["update_weekly_jobs"])
        assert result.exit_code == 0
        assert "Campaign updated" in result.output

        expected_redis_content = [
            str(datetime(2019, 9, 17, 6, 0, 0).timestamp()),
            "Weekly jobs",
            '<!doctype html>\n<html xmlns="http://www.w3.org/1999/xhtml"',
        ]

        response = api_client.get(
            "/mailing/rss/jobs/weekly", content_type="application/rss+xml"
        )
        rss_data = response.data.decode("UTF-8")
        assert '<title type="text">Weekly jobs</title>' in rss_data


def test_update_weekly_jobs_with_no_jobs(app_cli_runner, db, es_clear):
    result = app_cli_runner.invoke(mailing, ["update_weekly_jobs"])
    assert result.exit_code == 0
    assert "No jobs found from last week skipping" in result.output


def test_update_weekly_jobs_api_missing_config(
    app_cli_runner, base_app, db, es_clear, create_jobs
):
    with mock.patch.dict(base_app.config, {"WEEKLY_JOBS_EMAIL_REDIS_KEY": None}):
        result = app_cli_runner.invoke(mailing, ["update_weekly_jobs"])
        assert result.exit_code == -1


@freeze_time("2019-09-29")
@mock.patch("inspirehep.mailing.cli.send_job_deadline_reminder")
def test_get_jobs_by_deadline_gets_job_expiring_today_and_skips_emails(
    mock_send_emails, app_cli_runner, base_app, db, es_clear, create_record
):
    today = "2019-09-29"
    data = faker.record("job")
    data["deadline_date"] = today
    data["status"] = "open"
    create_record("job", data=data)

    result = app_cli_runner.invoke(mailing, ["notify_expired_jobs", "--dry-run"])

    assert result.exit_code == 0
    mock_send_emails.assert_not_called()


@freeze_time("2019-09-29")
@mock.patch("inspirehep.mailing.api.jobs.send_email")
def test_get_jobs_by_deadline_gets_job_expired_30_and_60_days_ago_and_send_emails(
    mock_send_emails, app_cli_runner, base_app, db, es_clear, create_jobs
):
    mock_config = {"JOBS_DEADLINE_PASSED_SENDER_EMAIL": "jobs@inspirehep.info"}
    with mock.patch.dict(base_app.config, mock_config):
        result = app_cli_runner.invoke(mailing, ["notify_expired_jobs"])

    assert result.exit_code == 0
    assert mock_send_emails.call_count == 2

    call1 = mock_send_emails.mock_calls[0][2]
    assert call1["sender"] == "jobs@inspirehep.info"
    assert call1["recipient"] == "somebody@virginia.edu"
    assert call1["content"]
    assert call1["cc"] == ["rcg6p@virginia.edu", "rkh6j@virginia.edu"]
    assert (
        call1["subject"]
        == "Expired deadline for your INSPIRE job: Experimental Particle Physics"
    )

    call2 = mock_send_emails.mock_calls[1][2]
    assert call2["sender"] == "jobs@inspirehep.info"
    assert call2["recipient"] == "georgews@ntu.com"
    assert call2["content"]
    assert (
        call2["subject"]
        == "Expired deadline for your INSPIRE job: Postdocs in Belle, CMS and Particle Astrophysics"
    )
    assert call2["cc"] == ["hou.george@ntu.com"]
