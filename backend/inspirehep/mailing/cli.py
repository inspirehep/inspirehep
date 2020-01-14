# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
import structlog
from flask.cli import with_appcontext

from inspirehep.mailing.api.jobs import (
    get_jobs_from_last_week,
    get_jobs_weekly_html_content,
)
from inspirehep.mailing.providers.mailtrain import (
    mailtrain_update_weekly_campaign_content,
)

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
