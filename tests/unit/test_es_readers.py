# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.
from inspire_disambiguation.core.es.readers import get_literature_records_query

EXPECTED_SOURCE = [
    "abstracts.value",
    "affiliations.value",
    "authors.affiliations.value",
    "authors.curated_relation",
    "authors.full_name",
    "authors.record",
    "authors.signature_block",
    "authors.uuid",
    "control_number",
    "collaborations.value",
    "keywords.value",
    "titles.title",
    "inspire_categories.term",
]


def test_get_lit_records_query_for_all():
    query = get_literature_records_query(None, False)
    source = query._params["_source"]
    expected_query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"_collections": "Literature"}},
                    {"nested": {"path": "authors", "query": {"match_all": {}}}},
                ]
            }
        }
    }
    assert query.to_dict() == expected_query
    assert source == EXPECTED_SOURCE


def test_get_lit_records_query_for_signature_block():
    query = get_literature_records_query(signature_block="BLOCK", only_curated=False)
    source = query._params["_source"]
    expected_query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"_collections": "Literature"}},
                    {
                        "nested": {
                            "path": "authors",
                            "query": {"term": {"authors.signature_block.raw": "BLOCK"}},
                        }
                    },
                ]
            }
        }
    }
    assert query.to_dict() == expected_query
    assert source == EXPECTED_SOURCE


def test_get_lit_records_query_for_only_curated():
    query = get_literature_records_query(only_curated=True, signature_block=None)
    source = query._params["_source"]
    expected_query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"_collections": "Literature"}},
                    {
                        "nested": {
                            "path": "authors",
                            "query": {"term": {"authors.curated_relation": True}},
                        }
                    },
                ]
            }
        }
    }

    assert query.to_dict() == expected_query
    assert source == EXPECTED_SOURCE


def test_get_lit_records_query_for_only_curated_signature_block():
    query = get_literature_records_query(signature_block="BLOCK", only_curated=True)
    source = query._params["_source"]
    expected_query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"_collections": "Literature"}},
                    {
                        "nested": {
                            "path": "authors",
                            "query": {
                                "bool": {
                                    "must": [
                                        {"term": {"authors.curated_relation": True}},
                                        {
                                            "term": {
                                                "authors.signature_block.raw": "BLOCK"
                                            }
                                        },
                                    ]
                                }
                            },
                        }
                    },
                ]
            }
        }
    }
    assert query.to_dict() == expected_query
    assert source == EXPECTED_SOURCE
