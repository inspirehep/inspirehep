# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl.query import Q
from flask import current_app, render_template

from inspirehep.search.api import JobsSearch

from ..providers.mailchimp import mailchimp_create_campaign, mailchimp_send_campaign
from ..providers.mailtrain import mailtrain_subscribe_user_to_list


def get_jobs_from_last_week():
    """Jobs created the last 7 days."""
    query = Q("range", **{"_created": {"gte": "now-7d/d", "lt": "now/d"}})
    search = JobsSearch().query(query).sort("-_created")
    return search.execute().hits


def get_jobs_weekly_html_content(jobs):
    return render_template("mailing/jobs/weekly/base.html", jobs=jobs)


def send_jobs_weekly_campaign(html_content, test_emails=None):
    campaign_id = mailchimp_create_campaign(
        current_app.config["MAILCHIMP_JOBS_WEEKLY_REPLICATE_CAMPAIGN_ID"]
    )
    return mailchimp_send_campaign(campaign_id, html_content, test_emails=test_emails)


def subscribe_to_jobs_weekly_list(email, first_name, last_name):
    list_id = current_app.config["MAILTRAIN_JOBS_WEEKLY_LIST_ID"]
    return mailtrain_subscribe_user_to_list(list_id, email, first_name, last_name)
