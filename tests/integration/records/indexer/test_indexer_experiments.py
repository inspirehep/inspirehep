# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from invenio_search import current_search_client as es
from marshmallow import utils

from inspirehep.search.api import ExperimentsSearch


def test_index_experiment_record(base_app, es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1108541.json").read_text())
    record = create_record("exp", data=data)

    expected_count = 1
    expected_metadata = deepcopy(record)
    expected_metadata["experiment_suggest"] = {
        "input": [
            "LHC",
            "ATLAS",
            "CERN",
            "CERN-LHC-ATLAS",
            "{ATLAS}",
            "ATLAS",
            "CERN-ATLAS",
        ]
    }
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)

    response = es.search("records-experiments")

    assert response["hits"]["total"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1108541.json").read_text())
    record = create_record("exp", data=data)

    record["deleted"] = True
    record._index()
    es_clear.indices.refresh("records-experiments")

    expected_records_count = 0

    record_lit_es = ExperimentsSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
