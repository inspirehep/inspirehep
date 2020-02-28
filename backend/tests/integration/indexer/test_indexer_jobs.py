# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

from helpers.utils import es_search
from invenio_search import current_search
from invenio_search import current_search_client as es
from marshmallow import utils

from inspirehep.search.api import JobsSearch


def test_index_job_record(base_app, es_clear, db, datadir, create_record):
    record = create_record("job")

    expected_total = 1
    expected_source = deepcopy(record)
    expected_source["_created"] = utils.isoformat(record.created)
    expected_source["_updated"] = utils.isoformat(record.updated)

    response = es_search("records-jobs")
    response_source = response["hits"]["hits"][0]["_source"]
    response_total = response["hits"]["total"]["value"]

    assert expected_total == response_total
    assert expected_source == response_source


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    record = create_record("job")

    record["deleted"] = True
    record.index(delay=False)
    current_search.flush_and_refresh("records-jobs")

    expected_records_count = 0

    record_lit_es = JobsSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
