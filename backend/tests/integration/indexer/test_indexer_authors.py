#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from freezegun import freeze_time
from helpers.utils import create_record, es_search
from marshmallow import utils


@freeze_time("2010-12-19")
def test_index_author_record(inspire_app, datadir):
    create_record("aut", data={"control_number": 1014725})
    data = orjson.loads((datadir / "999108.json").read_text())
    record = create_record("aut", data=data)

    expected_count = 2
    expected_metadata = data = orjson.loads(
        (datadir / "999108_expected.json").read_text()
    )
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)

    response = es_search("records-authors")
    response_sources = [hit["_source"] for hit in response["hits"]["hits"]]
    assert response["hits"]["total"]["value"] == expected_count
    assert expected_metadata in response_sources
