# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from datetime import datetime

import mock
from flask import current_app
from freezegun import freeze_time
from helpers.utils import app_cli_runner, get_test_redis, override_config

from inspirehep.cli import cli
from inspirehep.mailing.cli import mailing


@freeze_time(datetime(2019, 9, 17, 6, 0, 0))
def test_update_weekly_jobs(app_clean, create_jobs):
    config = {
        "WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY",
        "WEEKLY_JOBS_EMAIL_TITLE": "Weekly jobs",
    }
    with mock.patch.dict(current_app.config, config):
        result = app_cli_runner().invoke(cli, ["mailing", "update_weekly_jobs"])
    assert result.exit_code == 0
    assert "Campaign updated" in result.output

    expected_redis_content = [
        str(datetime(2019, 9, 17, 6, 0, 0).timestamp()),
        "Weekly jobs",
        '<!doctype html>\n<html xmlns="http://www.w3.org/1999/xhtml"',
    ]
    expected_keys = ["timestamp", "title", "html"]
    redis_content = get_test_redis().hmget(
        config["WEEKLY_JOBS_EMAIL_REDIS_KEY"], expected_keys
    )
    assert expected_redis_content[0] == redis_content[0]
    assert expected_redis_content[1] == redis_content[1]
    assert redis_content[2].startswith(expected_redis_content[2])


@freeze_time(datetime(2019, 9, 17, 6, 0, 0))
def test_update_weekly_jobs_populates_rss_feed(app_clean, create_jobs):
    config = {
        "WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY",
        "WEEKLY_JOBS_EMAIL_TITLE": "Weekly jobs",
    }
    with override_config(**config), app_clean.app.test_client() as client:
        result = app_clean.cli.invoke(mailing, ["update_weekly_jobs"])
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


def test_update_weekly_jobs_with_no_jobs(app_clean):
    result = app_cli_runner().invoke(mailing, ["update_weekly_jobs"])
    assert result.exit_code == 0
    assert "No jobs found from last week skipping" in result.output


def test_update_weekly_jobs_api_missing_config(app_clean, create_jobs):
    with mock.patch.dict(current_app.config, {"WEEKLY_JOBS_EMAIL_REDIS_KEY": None}):
        result = app_cli_runner().invoke(mailing, ["update_weekly_jobs"])
        assert result.exit_code == -1
