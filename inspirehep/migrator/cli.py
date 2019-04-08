# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Manage migrator from INSPIRE legacy instance."""


import sys
from textwrap import dedent

import click
from flask import current_app
from flask.cli import with_appcontext

from .tasks import (
    migrate_from_mirror,
    migrate_record_from_legacy,
    populate_mirror_from_file,
)


def halt_if_debug_mode(force):
    message = """\
    The application is running in debug mode, which leaks memory when doing
    many database operations. To avoid problems, disable debug mode. This can
    be done by setting "DEBUG=False" in the config or setting the environment
    variable "APP_DEBUG=False". If you know what you are doing, you can pass
    the "--force" flag to disable this check.
    """
    if not force and current_app.config.get("DEBUG"):
        click.echo(dedent(message), err=True)
        sys.exit(1)


@click.group()
def migrate():
    """Commands to migrate records from legacy."""


@migrate.command("file")
@click.argument(
    "file_name", type=click.Path(exists=True, dir_okay=False, resolve_path=True)
)
@click.option(
    "--mirror-only",
    "-m",
    is_flag=True,
    default=False,
    help="Only mirror the records instead of doing a full migration.",
)
@click.option(
    "--wait",
    "-w",
    is_flag=True,
    default=False,
    help="Wait for migration to complete. This only has an effect if the -m flag is not set.",
)
@click.option(
    "-f",
    "--force",
    is_flag=True,
    default=False,
    help="Force the task to run even in debug mode.",
)
@with_appcontext
def migrate_file(file_name, mirror_only=False, wait=False, force=False):
    """Migrate the records in the provided file.

    The file can be an (optionally-gzipped) XML file containing MARCXML, or a
    prodsync tarball.
    """
    halt_if_debug_mode(force=force)
    click.echo(f"Migrating records from file: {file_name}")

    populate_mirror_from_file(file_name)
    if not mirror_only:
        migrate_from_mirror(wait_for_results=wait)


@migrate.command()
@click.option(
    "--all",
    "-a",
    "also_migrate",
    flag_value="all",
    help="Migrate all records, irrespective of their status.",
)
@click.option(
    "--broken",
    "-b",
    "also_migrate",
    flag_value="broken",
    help="Also migrate broken records, which did not migrate correctly in the previous run.",
)
@click.option(
    "--wait", "-w", is_flag=True, default=False, help="Wait for migration to complete."
)
@click.option(
    "-f",
    "--force",
    is_flag=True,
    default=False,
    help="Force the task to run even in debug mode.",
)
@with_appcontext
def mirror(also_migrate=None, wait=False, force=False):
    """Migrate records from the mirror.

    By default, only records that have not been migrated yet are migrated.
    """
    halt_if_debug_mode(force=force)
    migrate_from_mirror(also_migrate=also_migrate, wait_for_results=wait)


@migrate.command()
@click.argument("recid", type=int)
@with_appcontext
def record(recid):
    """Migrate a single record from legacy."""
    click.echo(f"Migrating record {recid} from INSPIRE legacy")
    migrate_record_from_legacy(recid)
