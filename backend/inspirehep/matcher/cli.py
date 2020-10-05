# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more detail

import click
import structlog
from celery import group
from flask.cli import with_appcontext
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.utils import chunker

from .tasks import match_references_by_uuids

LOGGER = structlog.getLogger()


@click.group()
def match():
    """Command group for matcher."""


@match.command(help="Match references of all literature records")
@click.option(
    "-bs",
    "--batch-size",
    default=100,
    help="The number of records per batch that will be indexed by workers.",
    show_default=True,
)
@click.option(
    "-dbs",
    "--db-batch-size",
    default=1000,
    help="The size of the chunk of records loaded from the DB, aka yield_per argument",
    show_default=True,
)
@with_appcontext
def references(batch_size, db_batch_size):
    literature_uuids_query = PersistentIdentifier.query.filter(
        PersistentIdentifier.pid_type == "lit",
        PersistentIdentifier.status == PIDStatus.REGISTERED,
    ).with_entities(PersistentIdentifier.object_uuid)

    matcher_tasks = []
    result_chunks = chunker(literature_uuids_query.yield_per(db_batch_size), batch_size)
    for chunk in result_chunks:
        serialized_uuids = [str(uuid) for (uuid,) in chunk]
        matcher_task = match_references_by_uuids.s(serialized_uuids)
        matcher_tasks.append(matcher_task)

    matcher_task_group = group(matcher_tasks)
    group_result = matcher_task_group()
    group_result.join()  # waits for all tasks to be finished
