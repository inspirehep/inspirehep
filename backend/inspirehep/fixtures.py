# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from flask import current_app
from flask.cli import with_appcontext
from invenio_db.cli import create as db_create
from invenio_db.cli import destroy as db_destroy
from invenio_db.cli import init as db_init
from invenio_indexer.cli import init_queue, purge_queue
from invenio_search.cli import destroy as indexer_destroy
from invenio_search.cli import init as indexer_index
from redis import StrictRedis

from inspirehep.accounts.fixtures import init_oauth_token, init_users_and_permissions
from inspirehep.files.cli import create_buckets
from inspirehep.indexer.cli import put_files_pipeline


@click.group()
def fixtures():
    """Command related to records in inspire"""


@fixtures.command()
@with_appcontext
@click.pass_context
@click.option("--with-fixtures", is_flag=True, help="Create fixtures in the database.")
def setup(ctx, with_fixtures):
    """Help reduce the time of setting up the application."""
    click.secho("Setting up the application. \n", bold=True, fg="green")

    StrictRedis.from_url(current_app.config["CACHE_REDIS_URL"]).flushall()
    click.secho("Flushed redis cache. \n", fg="blue")

    ctx.invoke(db_destroy)
    ctx.invoke(db_init)
    ctx.invoke(db_create)

    ctx.invoke(indexer_destroy, force=True)
    ctx.invoke(put_files_pipeline)
    ctx.invoke(indexer_index, force=True)

    ctx.invoke(init_queue)
    ctx.invoke(purge_queue)

    ctx.invoke(create_buckets)

    if with_fixtures:
        click.secho("Setting up fixtures. \n", fg="blue")
        init_users_and_permissions()
        init_oauth_token()

    click.secho("Setup finished. \n", bold=True, fg="green")


@fixtures.command()
@with_appcontext
def init():
    init_users_and_permissions()
    init_oauth_token()
