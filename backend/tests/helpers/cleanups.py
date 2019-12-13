# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import elasticsearch
from elasticsearch import ConflictError
from pytest_invenio.fixtures import _es_create_indexes, _es_delete_indexes
from sqlalchemy_utils import create_database, database_exists


def es_cleanup(es):
    """Removes all data from es indexes

    There is ES error on version 5, when you try to remove records
    using delete_by_query and record have internal visioning and
    it's current version is 0 it's failing. So in this case only way is to
    remove index but invenio 1.1.1 allows to remove all indexes only
    After upgrading to invenio 1.2 we will be able
    to remove only specified index
    """
    from invenio_search import current_search, current_search_client

    es.indices.refresh()
    existing_mappings = set(es.indices.stats()["indices"].keys())
    required_mappings = set(current_search.mappings.keys())
    missing_mappings = required_mappings.difference(existing_mappings)
    if len(missing_mappings):
        _es_create_indexes(current_search, current_search_client)

    try:
        for index in es.indices.stats()["indices"].keys():
            try:
                es.delete_by_query(index, "{}")
            except ConflictError:
                # Retry as there might be some delay on ES side
                es.delete_by_query(index, "{}")
    except elasticsearch.exceptions.RequestError:
        _es_delete_indexes(current_search)
        _es_create_indexes(current_search, current_search_client)
    es.indices.refresh()


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
