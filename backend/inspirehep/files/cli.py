# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from flask.cli import with_appcontext

from .proxies import current_s3_instance


@click.group()
def files():
    """Command group to handle file operations."""


BUCKETS = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
]


@files.command(help="Creates S3 buckets for [0-9] and [a-f]")
@with_appcontext
def create_buckets():

    click.secho("Creating buckets")

    for bucket in BUCKETS:
        current_s3_instance.create_bucket(bucket)
        click.secho(f"Created bucket: {bucket}")

    click.secho("Created all buckets")
