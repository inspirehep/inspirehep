# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from datetime import datetime, timedelta

import click
import requests
import structlog
from flask.cli import with_appcontext
from inspire_utils.record import get_values_for_schema
from invenio_db import db

from inspirehep.records.api import LiteratureRecord

LOGGER = structlog.getLogger()
HEPDATA_URL = "https://www.hepdata.net/search/ids"


@click.group()
def hepdata():
    """Commands for disambiguation"""


@hepdata.command("harvest")
@click.option(
    "--since",
    "-s",
    "since",
    default=None,
    help="Date from when hepdata should be harvested. If not provided the date from a day before would be used.",
)
@with_appcontext
def harvest(since):
    if since:
        try:
            since = datetime.strptime(since, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(
                f"`since`: {since} is in wrong format. Should be in ISO format: YYYY-MM-DD."
            )
    else:
        since = (datetime.now() - timedelta(1)).strftime("%Y-%m-%d")
    payload = {"inspire_ids": True, "last_updated": since, "sort_by": "latest"}
    hepdata_response = requests.get(HEPDATA_URL, params=payload)
    hepdata_response.raise_for_status()
    ids = hepdata_response.json()
    LOGGER.info(
        "Collected hepdata ids, assigning them to INSPIRE records.",
        number_of_collected_ids=len(ids),
    )
    records_to_update = list(
        LiteratureRecord.get_records_by_pids([("lit", str(recid)) for recid in ids])
    )
    for record in records_to_update:
        record_external_identifiers = record.setdefault(
            "external_system_identifiers", []
        )
        if not get_values_for_schema(record_external_identifiers, "HEPDATA"):
            record_external_identifiers.append(
                {"schema": "HEPDATA", "value": f"ins{record['control_number']}"}
            )
            record.update(dict(record))
    db.session.commit()
