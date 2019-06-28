# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from copy import deepcopy

from invenio_search import current_search_client as es

from inspirehep.search.api import DataSearch


def test_index_data_record(base_app, es_clear, db, datadir, create_record):
    record = create_record("dat")

    expected_count = 1
    expected_metadata = deepcopy(record)

    response = es.search("records-data")

    assert response["hits"]["total"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    record = create_record("dat")

    record["deleted"] = True
    record._index()
    es_clear.indices.refresh("records-data")

    expected_records_count = 0

    record_lit_es = DataSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
