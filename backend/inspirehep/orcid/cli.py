#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from click import secho
from flask.cli import with_appcontext

from inspirehep.orcid.api import push_to_orcid
from inspirehep.records.api import LiteratureRecord


@click.group()
def orcid():
    """Commands to run ORCID tasks."""


@orcid.command("push-records")
@click.argument("recids", nargs=-1, required=True)
@with_appcontext
def push_records(recids):
    """Manually trigger the push of the given records."""
    for recid in recids:
        push_to_orcid(LiteratureRecord.get_record_by_pid_value(recid))
    secho(f"Scheduled ORCID push of {len(recids)} records.")
