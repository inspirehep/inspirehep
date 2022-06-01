# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from elasticsearch_dsl import Q
from flask.cli import with_appcontext
from inspire_utils.record import get_values_for_schema
from invenio_db import db
from invenio_records.models import RecordMetadata
from sqlalchemy import String, cast, not_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.disambiguation.tasks import disambiguate_authors
from inspirehep.records.api import AuthorsRecord
from inspirehep.records.models import RecordsAuthors
from inspirehep.search.api import AuthorsSearch
from inspirehep.utils import next_batch


@click.group()
def disambiguation():
    """Commands for disambiguation"""


@disambiguation.command()
@with_appcontext
def clean_stub_authors():
    """Removes all the authors created by disambiguation and having no linked papers."""
    # We get all the stub authors (created by disambiguation) from ES and we verify
    # in db if the returned records are stub (ES data might be outdated)
    stub_authors_query = Q("term", stub=True)
    stub_authors_search = (
        AuthorsSearch().query(stub_authors_query).source(["control_number"])
    )
    stub_authors_control_numbers = [
        ("aut", str(author["control_number"])) for author in stub_authors_search.scan()
    ]
    # We change isolation level in db to the higher one (serializable) to avoid
    # issues with race condition
    db.session.connection(execution_options={"isolation_level": "SERIALIZABLE"})
    stub_authors_verified = AuthorsRecord.get_records_by_pids(
        stub_authors_control_numbers
    )
    stub_authors_bais = {
        get_values_for_schema(author["ids"], "INSPIRE BAI")[0]: author
        for author in stub_authors_verified
        if author.get("stub")
    }
    # We verify which authors have linked papers
    stub_authors_with_papers = set(
        query_authors_with_linked_papers_by_bai(stub_authors_bais.keys())
    )
    # For every author who has not linked papers we delete record
    authors_to_remove = set(stub_authors_bais.keys()).difference(
        stub_authors_with_papers
    )
    click.echo(f"Removing {len(authors_to_remove)} stub authors with no linked papers")
    for author_bai in authors_to_remove:
        author = stub_authors_bais[author_bai]
        author.delete()
    db.session.commit()
    click.echo("Successfully removed stub authors")


def query_authors_with_linked_papers_by_bai(authors_bais):
    query = RecordsAuthors.query.filter(
        RecordsAuthors.id_type == "INSPIRE BAI",
        RecordsAuthors.author_id.in_(authors_bais),
    )

    for data in query.yield_per(100).with_entities(RecordsAuthors.author_id):
        yield data.author_id


@disambiguation.command(name="not-disambiguated")
@with_appcontext
def disambiguate_all_not_disambiguated():
    """Trigger disambiguation task for all the records that are not disambiguated"""
    not_disambiguiated_records_condition = (
        not_(
            type_coerce(RecordMetadata.json, JSONB)["authors"].has_key("record")  # noqa
        )
    ) & (
        type_coerce(RecordMetadata.json, JSONB)["_collections"].contains(["Literature"])
    )
    query = RecordMetadata.query.with_entities(cast(RecordMetadata.id, String)).filter(
        not_disambiguiated_records_condition
    )
    with click.progressbar(
        query.yield_per(1000),
        length=query.count(),
        label="Scheduling disambiguation tasks",
    ) as items:
        batch = next_batch(items, 1000)
        while batch:
            uuids = [str(item[0]) for item in batch]
            disambiguate_authors.chunks(
                zip(uuids, [True for i in uuids]), 10
            ).apply_async()
            batch = next_batch(items, 1000)


@disambiguation.command(name="record")
@with_appcontext
@click.option("-id", "--uuid", type=str, required=True)
def disambiguate_record_by_uuid(uuid):
    """Trigger disambiguation task for one record and disambiguate all the authors without reference"""
    disambiguate_authors.delay(uuid, disambiguate_all_not_disambiguated=True)
