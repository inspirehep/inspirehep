# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import click
import requests
from elasticsearch_dsl import Q
from flask.cli import with_appcontext

from inspirehep.curation.tasks import update_pdg_keywords_in_records
from inspirehep.search.api import LiteratureSearch


@click.group()
def curation():
    """Commands for curation"""


@curation.command("update-pdg-keywords")
@click.option("--url", help="URL pointing to PDG JSON data")
@click.option("-bs", "--batch-size", default=50)
@with_appcontext
@click.pass_context
def update_pdg_keywords(ctx, url, batch_size):
    pdg_json_response = requests.get(url, headers={"Accept": "application/json"})

    if pdg_json_response.status_code != 200:
        click.secho("Couldn't fetch PDG json data")
        ctx.exit(1)

    pdg_json_data = pdg_json_response.json()
    record_ids_pdg_keywords_dict = {
        record["inspireId"]: record["pdgIdList"] for record in pdg_json_data
    }
    records_with_pdg_keywords_query = Q("match", keywords__schema="PDG")
    scan_obj = (
        LiteratureSearch().query(records_with_pdg_keywords_query).params(size=1000)
    ).scan()

    generator_empty = False
    while not generator_empty:
        batch = []
        for _ in range(batch_size):
            try:
                record_data = next(scan_obj)
                batch.append(record_data["control_number"])
            except StopIteration:
                generator_empty = True
        update_pdg_keywords_in_records.delay(batch, record_ids_pdg_keywords_dict)
