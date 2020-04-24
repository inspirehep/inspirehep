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

from inspirehep.search.api import JournalsSearch


def test_index_journal_record(inspire_app, datadir):
    data = json.loads((datadir / "1213103.json").read_text())
    record = create_record("jou", data=data)

    expected_count = 1
    expected_metadata = deepcopy(record)
    expected_metadata["title_suggest"] = {
        "input": [
            "The Journal of High Energy Physics (JHEP)",
            "JHEP",
            "JOURNAL OF HIGH ENERGY PHYSICS",
            "JOURNL OF HIGH ENERGY PHYSICS",
            "JOURNALOFHIGHENERGYPHYSICS",
            "J HIGH ENERGY PHYSICS",
            "JOUR OFHIGHENERGYPHYS",
            "J HIGHENERGYPHYSICS",
            "J HIGH ENERGY PHYS",
            "J HIGH ENGERY PHYS",
            "J HIGH ENERG PHYS",
            "J HIGH ENERGYPHYS",
            "J HIGHENERGY PHYS",
            "J HIGH ENER PHYS",
            "J HIGHENERGYPHYS",
            "J HIGHENERGYPHY",
            "J HIGH EN PHYS",
            "J HIGH ENERGY",
            "J HIGHEN PHYS",
            "J HIGH PHYS",
            "J H E PHYS",
            "J HEP",
            "JHEPA",
            "JHEP",
        ]
    }
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)

    response = es_search("records-journals")

    assert response["hits"]["total"]["value"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_indexer_deletes_record_from_es(inspire_app, datadir):
    data = json.loads((datadir / "1213103.json").read_text())
    record = create_record("jou", data=data)

    record["deleted"] = True
    record.index(delay=False)
    current_search.flush_and_refresh("records-journals")

    expected_records_count = 0

    record_lit_es = JournalsSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
