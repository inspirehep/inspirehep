# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from invenio_search import current_search_client as es

from inspirehep.search.api import LiteratureSearch


def test_index_literature_record(es_clear, db, datadir, create_record):
    author_data = json.loads((datadir / "1032336.json").read_text())
    author = create_record("aut", data=author_data)
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)

    expected_count = 1
    expected_metadata = json.loads((datadir / "es_1630825.json").read_text())
    expected_metadata_ui_display = json.loads(expected_metadata.pop("_ui_display"))
    expected_facet_author_name = expected_metadata.pop("facet_author_name")
    expected_metadata.pop("authors")

    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_ui_display = json.loads(result.pop("_ui_display"))
    result_authors = result.pop("authors")
    result_facet_author_name = result.pop("facet_author_name")
    del result["_created"]
    del result["_updated"]

    assert response["hits"]["total"] == expected_count
    assert result == expected_metadata
    assert result_ui_display == expected_metadata_ui_display
    assert len(record.get("authors")) == len(result_facet_author_name)
    assert sorted(result_facet_author_name) == sorted(expected_facet_author_name)


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)

    record["deleted"] = True
    record._index()
    es_clear.indices.refresh("records-hep")

    expected_records_count = 0

    record_lit_es = LiteratureSearch().get_record(str(record.id)).execute().hits
    assert expected_records_count == len(record_lit_es)
