# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

import orjson
from helpers.utils import create_record, es_search
from marshmallow import utils


def test_index_experiment_record(inspire_app, datadir):
    data = orjson.loads((datadir / "1108541.json").read_text())
    record = create_record("exp", data=data)

    expected_count = 1
    expected_metadata = deepcopy(record)
    expected_metadata["experiment_suggest"] = [
        {"input": "LHC", "weight": 1},
        {"input": "ATLAS", "weight": 1},
        {"input": "CERN", "weight": 1},
        {"input": "{ATLAS}", "weight": 1},
        {"input": "ATLAS", "weight": 1},
        {"input": "CERN-ATLAS", "weight": 1},
        {"input": "CERN-LHC-ATLAS", "weight": 5},
    ]
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)
    expected_metadata["number_of_papers"] = 0

    response = es_search("records-experiments")

    assert response["hits"]["total"]["value"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
