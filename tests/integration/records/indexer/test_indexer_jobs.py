# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

from invenio_search import current_search_client as es


def test_index_job_record(es_clear, db, datadir, create_record):
    record = create_record("job")

    expected_count = 1
    expected_metadata = deepcopy(record)

    response = es.search("records-jobs")

    assert response["hits"]["total"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
