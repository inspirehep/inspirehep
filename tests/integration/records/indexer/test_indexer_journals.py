# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from invenio_search import current_search_client as es


def test_index_journal_record(base_app, es_clear, db, datadir, create_record):
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
    response = es.search("records-journals")

    assert response["hits"]["total"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
