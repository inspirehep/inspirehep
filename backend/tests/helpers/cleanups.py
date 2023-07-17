# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from itertools import chain

from opensearchpy import ConflictError, NotFoundError, RequestError
from opensearchpy.client.ingest import IngestClient
from flask import current_app
from helpers.utils import get_index_alias
from invenio_search.errors import IndexAlreadyExistsError
from pytest_invenio.fixtures import _search_create_indexes
from sqlalchemy_utils import create_database, database_exists

from inspirehep.indexer.cli import _put_files_pipeline


def es_cleanup(es):
    """Removes all data from es indexes

    There is ES error on version 5, when you try to remove records
    using delete_by_query and record have internal visioning and
    it's current version is 0 it's failing. So in this case only way is to
    remove index but invenio 1.1.1 allows to remove all indexes only
    After upgrading to invenio 1.2 we will be able
    to remove only specified index
    """
    from invenio_search import current_search

    ingestion_pipeline_client = IngestClient(current_search.client)
    current_search.flush_and_refresh("*")
    existing_mappings_nested = (
        x["aliases"].keys() for x in es.indices.get_alias("*").values()
    )
    existing_mappings = set(chain.from_iterable(existing_mappings_nested))
    required_mappings = {
        get_index_alias(index) for index in current_search.mappings.keys()
    }
    missing_mappings = required_mappings.difference(existing_mappings)
    try:
        if len(missing_mappings):
            _search_create_indexes(current_search, es)
        for index in required_mappings:
            try:
                es.delete_by_query(index, '{"query" : {"match_all" : {} }}')
            except ConflictError:
                # Retry as there might be some delay on ES side
                current_search.flush_and_refresh("*")
                es.delete_by_query(index, '{"query" : {"match_all" : {} }}')
    except (RequestError, NotFoundError, IndexAlreadyExistsError):
        es.indices.delete(index="*", allow_no_indices=True, expand_wildcards="all")
        current_search.flush_and_refresh("*")
        _search_create_indexes(current_search, es)
    try:
        ingestion_pipeline_client.get_pipeline(
            current_app.config["ES_FULLTEXT_PIPELINE_NAME"]
        )
    except (RequestError, NotFoundError):
        _put_files_pipeline()

    current_search.flush_and_refresh("*")


def db_cleanup(db_):
    """Truncate tables."""
    if not database_exists(str(db_.engine.url)):
        create_database(str(db_.engine.url))
    db_.session.remove()
    db_.create_all()
    all_tables = db_.metadata.tables
    for table_name, table_object in all_tables.items():
        db_.session.execute(f"ALTER TABLE {table_name} DISABLE TRIGGER ALL;")
        db_.session.execute(table_object.delete())
        db_.session.execute(f"ALTER TABLE {table_name} ENABLE TRIGGER ALL;")
    db_.session.commit()
