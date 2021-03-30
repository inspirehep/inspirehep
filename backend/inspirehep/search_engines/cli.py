# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
import structlog
from flask.cli import with_appcontext

from inspirehep.files.proxies import current_s3_instance

from .render import get_render_bucket
from .tasks import create_sitemap, render_records

LOGGER = structlog.getLogger()

BUCKETS = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
]


@click.group()
def sitemap():
    """Command group to handle sitemap operations."""


@sitemap.command(
    help="Generates sitemaps for records that should be indexed by search engines",
    name="generate",
)
@with_appcontext
def generate_sitemap():
    try:
        create_sitemap.delay()
        click.secho("Task started.", fg="green")
    except Exception:
        click.secho("Failed.", fg="red")
        LOGGER.exception("Sitemap creation failed.")


@click.group()
def render():
    """Command group to handle render operations."""


@render.command(
    help="Generates render for records that should be indexed by search engines",
    name="generate",
)
@with_appcontext
def generate_render():
    try:
        render_records.delay()
        click.secho("Task started.", fg="green")
    except Exception:
        click.secho("Failed.", fg="red")
        LOGGER.exception("Sitemap creation failed.")


@render.command(help="Creates S3 buckets for [1-9]")
@with_appcontext
def create_buckets():
    click.secho("Creating buckets")
    for index in BUCKETS:
        bucket = get_render_bucket(index)
        current_s3_instance.client.create_bucket(Bucket=bucket)
        click.secho(f"Created bucket: {bucket}")
    click.secho("Created all buckets", fg="green")
