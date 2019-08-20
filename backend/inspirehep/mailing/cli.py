# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import click
from flask.cli import with_appcontext

from .api.jobs import (
    get_jobs_from_last_week,
    get_jobs_weekly_html_content,
    send_jobs_weekly_campaign,
)


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
