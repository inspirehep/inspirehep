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
)
from inspirehep.mailing.providers.mailtrain import (
    mailtrain_update_weekly_campaign_content,
)
from inspirehep.records.api import JobsRecord

LOGGER = structlog.getLogger()


@click.group()
def mailing():
    """Command to handle mailing."""


@mailing.command(
    help="Updates the Atom feed for the weekly campaign with the INSPIRE jobs posted last week."
)
@with_appcontext
def update_weekly_jobs():

    click.secho("Searching for jobs posted last week")

    jobs = get_jobs_from_last_week()
    if not jobs:
        click.secho("No jobs found from last week skipping...", fg="red")
        return

    click.secho(f"Found {len(jobs)} job records from last week.", fg="green")

    content = get_jobs_weekly_html_content(jobs)
    if not mailtrain_update_weekly_campaign_content(content):
        click.secho("There was a problem with updating Atom Feed")
        exit(1)

    click.secho("Campaign updated.", fg="green")


@mailing.command(
    help="Sends an email to the job's author for jobs which deadline is today or expired 30/60 days ago."
)
@click.option("--dry-run", "--dry-run", help="Skip email sending.", is_flag=True)
@with_appcontext
def notify_expired_jobs(dry_run):
    jobs_to_notify = []
    dates = [
        datetime.date.today(),
        (datetime.date.today() - datetime.timedelta(days=30)),
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
