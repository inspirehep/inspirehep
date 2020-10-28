# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from datetime import datetime

from freezegun import freeze_time


@freeze_time(datetime(2019, 9, 17, 6, 0, 0))
def test_update_weekly_jobs(inspire_app, redis, cli, create_jobs, override_config):
    config = {
        "WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY",
        "WEEKLY_JOBS_EMAIL_TITLE": "Weekly jobs",
    }
    with override_config(**config):
        result = cli.invoke(["mailing", "update_weekly_jobs"])
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
    inspire_app, cli, create_jobs, override_config
):
    config = {
        "WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY",
        "WEEKLY_JOBS_EMAIL_TITLE": "Weekly jobs",
    }
    with override_config(**config), inspire_app.test_client() as client:
        result = cli.invoke(["mailing", "update_weekly_jobs"])
        assert result.exit_code == 0
        assert "Campaign updated" in result.output

        expected_redis_content = [
            str(datetime(2019, 9, 17, 6, 0, 0).timestamp()),
            "Weekly jobs",
            '<!doctype html>\n<html xmlns="http://www.w3.org/1999/xhtml"',
        ]
        response = client.get(
            "/mailing/rss/jobs/weekly", content_type="application/rss+xml"
        )
        rss_data = response.data.decode("UTF-8")
        assert "<title>Weekly jobs</title>" in rss_data


def test_update_weekly_jobs_with_no_jobs(inspire_app, cli):
    result = cli.invoke(["mailing", "update_weekly_jobs"])
    assert result.exit_code == 0
    assert "No jobs found from last week skipping" in result.output


def test_update_weekly_jobs_api_missing_config(
    inspire_app, cli, create_jobs, override_config
):
    with override_config(**{"WEEKLY_JOBS_EMAIL_REDIS_KEY": None}):
        result = cli.invoke(["mailing", "update_weekly_jobs"])
        assert result.exit_code == -1
