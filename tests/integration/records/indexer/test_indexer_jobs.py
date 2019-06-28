# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

from invenio_search import current_search_client as es

from inspirehep.search.api import JobsSearch


def test_index_job_record(base_app, es_clear, db, datadir, create_record):
    record = create_record("job")

    expected_total = 1
    expected_source = deepcopy(record)

    response = es.search("records-jobs")
    response_source = response["hits"]["hits"][0]["_source"]
    response_source.pop("_created")
    response_source.pop("_updated")
    response_total = response["hits"]["total"]

    assert expected_total == response_total
    assert expected_source == response_source


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    record = create_record("job")

    record["deleted"] = True
    record._index()
    es_clear.indices.refresh("records-jobs")

    expected_records_count = 0

    record_lit_es = JobsSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
