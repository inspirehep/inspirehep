# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock

from inspirehep.curation.utils import collaboration_multi_search_query


def test_collaboration_multi_search_query():
    collaborations = [
        {"record": {"$ref": "blah"}, "value": "SHOULD NOT BE THERE"},
        {"value": " SHOULD  BE THERE "},
    ]

    expected_multi_search_dict = [
        {},
        {"query": {"match_all": {}}, "_source": False},
        {},
        {"query": {"match_all": {}}, "_source": False},
        {},
        {
            "query": {
                "bool": {
                    "filter": [{"exists": {"field": "collaboration"}}],
                    "must": [
                        {
                            "term": {
                                "normalized_name_variants": {"value": "SHOULD BE THERE"}
                            }
                        }
                    ],
                }
            },
            "_source": ["collaboration", "self", "legacy_name", "control_number"],
        },
        {},
        {
            "query": {
                "bool": {
                    "filter": [{"exists": {"field": "collaboration"}}],
                    "must": [
                        {"term": {"normalized_subgroups": {"value": "SHOULD BE THERE"}}}
                    ],
                }
            },
            "_source": ["collaboration", "self", "legacy_name", "control_number"],
        },
    ]
    with mock.patch(
        "inspirehep.curation.utils.prefix_index", return_value="records-experiments"
    ):
        multi_search = collaboration_multi_search_query(collaborations)

    assert multi_search.to_dict() == expected_multi_search_dict
