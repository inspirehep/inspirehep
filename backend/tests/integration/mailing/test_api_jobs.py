# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from flask import render_template
from invenio_accounts.models import User
from invenio_oauthclient.models import UserIdentity
from mock import patch

from inspirehep.mailing.api.jobs import (
    get_job_recipient,
    get_jobs_from_last_week,
    send_job_deadline_reminder,
    subscribe_to_jobs_weekly_list,
)


def test_jobs_from_last_week(base_app, db, es_clear, create_jobs):
    expected_control_numbers = [1444586, 1468124, 1616162]

    results = get_jobs_from_last_week()
    results_control_numbers = [result["control_number"] for result in results]
    assert expected_control_numbers == results_control_numbers


def test_jobs_from_last_week_empty(base_app, db, es_clear):
    expected_control_numbers = []

    results = get_jobs_from_last_week()
    assert expected_control_numbers == []


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


def test_get_job_recipient_no_internal_uid(base_app, db, es_clear):
    expected_email = "somebody@cern.ch"
    job = {
        "acquisition_source": {
            "datetime": "2019-07-04T11:21:22.611086",
            "email": expected_email,
            "method": "submitter",
            "orcid": "0000-0002-8672-7088",
            "source": "submitter",
        }
    }
    email = get_job_recipient(job)
    assert email == expected_email


def test_get_job_recipient_internal_uid(base_app, db, es_clear):
    expected_email = "somebody@cern.ch"

    user = User()
    user.email = expected_email
    user.active = True
    user.id = 23
    db.session.add(user)

    test_user = UserIdentity(id="user", method="test", id_user=user.id)
    db.session.add(test_user)

    job = {
        "acquisition_source": {
            "datetime": "2019-07-04T11:21:22.611086",
            "email": "email@foo.bar",
            "internal_uid": user.id,
            "method": "submitter",
            "orcid": "0000-0002-8672-7088",
            "source": "submitter",
            "submission_number": "None",
        }
    }
    email = get_job_recipient(job)
    # The email is not the one in acquisition_source but in the user account
    assert email == expected_email


@patch("inspirehep.mailing.api.jobs.send_email")
def test_send_email_to_contact_details_without_putting_it_in_cc(
    mock_send_email, base_app, db, es_clear
):
    expected_recipient = "rcg6p@virginia.edu"
    expected_cc = "rkh6j@virginia.edu"
    job = {
        "contact_details": [
            {"email": expected_recipient, "name": "Group, Craig"},
            {"email": expected_cc, "name": "Haverstrom, Rich"},
        ],
        "position": "Tester",
    }
    send_job_deadline_reminder(job)
    mock_send_email.assert_called_once()

    mock_call = mock_send_email.mock_calls[0][2]
    assert mock_call["recipient"] == expected_recipient
    assert mock_call["cc"] == [expected_cc]
