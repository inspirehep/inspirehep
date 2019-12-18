# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

from freezegun import freeze_time
from invenio_search import current_search_client as es
from marshmallow import utils

from inspirehep.search.api import AuthorsSearch


@freeze_time("2010-12-19")
def test_index_author_record(base_app, es_clear, db, datadir, create_record):
    data = json.loads((datadir / "999108.json").read_text())
    record = create_record("aut", data=data)

    expected_count = 1
    expected_metadata = data = json.loads(
        (datadir / "999108_expected.json").read_text()
    )
    expected_metadata["_created"] = utils.isoformat(record.created)
    expected_metadata["_updated"] = utils.isoformat(record.updated)

    response = es.search("records-authors")

    response_hits_source = response["hits"]["hits"][0]["_source"]
    response_hits_source.pop("_bucket")

    assert response["hits"]["total"]["value"] == expected_count
    assert response["hits"]["hits"][0]["_source"] == expected_metadata


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    data = json.loads((datadir / "999108.json").read_text())
    record = create_record("aut", data=data)

    record["deleted"] = True
    record.index(delay=False)
    es_clear.indices.refresh("records-authors")

    expected_records_count = 0

    record_lit_es = AuthorsSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
