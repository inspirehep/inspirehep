# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy

from invenio_search import current_search_client as es


def test_index_experiment_record(es_clear, db, datadir, create_record_factory):
    data = json.loads((datadir / "1108541.json").read_text())
    record = create_record_factory("exp", data=data, with_indexing=True)
    response = es.search("records-experiments")
    expected_count = 1
    expected_metadata = deepcopy(record.json)
    assert len(response["hits"]["hits"]) == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_index_conference_record(es_clear, db, datadir, create_record_factory):
    data = json.loads((datadir / "1203206.json").read_text())
    record = create_record_factory("con", data=data, with_indexing=True)

    response = es.search("records-conferences")
    expected_count = 1
    expected_metadata = deepcopy(record.json)
    assert len(response["hits"]["hits"]) == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_index_literature_record(es_clear, db, datadir, create_record_factory):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record_factory("lit", data=data, with_indexing=True)

    response = es.search("records-hep")
    expected_count = 1
    expected_metadata = deepcopy(record.json)
    assert len(response["hits"]["hits"]) == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
