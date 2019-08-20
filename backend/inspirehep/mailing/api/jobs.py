# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl.query import Q
from flask import current_app, render_template

from inspirehep.search.api import JobsSearch

from ..providers.mailchimp import create_mailchimp_campaign, send_mailchimp_campaign


def get_jobs_from_last_week():
    """Jobs created the last 7 days."""
    query = Q("range", **{"_created": {"gte": "now-7d/d", "lt": "now/d"}})
    search = JobsSearch().query(query).sort("-_created")
    return search.execute().hits


def get_jobs_weekly_html_content(jobs):
    return render_template("mailing/jobs/weekly/base.html", jobs=jobs)


def send_jobs_weekly_campaign(html_content, test_emails=None):
    campaign_id = create_mailchimp_campaign(
        current_app.config["MAILCHIMP_JOBS_WEEKLY_REPLICATE_CAMPAIGN_ID"]
    )
    send_mailchimp_campaign(campaign_id, html_content, test_emails=test_emails)
