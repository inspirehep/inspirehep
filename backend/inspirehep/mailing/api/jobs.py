# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from elasticsearch_dsl.query import Q
from flask import current_app, render_template
from inspire_utils.record import get_value
from invenio_oauthclient.models import UserIdentity

from inspirehep.mailing.providers.flask_mail import send_email
from inspirehep.search.api import JobsSearch

from ..providers.mailtrain import mailtrain_subscribe_user_to_list

LOGGER = structlog.getLogger()


def get_jobs_from_last_week():
    """Jobs created the last 7 days."""
    query = Q("range", **{"_created": {"gte": "now-7d/d", "lt": "now/d"}}) & Q(
        "match", **{"status": "open"}
    )
    search = JobsSearch().query(query).params(size=10000).sort("-_created")
    return search.execute().hits


def get_jobs_weekly_html_content(jobs):
    return render_template("mailing/jobs/weekly/base.html", jobs=jobs)


def subscribe_to_jobs_weekly_list(email, first_name, last_name):
    list_id = current_app.config["MAILTRAIN_JOBS_WEEKLY_LIST_ID"]
    return mailtrain_subscribe_user_to_list(list_id, email, first_name, last_name)


def get_jobs_deadline_reminder_html_content(job, recipient):
    host = current_app.config["SERVER_NAME"]
    return render_template(
        "mailing/jobs/deadline_passed/base.html",
        job=job,
        host=host,
        recipient=recipient,
    )


def send_job_deadline_reminder(job):
    """Send an email for the given expired job.

    Args:
        job (dict): a job record.

    Return:
        None
    """
    recipient = get_job_recipient(job)

    if not recipient:
        LOGGER.error(
            "Cannot send deadline email: no recipient found",
            recid=job["control_number"],
        )
        return

    sender = current_app.config["JOBS_DEADLINE_PASSED_SENDER_EMAIL"]
    cc_addresses = [
        cd.get("email")
        for cd in job.get("contact_details")
        if cd.get("email") != recipient
    ]
    subject = f"Expired deadline for your INSPIRE job: {job['position']}"
    content = get_jobs_deadline_reminder_html_content(job, recipient)

    send_email(
        sender=sender,
        recipient=recipient,
        cc=cc_addresses,
        subject=subject,
        content=content,
    )
    LOGGER.info("Expired job email sent", recid=job.get("control_number"))


def get_job_recipient(job):
    """Get the best email to which send a job notification.

    This function tries to load the latest email from the user who submitted
    the job. If the user cannot be found, it returns the email from the
    acquisition_source field.
    In case the acquisition source is not there, it gets the first email of the
    contact_details field.

    Args:
        job (dict): a job record.

    Return:
        string: the email for contacting the job author. It can be None.
    """
    recipient = None
    if "acquisition_source" in job:
        user_id = get_value(job, "acquisition_source.internal_uid")

        if user_id:
            identity = UserIdentity.query.filter_by(id_user=user_id).one_or_none()
            if identity:
                recipient = identity.user.email
    else:
        recipient = get_value(job, "contact_details.email[0]")
    return recipient or get_value(job, "acquisition_source.email")
