# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

from invenio_search import current_search_client as es


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
