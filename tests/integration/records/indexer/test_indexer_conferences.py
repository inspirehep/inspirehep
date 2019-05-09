# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy

from invenio_search import current_search_client as es


def test_index_conference_record(base_app, es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1203206.json").read_text())
    record = create_record("con", data=data)

    expected_count = 1
    expected_metadata = deepcopy(record)
    expected_metadata["self_recid"] = 1203206

    response = es.search("records-conferences")

    assert response["hits"]["total"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
