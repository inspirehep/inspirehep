# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import islice

import click
from elasticsearch_dsl import Q
from flask.cli import with_appcontext
from flask_celeryext.app import current_celery_app
from invenio_db import db

from inspirehep.disambiguation.tasks import disambiguate_authors
from inspirehep.records.api import AuthorsRecord
from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.records.models import RecordsAuthors
from inspirehep.search.api import AuthorsSearch, LiteratureSearch

MAX_INDEXER_QUEUE_LEN = 100000
MAX_DISAMBIGUATION_QUEUE_LEN = 10000


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
    stub_authors_recids = {
        str(author["control_number"]): author
        for author in stub_authors_verified
        if author.get("stub")
    }
    # We verify which authors have linked papers
    stub_authors_with_papers = set(
        query_authors_with_linked_papers_by_recid(stub_authors_recids.keys())
    )
    # For every author who has not linked papers we delete record
    authors_to_remove = set(stub_authors_recids.keys()).difference(
        stub_authors_with_papers
    )
    click.echo(f"Removing {len(authors_to_remove)} stub authors with no linked papers")
    for author_recid in authors_to_remove:
        author = stub_authors_recids[author_recid]
        author.delete()
    db.session.commit()
    click.echo("Successfully removed stub authors")


def query_authors_with_linked_papers_by_recid(author_recids):
    query = RecordsAuthors.query.filter(
        RecordsAuthors.id_type == "recid",
        RecordsAuthors.author_id.in_(author_recids),
    )

    for data in query.yield_per(100).with_entities(RecordsAuthors.author_id):
        yield data.author_id


def _get_all_not_disambiguated_records_search():
    query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "nested": {
                            "path": "authors",
                            "query": {
                                "bool": {
                                    "must_not": {
                                        "exists": {"field": "authors.record.$ref"}
                                    }
                                }
                            },
                        }
                    },
                    {"match": {"_collections": "Literature"}},
                ]
            }
        }
    }

    search_obj = (
        LiteratureSearch()
        .from_dict(query)
        .params(track_total_hits=True, _source={}, size=1000, scroll="60m")
    )
    return search_obj


def _send_celery_group_disambiguation_task(uuids, batch_size):
    records = LiteratureRecord.get_records(uuids)
    input_data = ((str(record.id), record.model.version_id, True) for record in records)
    task_group = disambiguate_authors.chunks(input_data, batch_size).group()
    task_group.apply_async(countdown=5, queue="disambiguation")


@disambiguation.command(name="not-disambiguated")
@with_appcontext
@click.option(
    "--celery-batch-size", type=int, default=5, help="Batch size for celery task chunks"
)
@click.option(
    "--total-records",
    type=int,
    help="Number of records to disambiguate, if not passed all records with at least one not disambiguated will be sent to the queue",
)
@click.option(
    "--indexing-queue-limit",
    type=int,
    default=MAX_INDEXER_QUEUE_LEN,
    show_default=True,
    help="Number of records to disambiguate, if not passed all records with at least one not disambiguated will be sent to the queue",
)
@click.option(
    "--disambiguation-queue-limit",
    type=int,
    default=MAX_DISAMBIGUATION_QUEUE_LEN,
    show_default=True,
    help="Number of records to disambiguate, if not passed all records with at least one not disambiguated will be sent to the queue",
)
def disambiguate_all_not_disambiguated(
    celery_batch_size, total_records, indexing_queue_limit, disambiguation_queue_limit
):
    """Trigger disambiguation task for all the records that are not disambiguated"""
    with current_celery_app.connection_or_acquire() as conn:
        indexer_queue = conn.default_channel.queue_declare(
            queue="indexer_task", passive=True
        )
        disambiguation_queue = conn.default_channel.queue_declare(
            queue="disambiguation", passive=True
        )
    if (
        disambiguation_queue.message_count > disambiguation_queue_limit
        or indexer_queue.message_count > indexing_queue_limit
    ):
        click.echo("MQ queues are full, can't run disambiguation")
        return
    not_disambiguated_records_search = _get_all_not_disambiguated_records_search()
    documents = not_disambiguated_records_search.scan()
    if total_records:
        documents = islice(documents, total_records)
    uuids = (document.meta.id for document in documents)
    _send_celery_group_disambiguation_task(uuids, celery_batch_size)


@disambiguation.command(name="record")
@with_appcontext
@click.option("-id", "--uuid", type=str, required=True)
def disambiguate_record_by_uuid(uuid):
    """Trigger disambiguation task for one record and disambiguate all the authors without reference"""
    record = LiteratureRecord.get_record(uuid)
    disambiguate_authors.delay(
        uuid, record.model.version_id, disambiguate_all_not_disambiguated=True
    )
