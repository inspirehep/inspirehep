# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
"""
import json

import collections
from invenio_search import current_search_client as es


def test_index_literature_record(base_app, es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)

    expected_count = 1
    # expected_metadata = json.loads((datadir / "es_1630825.json").read_text(),  object_pairs_hook=collections.OrderedDict)
    expected_metadata_sorted = json.loads((datadir / "es_1630825.json").read_text(),  object_pairs_hook=collections.OrderedDict)
    # expected_metadata_sorted = dict(sorted(expected_metadata.items(), key=lambda x: x[0]))

    expected_metadata_ui_display = json.loads(expected_metadata_sorted.pop("_ui_display"))
    expected_authors = expected_metadata_sorted.pop("authors")
    expected_authors_len = len(expected_authors)

    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_sorted = dict(sorted(result.items(), key=lambda x:x[0]))
    result_ui_display = json.loads(result_sorted.pop("_ui_display"))
    result_authors = result_sorted.pop("authors")
    result_authors_len = len(result_sorted)

    del result_sorted["_created"]
    del result_sorted["_updated"]

    assert response["hits"]["total"] == expected_count
    assert expected_metadata_sorted == result_sorted
    assert expected_metadata_ui_display == result_ui_display
    assert expected_authors_len == result_authors_len

    for index, expected_author in enumerate(expected_authors):
        result_author = result_authors[index]
        result_name_suggest = sorted(result_author.pop("name_suggest"))
        result_name_variations = sorted(result_author.pop("name_variations"))

        expected_name_suggest = sorted(expected_author.pop("name_suggest"))
        expected_name_variations = sorted(expected_author.pop("name_variations"))

        assert expected_name_variations == result_name_variations
        assert expected_name_suggest == result_name_suggest
        assert expected_author == result_author
"""

# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from invenio_search import current_search_client as es


def test_index_literature_record(es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)

    expected_count = 1
    expected_metadata = json.loads((datadir / "es_1630825.json").read_text())
    expected_metadata_ui_display = json.loads(expected_metadata.pop("_ui_display"))
    expected_metadata.pop("authors")

    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_ui_display = json.loads(result.pop("_ui_display"))
    result_authors = result.pop("authors")
    del result["_created"]
    del result["_updated"]

    assert response["hits"]["total"] == expected_count
    assert result == expected_metadata
    assert result_ui_display == expected_metadata_ui_display
