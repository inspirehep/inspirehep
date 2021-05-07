# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from datetime import date, datetime

import click
from flask import current_app
from flask.cli import with_appcontext

from inspirehep.cds.api import sync_identifiers
from inspirehep.cds.errors import WrongDateFormat
from inspirehep.cds.models import CDSRun


@click.group()
def cds():
    """Commans for CDS sync"""


@cds.command("sync")
@click.option(
    "--since",
    "-s",
    "since",
    default=None,
    help="Date from when CDS should be synced. If not provided last successful run date will be used.",
)
@with_appcontext
def sync(since=None):
    """Starts sync form CDS server"""
    if not current_app.config.get("FEATURE_FLAG_ENABLE_CDS_SYNC"):
        click.echo("Feature flag for CDS sync is not enabled.")
        exit(-1)
    if not since:
        last_run = CDSRun.get_last_successful_run()
        since = last_run.date.date() if last_run else None
    elif isinstance(since, datetime):
        since = since.date()
    elif not isinstance(since, date):
        try:
            since = datetime.strptime(since, "%Y-%m-%d").date()
        except ValueError:
            raise WrongDateFormat(
                f"`since`: {since} is in wrong format. Should be in ISO format: YYYY-MM-DD."
            )
    try:
        click.echo("Starting CDS Sync.")
        sync_identifiers(since)
    except Exception as exc:
        click.echo("Task didn't finish correctly.")
        click.echo(exc)
        exit(1)
    else:
        click.echo("CDS Sync finished successfully.")
