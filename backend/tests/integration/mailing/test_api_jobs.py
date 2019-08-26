# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

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


def test_jobs_from_last_week(base_app, db, es_clear, create_jobs):
    expected_control_numbers = [1444586, 1468124, 1616162]

    results = get_jobs_from_last_week()
    results_control_numbers = [result["control_number"] for result in results]
    assert expected_control_numbers == results_control_numbers


def test_jobs_from_last_week_empty(base_app, db, es_clear):
    expected_control_numbers = []

    results = get_jobs_from_last_week()
    assert expected_control_numbers == []


@pytest.mark.vcr()
def test_send_jobs_weekly_campaign(base_app, db, es_clear, vcr_cassette):
    content = "<p>Breaking news from ALIAS Investigation.</p>"

    send_jobs_weekly_campaign(content)
    assert vcr_cassette.all_played


@pytest.mark.vcr()
def test_send_jobs_weekly_campaign_with_test_emails(
    base_app, db, es_clear, vcr_cassette
):
    content = "<p>Breaking news from ALIAS Investigation.</p>"
    send_jobs_weekly_campaign(content, ["jessica@jones.com"])
    assert vcr_cassette.all_played


def test_render_jobs_weekly_campaign_job_record_template_only(
    base_app, db, es_clear, create_jobs
):
    jobs = get_jobs_from_last_week()
    # Comparing strings is tricky especially with newlines, we're not going to test the whole template,
    # anyway it has a lot of extras from mailchimp and too much noise
    expected_results = [
        '<a title="Experimental Particle Physics" href="https://labs.inspirehep.net/jobs/1444586">Experimental Particle Physics</a>\n(Beijing, Inst. High Energy Phys. - Asia) [Deadline:\n2019-09-01] POSTDOC - hep-ex, physics.ins-det\n(posted 5 days ago)',
        '<a title="Nuclear and Particle Physics" href="https://labs.inspirehep.net/jobs/1468124">Nuclear and Particle Physics</a>\n(U. Alabama, Tuscaloosa - North America) [Deadline:\n2019-08-01] POSTDOC - nucl-ex, hep-ex, physics.ins-det\n(posted 6 days ago)',
        '<a title="Experimental Particle Physics" href="https://labs.inspirehep.net/jobs/1616162">Experimental Particle Physics</a>\n(Shanghai Jiaotong U., INPAC - Asia) [Deadline:\n2019-09-30] POSTDOC - astro-ph, hep-ex, hep-lat, hep-ph, nucl-ex, physics.acc-ph, physics.ins-det\n(posted 7 days ago)',
    ]
    expected_results_len = 3
    assert expected_results_len == len(jobs)

    for job in jobs:
        result = render_template("mailing/jobs/weekly/item.html", job=job)
        assert result in expected_results


@pytest.mark.vrc()
def test_subscirbe_to_the_list(base_app, db, es_clear, vcr_cassette):
    result = subscribe_to_jobs_weekly_list("luke@cage.com", "Luke", "Cage")
    assert vcr_cassette.all_played


def test_subscirbe_to_the_list_with_invalid_email(base_app, db, es_clear):
    with pytest.raises(ValueError):
        subscribe_to_jobs_weekly_list("luke", "Luke", "Cage")
