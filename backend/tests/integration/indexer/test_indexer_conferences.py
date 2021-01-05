# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from helpers.utils import create_record, es_search
from marshmallow import utils

from inspirehep.records.marshmallow.conferences import ConferencesElasticSearchSchema


def test_index_conference_record(inspire_app, datadir):
    data = orjson.loads((datadir / "1203206.json").read_text())
    record = create_record("con", data=data)

    expected_count = 1
    expected_metadata = ConferencesElasticSearchSchema().dump(record).data
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)
    expected_metadata["number_of_contributions"] = record.number_of_contributions

    response = es_search("records-conferences")

    assert response["hits"]["total"]["value"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
