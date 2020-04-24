# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy

from helpers.utils import create_record, es_search
from invenio_search import current_search
from invenio_search import current_search_client as es
from marshmallow import utils

from inspirehep.search.api import ConferencesSearch


def test_index_conference_record(app_clean, datadir):
    data = json.loads((datadir / "1203206.json").read_text())
    record = create_record("con", data=data)

    expected_count = 1
    expected_metadata = deepcopy(record)
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)
    expected_metadata["number_of_contributions"] = record.number_of_contributions

    response = es_search("records-conferences")

    assert response["hits"]["total"]["value"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_indexer_deletes_record_from_es(app_clean, datadir):
    data = json.loads((datadir / "1203206.json").read_text())
    record = create_record("con", data=data)

    record["deleted"] = True
    record.index(delay=False)
    current_search.flush_and_refresh("records-conferences")

    expected_records_count = 0

    record_lit_es = ConferencesSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
