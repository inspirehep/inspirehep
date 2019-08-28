# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime

import click
import structlog
from flask.cli import with_appcontext

from inspirehep.mailing.api.jobs import (
    get_jobs_from_last_week,
    get_jobs_weekly_html_content,
    send_job_deadline_reminder,
    send_jobs_weekly_campaign,
)
from inspirehep.records.api import JobsRecord

LOGGER = structlog.getLogger()


@click.group()
def mailing():
    """Command to handle mailing."""


@mailing.command(help="Sends a campaign with the INSPIRE jobs posted last week.")
@click.option(
    "-te", "--test-emails", "test_emails", help="Send test campaign.", multiple=True
)
@with_appcontext
def send_weekly_jobs(test_emails):

    click.secho("Searching for jobs posted last week")

    jobs = get_jobs_from_last_week()
    if not jobs:
        click.secho("No jobs found from last week skipping...", fg="red")
        return

    click.secho(f"Found {len(jobs)} job records from last week.", fg="green")

    content = get_jobs_weekly_html_content(jobs)
    send_jobs_weekly_campaign(content, test_emails=test_emails)

    click.secho("Campaign sent.", fg="green")


@mailing.command(help="Sends an email to the job's author for jobs which deadline is today or expired 30/60 days ago.")
@click.option(
    "--dry-run", "--dry-run", help="Skip email sending.", is_flag=True
)
def notify_expired_jobs(dry_run):
    jobs_to_notify = []
    dates = [
        datetime.date.today(),
        (datetime.date.today() - datetime.timedelta(days=30)),
        (datetime.date.today() - datetime.timedelta(days=60)),
    ]

    for d in dates:
        expired_jobs = JobsRecord.get_jobs_by_deadline(d)
        LOGGER.info(f"Found {len(expired_jobs)} expired jobs", deadline=d)
        jobs_to_notify.extend(expired_jobs)

    if not jobs_to_notify:
        LOGGER.info("No expired job to notify, exiting.")
        return

    if dry_run:
        LOGGER.warn(f"Skip sending emails for {len(jobs_to_notify)} expired jobs")
        return

    LOGGER.info(f"Sending {len(jobs_to_notify)} emails for expired jobs")

    for job in jobs_to_notify:
        send_job_deadline_reminder(job.to_dict())
