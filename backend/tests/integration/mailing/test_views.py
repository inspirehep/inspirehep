# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest
import vcr
from flask import render_template
from freezegun import freeze_time

from inspirehep.mailing.api.jobs import (
    get_jobs_from_last_week,
    get_jobs_weekly_html_content,
    send_jobs_weekly_campaign,
    subscribe_to_jobs_weekly_list,
)
from inspirehep.records.api import InspireRecord


@pytest.mark.vcr()
def test_view_subscribe_to_list(api_client, db, es_clear, vcr_cassette):
    response = api_client.post(
        "/mailing/subscribe/jobs/weekly",
        content_type="application/json",
        data=json.dumps(
            {"email": "frank@castle.com", "first_name": "Frank", "last_name": "Castle"}
        ),
    )

    assert response.status_code == 200
    assert vcr_cassette.all_played


def test_view_subscribe_to_list_with_invalid_email(api_client, db, es_clear):
    response = api_client.post(
        "/mailing/subscribe/jobs/weekly",
        content_type="application/json",
        data=json.dumps(
            {"email": "frank", "first_name": "Frank", "last_name": "Castle"}
        ),
    )
    expected_message = "Validation Error."
    expected_status_code = 400
    expected_errors = {"email": ["Not a valid email address."]}

    result_message = response.json["message"]
    result_errors = response.json["errors"]
    result_status_code = response.status_code

    assert expected_status_code == result_status_code
    assert expected_message == result_message
    assert expected_errors == result_errors


def test_view_subscribe_to_list_with_missing_data(api_client, db, es_clear):
    response = api_client.post(
        "/mailing/subscribe/jobs/weekly",
        content_type="application/json",
        data=json.dumps({"email": "frank@castle.com"}),
    )
    expected_message = "Validation Error."
    expected_status_code = 400
    expected_errors = {
        "first_name": ["Missing data for required field."],
        "last_name": ["Missing data for required field."],
    }

    result_message = response.json["message"]
    result_status_code = response.status_code
    result_errors = response.json["errors"]

    assert expected_status_code == result_status_code
    assert expected_message == result_message
    assert expected_errors == result_errors
