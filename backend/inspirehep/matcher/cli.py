#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more detail

import click
import structlog
from flask.cli import with_appcontext
from inspirehep.matcher.tasks import match_references_by_uuids
from inspirehep.utils import chunker
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

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

    result_chunks = chunker(literature_uuids_query.yield_per(db_batch_size), batch_size)
    for chunk in result_chunks:
        serialized_uuids = [str(uuid) for (uuid,) in chunk]
        match_references_by_uuids.apply_async(args=[serialized_uuids])
