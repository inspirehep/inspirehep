# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
import structlog
from flask.cli import with_appcontext

from .tasks import create_sitemap

LOGGER = structlog.getLogger()


@click.group()
def sitemap():
    """Command group to handle sitemap operations."""


@sitemap.command(
    help="Generates sitemaps for records that should be indexed by search engines"
)
@with_appcontext
def generate():
    try:
        create_sitemap()
        click.secho("Task started.", fg="green")
    except Exception:
        click.secho("Failed.", fg="red")
        LOGGER.exception("Sitemap creation failed.")
