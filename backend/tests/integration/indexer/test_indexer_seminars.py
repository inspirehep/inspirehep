# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from helpers.utils import create_record, es_search
from marshmallow import utils

from inspirehep.records.marshmallow.seminars import SeminarsElasticSearchSchema


def test_index_seminars_record(inspire_app, datadir):
    seminar_data = orjson.loads((datadir / "1.json").read_text())
    record = create_record("sem", data=seminar_data)

    expected_count = 1
    expected_metadata = SeminarsElasticSearchSchema().dump(record).data
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)

    response = es_search("records-seminars")

    assert response["hits"]["total"]["value"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata
