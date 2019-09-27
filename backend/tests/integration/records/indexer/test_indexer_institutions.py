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

from inspirehep.search.api import InstitutionsSearch


def test_index_institutions_record(base_app, es_clear, db, datadir, create_record):
    data = json.loads((datadir / "902725.json").read_text())
    record = create_record("ins", data=data)

    expected_count = 1
    expected_metadata = deepcopy(record)
    expected_metadata["affiliation_suggest"] = {
        "input": [
            "CERN, Geneva",
            "CERN",
            "European Organization for Nuclear Research",
            "CERN",
            "Centre Européen de Recherches Nucléaires",
            "01631",
            "1211",
        ]
    }
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)

    response = es.search("records-institutions")

    assert response["hits"]["total"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    data = json.loads((datadir / "902725.json").read_text())
    record = create_record("ins", data=data)

    record["deleted"] = True
    record.index(delay=False)
    es_clear.indices.refresh("records-institutions")

    expected_records_count = 0

    record_lit_es = InstitutionsSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
