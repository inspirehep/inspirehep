#
# This file is part of INSPIRE.
# Copyright (C) 2014-2017 CERN.
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


from unittest import mock

from inspire_utils.query import ordered
from inspirehep.search.query_parser import parse_query, parser
from inspirehep.search.query_parser.config import ES_MUST_QUERY, ES_SHOULD_QUERY
from inspirehep.search.query_parser.stateful_pypeg_parser import StatefulParser
from inspirehep.search.query_parser.visitors.elastic_search_visitor import (
    ElasticSearchVisitor,
)
from inspirehep.search.query_parser.visitors.restructuring_visitor import (
    RestructuringVisitor,
)


def _parse_query(query_str):
    stateful_parser = StatefulParser()
    restructuring_visitor = RestructuringVisitor()
    elastic_search_visitor = ElasticSearchVisitor()
    _, parse_tree = stateful_parser.parse(query_str, parser.Query)
    parse_tree = parse_tree.accept(restructuring_visitor)
    return parse_tree.accept(elastic_search_visitor)


def test_elastic_search_visitor_find_institution_partial_value_cer():
    query_str = "affautocomplete:cer*"
    expected_es_query = {
        "query_string": {
            "query": "cer*",
            "analyze_wildcard": True,
            "fields": ["affautocomplete"],
            "default_operator": "AND",
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_author_partial_value_ellis():
    query_str = "FIN author:'ellis'"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "query_string": {
                    "analyze_wildcard": True,
                    "fields": ["authors.full_name"],
                    "query": "*ellis*",
                    "default_operator": "AND",
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_author_exact_value_ellis():
    query_str = 'Find author "ellis"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"match_phrase": {"authors.full_name": "ellis"}},
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_first_author_exact_value_ellis():
    query_str = 'Find fa "ellis"'
    expected_es_query = {
        "nested": {
            "path": "first_author",
            "query": {"match_phrase": {"first_author.full_name": "ellis"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_spires_identifier_simple_value():
    query_str = "irn 3665763"
    expected_es_query = {
        "term": {"external_system_identifiers.value.raw": "SPIRES-3665763"}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_simple_value():
    query_str = "ea Vures, John I."
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "term": {"authors.full_name_unicode_normalized": "vures, john i."}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_simple_value_diacritics():
    query_str = "ea Vurës, John I"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "term": {"authors.full_name_unicode_normalized": "vur\xebs, john i."}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_partial_value():
    query_str = "ea 'Vures, John I.'"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "term": {"authors.full_name_unicode_normalized": "vures, john i."}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_partial_value_diacritics():
    query_str = "ea 'Vurës, John I'"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "term": {"authors.full_name_unicode_normalized": "vur\xebs, john i."}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_exact_value():
    query_str = 'ea "Vures, John I."'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "term": {"authors.full_name_unicode_normalized": "vures, john i."}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_exact_value_diacritics():
    query_str = 'ea "Vurës, John I"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "term": {"authors.full_name_unicode_normalized": "vur\xebs, john i."}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_with_bai_simple_value_ellis():
    query_str = "ea J.Ellis.4"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"term": {"authors.ids.value.search": "j.ellis.4"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_with_bai_simple_lowercase():
    query_str = "ea j.ellis.4"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"term": {"authors.ids.value.search": "j.ellis.4"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_with_bai_exact_value_ellis():
    query_str = 'ea "J.Ellis.4"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"term": {"authors.ids.value.search": "j.ellis.4"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_exact_author_with_bai_partial_value_ellis():
    query_str = "ea 'J.Ellis.4'"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"term": {"authors.ids.value.search": "j.ellis.4"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_journal_title_simple_value():
    query_str = "j Phys.Lett.B"
    expected_es_query = {"match": {"journal_title_variants": "Phys.Lett.B"}}
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_journal_title_and_new_style_vol_simple_value():
    query_str = "j Phys.Lett.B,351"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"journal_title_variants": "Phys.Lett.B"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {"match": {"publication_info.journal_volume": "351"}},
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_journal_title_and_old_style_vol_simple_value():
    query_str = "j Phys.Lett.,B351"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"journal_title_variants": "Phys.Lett.B"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {"match": {"publication_info.journal_volume": "351"}},
                    }
                },
            ]
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_journal_title_and_vol_and_artid_or_start_page_simple_value():  # noqa E501
    query_str = "j Phys.Lett.B,351,123"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"journal_title_variants": "Phys.Lett.B"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match": {
                                            "publication_info.journal_volume": "351"
                                        }
                                    },
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "match": {
                                                        "publication_info.page_start": (
                                                            "123"
                                                        )
                                                    }
                                                },
                                                {
                                                    "match": {
                                                        "publication_info.artid": "123"
                                                    }
                                                },
                                            ]
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

    generated_es_query = _parse_query(query_str)
    assert ordered(generated_es_query) == ordered(expected_es_query)


def test_elastic_search_visitor_exact_journal_query_is_the_same_as_simple_value():
    simple_value_query_str = "j Phys.Lett.B,351,123"
    exact_value_query_str = 'j "Phys.Lett.B,351,123"'

    generated_simple_value_es_query = _parse_query(simple_value_query_str)
    generated_exact_value_es_query = _parse_query(exact_value_query_str)

    assert ordered(generated_simple_value_es_query) == ordered(
        generated_exact_value_es_query
    )


def test_elastic_search_visitor_partial_journal_query_is_the_same_as_simple_value():
    simple_value_query_str = "j Phys.Lett.B,351,123"
    partial_value_query_str = "j 'Phys.Lett.B,351,123'"

    generated_simple_value_es_query = _parse_query(simple_value_query_str)
    generated_partial_value_es_query = _parse_query(partial_value_query_str)

    assert ordered(generated_simple_value_es_query) == ordered(
        generated_partial_value_es_query
    )


def test_elastic_search_visitor_and_op_query():
    query_str = "subject: astrophysics and title:boson"

    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "titles.full_title": {
                            "query": "boson",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_or_op_query():
    query_str = "subject: astrophysics or title boson"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "titles.full_title": {
                            "query": "boson",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_unknown_keyword_simple_value():
    query_str = "unknown_keyword:bar"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "unknown_keyword": {
                            "query": "bar",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": "unknown_keyword:bar",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_unknown_keyword_simple_value_maybe_texkey():
    query_str = "smith:2009xj"
    expected_es_query = {"match": {"texkeys.raw": "smith:2009xj"}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_dotted_keyword_simple_value():
    query_str = "dotted.keyword:bar"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "dotted.keyword": {
                            "query": "bar",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": "dotted.keyword:bar",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_value_query():
    query_str = "foo bar"
    expected_es_query = {
        "match": {
            "_all": {
                "query": "foo bar",
                "operator": "and",
            }
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_keyword_query_and_value_query():
    query_str = "topcite 2+ and skands"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "range": {
                        "citation_count": {
                            "gte": "2",
                        }
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": "skands",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_keyword_query_and_partial_value_query():
    query_str = "topcite 2+ and 'skands'"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "range": {
                        "citation_count": {
                            "gte": "2",
                        }
                    }
                },
                {
                    "query_string": {
                        "analyze_wildcard": True,
                        "default_field": "_all",
                        "query": "*skands*",
                        "default_operator": "AND",
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_keyword_query_and_exact_value_query():
    query_str = 'topcite 2+ and "skands"'
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "range": {
                        "citation_count": {
                            "gte": "2",
                        }
                    }
                },
                {
                    "match_phrase": {
                        "_all": "skands",
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_range_op():
    query_str = "d 2015->2017 and cited:1->9"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "bool": {
                        "should": [
                            {
                                "range": {
                                    "earliest_date": {
                                        "gte": "2015||/y",
                                        "lte": "2017||/y",
                                    }
                                }
                            },
                            {
                                "range": {
                                    "imprints.date": {
                                        "gte": "2015||/y",
                                        "lte": "2017||/y",
                                    }
                                }
                            },
                            {
                                "range": {
                                    "preprint_date": {
                                        "gte": "2015||/y",
                                        "lte": "2017||/y",
                                    }
                                }
                            },
                            {
                                "nested": {
                                    "path": "publication_info",
                                    "query": {
                                        "range": {
                                            "publication_info.year": {
                                                "gte": "2015||/y",
                                                "lte": "2017||/y",
                                            }
                                        }
                                    },
                                }
                            },
                            {
                                "range": {
                                    "thesis_info.date": {
                                        "gte": "2015||/y",
                                        "lte": "2017||/y",
                                    }
                                }
                            },
                        ]
                    }
                },
                {"range": {"citation_count": {"gte": "1", "lte": "9"}}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_not_op():
    query_str = "-subject astrophysics"
    expected_es_query = {
        "bool": {
            "must_not": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                }
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_gte_and_lt_op():
    query_str = "cited 50+ and cited < 100"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "range": {
                        "citation_count": {
                            "gte": "50",
                        }
                    }
                },
                {"range": {"citation_count": {"lt": "100"}}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_regex_value():
    query_str = "author /^xi$/"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"regexp": {"authors.full_name": "^xi$"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_wildcard_support():
    query_str = "a *alge | a 'alge*' | a \"o*aigh\""
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "query_string": {
                                "query": "*alge",
                                "fields": ["authors.full_name"],
                                "analyze_wildcard": True,
                                "default_operator": "AND",
                            }
                        },
                    }
                },
                {
                    "bool": {
                        "should": [
                            {
                                "nested": {
                                    "path": "authors",
                                    "query": {
                                        "query_string": {
                                            "query": "*alge*",
                                            "fields": ["authors.full_name"],
                                            "analyze_wildcard": True,
                                            "default_operator": "AND",
                                        }
                                    },
                                }
                            },
                            {
                                "nested": {
                                    "path": "authors",
                                    "query": {
                                        "match_phrase": {"authors.full_name": "o*aigh"}
                                    },
                                }
                            },
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_wildcard_journal_search():
    query_str = "j Phys.Rev.*"
    expected_query = {
        "nested": {
            "path": "publication_info",
            "query": {
                "query_string": {
                    "query": "Phys.Rev.*",
                    "fields": [
                        "publication_info.journal_title",
                        "publication_info.journal_volume",
                        "publication_info.page_start",
                        "publication_info.artid",
                    ],
                    "default_operator": "AND",
                    "analyze_wildcard": True,
                }
            },
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_query


def test_elastic_search_visitor_first_author_wildcard_support():
    query_str = "fa *alge | fa 'alge*' | fa \"o*aigh\""
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "nested": {
                        "path": "first_author",
                        "query": {
                            "query_string": {
                                "query": "*alge",
                                "fields": ["first_author.full_name"],
                                "analyze_wildcard": True,
                                "default_operator": "AND",
                            }
                        },
                    }
                },
                {
                    "bool": {
                        "should": [
                            {
                                "nested": {
                                    "path": "first_author",
                                    "query": {
                                        "query_string": {
                                            "query": "*alge*",
                                            "fields": ["first_author.full_name"],
                                            "analyze_wildcard": True,
                                            "default_operator": "AND",
                                        }
                                    },
                                }
                            },
                            {
                                "nested": {
                                    "path": "first_author",
                                    "query": {
                                        "match_phrase": {
                                            "first_author.full_name": "o*aigh"
                                        }
                                    },
                                }
                            },
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_empty_query():
    query_str = "   "
    expected_es_query = {"match_all": {}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_malformed_query():
    query_str = "t: and t: electroweak"
    expected_es_query = {
        "simple_query_string": {"fields": ["_all"], "query": "t and t electroweak"}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


@mock.patch(
    "inspirehep.search.query_parser.visitors.elastic_search_visitor.DEFAULT_ES_OPERATOR_FOR_MALFORMED_QUERIES",
    ES_MUST_QUERY,
)
def test_elastic_search_visitor_with_query_with_malformed_part_and_default_malformed_query_op_as_must():  # noqa E501
    query_str = "subject astrophysics and: author:"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {"simple_query_string": {"fields": ["_all"], "query": "and author"}},
            ],
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


@mock.patch(
    "inspirehep.search.query_parser.visitors.elastic_search_visitor.DEFAULT_ES_OPERATOR_FOR_MALFORMED_QUERIES",
    ES_SHOULD_QUERY,
)
def test_elastic_search_visitor_with_query_with_malformed_part_and_default_malformed_query_op_as_should():  # noqa E501
    query_str = "subject astrophysics and author:"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                }
            ],
            "should": [
                {"simple_query_string": {"fields": ["_all"], "query": "and author"}}
            ],
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_simple_value_handles_only_year_fields():  # noqa E501
    query_str = "date 2000-10"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2000||/y",
                                    "lt": "2001||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_simple_value_handles_rollover_year():  # noqa E501
    query_str = "date 2017-12"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2017-12||/M", "lt": "2018-01||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2017-12||/M", "lt": "2018-01||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2017-12||/M", "lt": "2018-01||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2017||/y",
                                    "lt": "2018||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2017-12||/M", "lt": "2018-01||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_simple_value_handles_rollover_month():  # noqa E501
    query_str = "date 2017-10-31"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {
                            "gte": "2017-10-31||/d",
                            "lt": "2017-11-01||/d",
                        }
                    }
                },
                {
                    "range": {
                        "imprints.date": {
                            "gte": "2017-10-31||/d",
                            "lt": "2017-11-01||/d",
                        }
                    }
                },
                {
                    "range": {
                        "preprint_date": {
                            "gte": "2017-10-31||/d",
                            "lt": "2017-11-01||/d",
                        }
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2017||/y",
                                    "lt": "2018||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {
                            "gte": "2017-10-31||/d",
                            "lt": "2017-11-01||/d",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_wildcard_value_suffix_in_day():  # noqa E501
    query_str = "date 2000-10-*"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2000||/y",
                                    "lt": "2001||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_wildcard_value_suffix_in_month():  # noqa E501
    query_str = "date 2015-*"
    expected_es_query = {
        "bool": {
            "should": [
                {"range": {"earliest_date": {"gte": "2015||/y", "lt": "2016||/y"}}},
                {"range": {"imprints.date": {"gte": "2015||/y", "lt": "2016||/y"}}},
                {"range": {"preprint_date": {"gte": "2015||/y", "lt": "2016||/y"}}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2015||/y",
                                    "lt": "2016||/y",
                                }
                            }
                        },
                    }
                },
                {"range": {"thesis_info.date": {"gte": "2015||/y", "lt": "2016||/y"}}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_wildcard_value_suffix_as_month_part():  # noqa E501
    query_str = "date 2015-1*"
    expected_es_query = {
        "bool": {
            "should": [
                {"range": {"earliest_date": {"gte": "2015||/y", "lt": "2016||/y"}}},
                {"range": {"imprints.date": {"gte": "2015||/y", "lt": "2016||/y"}}},
                {"range": {"preprint_date": {"gte": "2015||/y", "lt": "2016||/y"}}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2015||/y",
                                    "lt": "2016||/y",
                                }
                            }
                        },
                    }
                },
                {"range": {"thesis_info.date": {"gte": "2015||/y", "lt": "2016||/y"}}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_one_query_date_multi_field_and_wildcard_infix_generates_to_all_field():  # noqa E501
    query_str = "date: 2017-*-12"
    expected_es_query = {
        "multi_match": {
            "fields": ["_all"],
            "query": "date 2017-*-12",
            "zero_terms_query": "all",
        }
    }

    generated_es_query = parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_two_queries_date_multi_field_and_wildcard_infix_drops_date():  # noqa E501
    query_str = "date: 2017-*-12 and title collider"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "titles.full_title": {
                            "query": "collider",
                            "operator": "and",
                        }
                    }
                }
            ]
        }
    }

    generated_es_query = parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_wildcard_value_suffix_in_year_drops_date_query():  # noqa E501
    query_str = "date 201* and title collider"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "titles.full_title": {
                            "query": "collider",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_wildcard_value_suffix_in_month_drops_date_query():  # noqa E501
    query_str = "date 2000-*-01 and title collider"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "titles.full_title": {
                            "query": "collider",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_exact_match_value():
    query_str = 'date "2000-10"'
    expected_es_query = {
        "bool": {
            "should": [
                {"term": {"earliest_date": "2000-10"}},
                {"term": {"imprints.date": "2000-10"}},
                {"term": {"preprint_date": "2000-10"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {"term": {"publication_info.year": "2000"}},
                    }
                },
                {"term": {"thesis_info.date": "2000-10"}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_partial_value():
    query_str = "date '2000-10'"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2000||/y",
                                    "lt": "2001||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_partial_value_with_wildcard():
    query_str = "date '2000-10-*'"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2000||/y",
                                    "lt": "2001||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2000-10||/M", "lt": "2000-11||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_range_op():
    query_str = "date 2000-01->2001-01"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2000-01||/M", "lte": "2001-01||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2000-01||/M", "lte": "2001-01||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2000-01||/M", "lte": "2001-01||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2000||/y",
                                    "lte": "2001||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2000-01||/M", "lte": "2001-01||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_range_within_same_year():
    # This kind of query works fine (regarding the ``publication_info.year``),
    # since the range operator is including its bounds,
    # otherwise we would get no records.
    query_str = "date 2000-01->2000-04"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "range": {
                        "earliest_date": {"gte": "2000-01||/M", "lte": "2000-04||/M"}
                    }
                },
                {
                    "range": {
                        "imprints.date": {"gte": "2000-01||/M", "lte": "2000-04||/M"}
                    }
                },
                {
                    "range": {
                        "preprint_date": {"gte": "2000-01||/M", "lte": "2000-04||/M"}
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "range": {
                                "publication_info.year": {
                                    "gte": "2000||/y",
                                    "lte": "2000||/y",
                                }
                            }
                        },
                    }
                },
                {
                    "range": {
                        "thesis_info.date": {"gte": "2000-01||/M", "lte": "2000-04||/M"}
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_multi_match_when_es_field_is_a_list_and_gt_op():
    query_str = "subject astrophysics and date > 2015"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {
                    "bool": {
                        "should": [
                            {"range": {"earliest_date": {"gt": "2015||/y"}}},
                            {"range": {"imprints.date": {"gt": "2015||/y"}}},
                            {"range": {"preprint_date": {"gt": "2015||/y"}}},
                            {
                                "nested": {
                                    "path": "publication_info",
                                    "query": {
                                        "range": {
                                            "publication_info.year": {"gt": "2015||/y"}
                                        }
                                    },
                                }
                            },
                            {"range": {"thesis_info.date": {"gt": "2015||/y"}}},
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_multi_match_when_es_field_is_a_list_and_gte_op():
    query_str = "subject astrophysics and date 2015+"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {
                    "bool": {
                        "should": [
                            {"range": {"earliest_date": {"gte": "2015||/y"}}},
                            {"range": {"imprints.date": {"gte": "2015||/y"}}},
                            {"range": {"preprint_date": {"gte": "2015||/y"}}},
                            {
                                "nested": {
                                    "path": "publication_info",
                                    "query": {
                                        "range": {
                                            "publication_info.year": {"gte": "2015||/y"}
                                        }
                                    },
                                }
                            },
                            {"range": {"thesis_info.date": {"gte": "2015||/y"}}},
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_lt_op():
    query_str = "subject astrophysics and date < 2015-08"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {
                    "bool": {
                        "should": [
                            {"range": {"earliest_date": {"lt": "2015-08||/M"}}},
                            {"range": {"imprints.date": {"lt": "2015-08||/M"}}},
                            {"range": {"preprint_date": {"lt": "2015-08||/M"}}},
                            {
                                "nested": {
                                    "path": "publication_info",
                                    "query": {
                                        "range": {
                                            "publication_info.year": {"lt": "2015||/y"}
                                        }
                                    },
                                }
                            },
                            {"range": {"thesis_info.date": {"lt": "2015-08||/M"}}},
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_multi_field_and_lte_op():
    query_str = "subject astrophysics and date 2015-08-30-"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                },
                {
                    "bool": {
                        "should": [
                            {"range": {"earliest_date": {"lte": "2015-08-30||/d"}}},
                            {"range": {"imprints.date": {"lte": "2015-08-30||/d"}}},
                            {"range": {"preprint_date": {"lte": "2015-08-30||/d"}}},
                            {
                                "nested": {
                                    "path": "publication_info",
                                    "query": {
                                        "range": {
                                            "publication_info.year": {"lte": "2015||/y"}
                                        }
                                    },
                                }
                            },
                            {"range": {"thesis_info.date": {"lte": "2015-08-30||/d"}}},
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_malformed_drops_boolean_query_2nd_part():
    query_str = "subject astrophysics and date > 2015_08"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "facet_inspire_categories": {
                            "query": "astrophysics",
                            "operator": "and",
                        }
                    }
                }
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_date_malformed_drops_boolean_query_both_parts():
    query_str = "date > 2015_08 and date < 2016_10"
    expected_es_query = {}  # Equivalent to match_all query.

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_drops_empty_body_boolean_queries():
    query_str = "date > 2015_08 and date < 2016_10 and subject astrophysics"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "facet_inspire_categories": {
                                        "query": "astrophysics",
                                        "operator": "and",
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_handles_bai_simple_value():
    query_str = "a A.Einstein.1"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"match": {"authors.ids.value.search": "A.Einstein.1"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_handles_first_author_bai_simple_value():
    query_str = "fa A.Einstein.1"
    expected_es_query = {
        "nested": {
            "path": "first_author",
            "query": {"match": {"first_author.ids.value.search": "A.Einstein.1"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_handles_bai_exact_value():
    query_str = 'a "A.Einstein.1"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"match_phrase": {"authors.ids.value.raw": "A.Einstein.1"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_handles_first_author_bai_exact_value():
    query_str = 'fa "A.Einstein.1"'
    expected_es_query = {
        "nested": {
            "path": "first_author",
            "query": {"match_phrase": {"first_author.ids.value.raw": "A.Einstein.1"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_handles_partial_match_value_with_bai_value_and_partial_bai_value():  # noqa E501
    query_str = "a 'A.Einstein.1' and a 'S.Mele'"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "query_string": {
                                "analyze_wildcard": True,
                                "fields": ["authors.ids.value.search"],
                                "query": "*A.Einstein.1*",
                                "default_operator": "AND",
                            }
                        },
                    }
                },
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "query_string": {
                                "analyze_wildcard": True,
                                "fields": [
                                    "authors.ids.value.search",
                                    "authors.full_name",
                                ],
                                "query": "*S.Mele*",
                                "default_operator": "AND",
                            }
                        },
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_handles_wildcard_simple_and_partial_bai_like_queries():
    query_str = "a S.Mele* and a 'S.Mel*'"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "query_string": {
                                "query": "S.Mele*",
                                "fields": [
                                    "authors.ids.value.search",
                                    "authors.full_name",
                                ],
                                "analyze_wildcard": True,
                                "default_operator": "AND",
                            }
                        },
                    }
                },
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "query_string": {
                                "query": "*S.Mel*",
                                "fields": [
                                    "authors.ids.value.search",
                                    "authors.full_name",
                                ],
                                "analyze_wildcard": True,
                                "default_operator": "AND",
                            }
                        },
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_queries_also_bai_field_with_wildcard_if_author_name_contains_dot_and_no_spaces():  # noqa E501
    query_str = "a S.Mele"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "query_string": {
                    "analyze_wildcard": True,
                    "fields": ["authors.ids.value.search", "authors.full_name"],
                    "query": "*S.Mele*",
                    "default_operator": "AND",
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_queries_also_bai_field_with_wildcard_if_first_author_name_contains_dot_and_no_spaces():  # noqa E501
    query_str = "fa S.Mele"
    expected_es_query = {
        "nested": {
            "path": "first_author",
            "query": {
                "query_string": {
                    "query": "*S.Mele*",
                    "fields": [
                        "first_author.ids.value.search",
                        "first_author.full_name",
                    ],
                    "analyze_wildcard": True,
                    "default_operator": "AND",
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_queries_does_not_query_bai_field_if_name_contains_comma_and_dot():  # noqa E501
    query_str = "a gava,e."

    generated_es_query = _parse_query(query_str)
    assert ElasticSearchVisitor.AUTHORS_BAI_FIELD not in str(generated_es_query)


def test_elastic_search_visitor_fa_queries_does_not_query_bai_field_if_name_contains_comma_and_dot():  # noqa E501
    query_str = "fa gava,e."

    generated_es_query = _parse_query(query_str)
    assert ElasticSearchVisitor.KEYWORD_TO_ES_FIELDNAME["first_author_bai"] not in str(
        generated_es_query
    )


def test_elastic_search_visitor_queries_does_not_query_bai_field_if_name_contains_trailing_dot():  # noqa E501
    query_str = "a mele."

    generated_es_query = _parse_query(query_str)
    assert ElasticSearchVisitor.AUTHORS_BAI_FIELD not in str(generated_es_query)


def test_elastic_search_visitor_fa_queries_does_not_query_bai_field_if_name_contains_trailing_dot():  # noqa E501
    query_str = "fa mele."

    generated_es_query = _parse_query(query_str)
    assert ElasticSearchVisitor.KEYWORD_TO_ES_FIELDNAME["first_author_bai"] not in str(
        generated_es_query
    )


def test_elastic_search_visitor_queries_does_not_query_bai_field_if_name_contains_prefix_dot():  # noqa E501
    query_str = "a .mele"

    generated_es_query = _parse_query(query_str)
    assert ElasticSearchVisitor.AUTHORS_BAI_FIELD not in str(generated_es_query)


def test_elastic_search_visitor_fa_queries_does_not_query_bai_field_if_name_contains_prefix_dot():  # noqa E501
    query_str = "fa .mele"

    generated_es_query = _parse_query(query_str)
    assert ElasticSearchVisitor.KEYWORD_TO_ES_FIELDNAME["first_author_bai"] not in str(
        generated_es_query
    )


def test_elastic_search_visitor_does_not_query_bai_field_if_name_contains_dot_and_spaces():  # noqa E501
    query_str = "a S. Mele"
    bai_field = "authors.ids.value.search"

    generated_es_query = _parse_query(query_str)
    assert bai_field not in str(generated_es_query)


def test_elastic_search_visitor_does_not_query_bai_field_if_fa_name_contains_dot_and_spaces():  # noqa E501
    query_str = "fa S. Mele"
    bai_field = "first_author.ids.value.search"

    generated_es_query = _parse_query(query_str)
    assert bai_field not in str(generated_es_query)


def test_elastic_search_visitor_with_simple_title():
    query_str = "t string theory"
    expected_es_query = {
        "match": {"titles.full_title": {"query": "string theory", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_word_and_symbol():
    # Symbol being the "n-body".
    query_str = "t n-body separable"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "titles.full_title": {
                            "query": "n-body separable",
                            "operator": "and",
                        }
                    }
                },
                {"match": {"titles.full_title.search": "n-body"}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_word_and_two_symbols():
    # Symbol being the "n-body".
    query_str = "t n-body two-body separable"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "titles.full_title": {
                            "query": "n-body two-body separable",
                            "operator": "and",
                        }
                    }
                },
                {
                    "bool": {
                        "must": [
                            {"match": {"titles.full_title.search": "n-body"}},
                            {"match": {"titles.full_title.search": "two-body"}},
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_with_word_and_symbol_containing_unicode_characters():
    # Symbol being the "n-body".
    query_str = "t γ-radiation separable"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "titles.full_title": {
                            "query": "γ-radiation separable",
                            "operator": "and",
                        }
                    }
                },
                {"match": {"titles.full_title.search": "γ-radiation"}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_known_value_mapping_and_query_document_type():  # noqa E501
    query_str = "tc c"
    expected_es_query = {
        "match": {"document_type": {"query": "conference paper", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_known_value_mapping_and_query_publication_type():  # noqa E501
    query_str = "tc i"
    expected_es_query = {
        "match": {"publication_type": {"query": "introductory", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_known_value_mapping_and_query_core():
    query_str = "tc core"
    expected_es_query = {"match": {"core": True}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_known_value_mapping_and_query_refereed():
    query_str = "tc p"
    expected_es_query = {"match": {"refereed": True}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_unknown_value_searches_both_document_and_publication_type_fields():  # noqa E501
    query_str = "tc note"
    expected_es_query = {
        "bool": {
            "minimum_should_match": 1,
            "should": [
                {"match": {"document_type": {"query": "note", "operator": "and"}}},
                {"match": {"publication_type": {"query": "note", "operator": "and"}}},
            ],
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_known_exact_value_mapping_and_query_refereed():  # noqa E501
    query_str = 'tc "p"'
    expected_es_query = {"match": {"refereed": True}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_with_known_partial_value_mapping_and_query_refereed():  # noqa E501
    query_str = "tc 'p'"
    expected_es_query = {"match": {"refereed": True}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_nested_author_fields_query():
    query_str = "authors.affiliations.value:CERN"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "match": {
                    "authors.affiliations.value": {"operator": "and", "query": "CERN"}
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_nested_publication_info_fields_query():
    query_str = "journal_title_variants:JHEP"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "journal_title_variants": {"query": "JHEP", "operator": "and"}
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": "journal_title_variants:JHEP",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_nested_refersto_recid_nested_keyword_query():
    query_str = "refersto:recid:123456"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"references.record.$ref": "123456"}},
                {"match": {"_collections": "Literature"}},
            ],
            "must_not": [
                {"match": {"related_records.relation": "successor"}},
                {"match": {"control_number": "123456"}},
            ],
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_nested_refersto_author_nested_keyword_query():
    query_str = "refersto a Jean.L.Picard.1"
    expected_es_query = {"match": {"referenced_authors_bais": "Jean.L.Picard.1"}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_affiliation_query():
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "match": {
                    "authors.affiliations.value": {"operator": "and", "query": "CERN"}
                }
            },
        }
    }

    queries = ["af:CERN", "aff:CERN", "affil:CERN", "affiliation:CERN"]
    for query in queries:
        generated_es_query = _parse_query(query)
        assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_case_insensitive():
    query_str = "collection ConferencePaper"
    expected_es_query = {
        "match": {"document_type": {"query": "conference paper", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_book():
    query_str = "collection book"
    expected_es_query = {
        "match": {"document_type": {"query": "book", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_conference_paper():
    query_str = "collection conferencepaper"
    expected_es_query = {
        "match": {"document_type": {"query": "conference paper", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_citeable():
    query_str = "collection citeable"
    expected_es_query = {"match": {"citeable": True}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_introductory():
    query_str = "collection introductory"
    expected_es_query = {
        "match": {"publication_type": {"query": "introductory", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_lectures():
    query_str = "collection lectures"
    expected_es_query = {
        "match": {"publication_type": {"query": "lectures", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_published():
    query_str = "collection published"
    expected_es_query = {"match": {"refereed": True}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_review():
    query_str = "collection review"
    expected_es_query = {
        "match": {"publication_type": {"query": "review", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_thesis():
    query_str = "collection thesis"
    expected_es_query = {
        "match": {"document_type": {"query": "thesis", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_type_code_legacy_compatible_proceedings():
    query_str = "collection proceedings"
    expected_es_query = {
        "match": {"document_type": {"query": "proceedings", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_PDG_keyword():
    query_str = 'keyword "S044:DESIG=1"'
    expected_es_query = {
        "match_phrase": {
            "keywords.value": "S044:DESIG=1",
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_PDG_keyword_with_dot_character():
    query_str = 'keyword "S044.a"'
    expected_es_query = {
        "match_phrase": {
            "keywords.value": "S044.a",
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_PDG_keyword_with_dot_digit():
    query_str = 'keyword "S044.4"'
    expected_es_query = {
        "match_phrase": {
            "keywords.value": "S044.4",
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_PDG_keyword_with_dot_character_no_quotes():
    query_str = "keyword:S044.a"
    expected_es_query = {
        "match": {"keywords.value": {"query": "S044.a", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_PDG_keyword_with_dot_digit_no_quotes():
    query_str = "keyword:S044.4"
    expected_es_query = {
        "match": {"keywords.value": {"query": "S044.4", "operator": "and"}}
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_nested_query_author_exact_match_affiliation():
    query_string = 'aff "Warsaw U. of Tech."'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "match_phrase": {"authors.affiliations.value": "Warsaw U. of Tech."}
            },
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_nested_query_regex_match_affiliation():
    query_string = "aff /^Warsaw U\.$/"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"regexp": {"authors.affiliations.value": "^Warsaw U\.$"}},
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_nested_query_partial_match_affiliation():
    query_string = "aff 'Warsaw U'"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "query_string": {
                    "query": "*Warsaw U*",
                    "fields": ["authors.affiliations.value"],
                    "analyze_wildcard": True,
                    "default_operator": "AND",
                }
            },
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_partial_author_match_and_exact_affiliation_match():
    query_string = "author:'Jan' and aff \"Warsaw U. of Tech.\""

    expected_es_query = {
        "bool": {
            "must": [
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "query_string": {
                                "analyze_wildcard": True,
                                "fields": ["authors.full_name"],
                                "query": "*Jan*",
                                "default_operator": "AND",
                            }
                        },
                    }
                },
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "match_phrase": {
                                "authors.affiliations.value": "Warsaw U. of Tech."
                            }
                        },
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_nested_query_partial_raw_affiliation():
    query_string = 'authors.raw_affiliations:"University of Warsaw"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "match_phrase": {"authors.raw_affiliations": "University of Warsaw"}
            },
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_nested_query_exact_last_name():
    query_string = 'authors.last_name:"Kowal"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"match_phrase": {"authors.last_name": "Kowal"}},
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_find_journal_with_year():
    query_str = "j jhep,0903,112"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"journal_title_variants": "jhep"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match": {
                                            "publication_info.journal_volume": "03"
                                        }
                                    },
                                    {"match": {"publication_info.year": 2009}},
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "match": {
                                                        "publication_info.page_start": (
                                                            "112"
                                                        )
                                                    }
                                                },
                                                {
                                                    "match": {
                                                        "publication_info.artid": "112"
                                                    }
                                                },
                                            ]
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

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_regression_wildcard_query_with_dot():
    query_string = "references.reference.dois:10.7483/OPENDATA.CMS*"
    expected_es_query = {
        "query_string": {
            "query": "10.7483\\/OPENDATA.CMS*",
            "fields": ["references.reference.dois"],
            "analyze_wildcard": True,
            "default_operator": "AND",
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_regression_query_with_multiple_dots():
    query_string = "references.reference.dois:10.7483/OPENDATA.CMS.ATLAS"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "references.reference.dois": {
                            "query": "10.7483/OPENDATA.CMS.ATLAS",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": (
                                "references.reference.dois:10.7483/OPENDATA.CMS.ATLAS"
                            ),
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_affiliation_id():
    query_str = "affid 902666"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "match": {"authors.affiliations.record.$ref": "902666"}
                        },
                    }
                },
                {
                    "nested": {
                        "path": "supervisors",
                        "query": {
                            "match": {"supervisors.affiliations.record.$ref": "902666"}
                        },
                    }
                },
                {"match": {"thesis_info.institutions.record.$ref": "902666"}},
                {"match": {"record_affiliations.record.$ref": "902666"}},
            ]
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_check_texkey_doesnt_match_recid():
    query_str = "recid:1793025"
    generated_es_query = _parse_query(query_str)
    expected_es_query = {
        "bool": {
            "should": [
                {"match": {"control_number": {"query": "1793025", "operator": "and"}}},
                {
                    "match": {
                        "_all": {"query": "control_number:1793025", "operator": "and"}
                    }
                },
            ]
        }
    }

    assert generated_es_query == expected_es_query


def test_wildcard_query_works_with_slash():
    query_str = r"a S.M/ele*"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "query_string": {
                    "query": "S.M\\/ele*",
                    "fields": ["authors.ids.value.search", "authors.full_name"],
                    "analyze_wildcard": True,
                    "default_operator": "AND",
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_exact_match_query_for_names():
    query_str = 'a "Carloni Calame"'
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {"match_phrase": {"authors.full_name": "Carloni Calame"}},
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_range_date_queries_are_nested():
    query_str = "jy:2015->2018"
    expected_es_query = {
        "nested": {
            "path": "publication_info",
            "query": {
                "range": {"publication_info.year": {"gte": "2015", "lte": "2018"}}
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_date_updated_keyword_is_handled_with_range_query():
    query_str = "du 2019->2020"
    expected_es_query = {"range": {"_updated": {"gte": "2019||/y", "lte": "2020||/y"}}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_date_added_keyword_is_handled_with_range_query():
    query_str = "da 1997"
    expected_es_query = {"range": {"_created": {"gte": "1997||/y", "lt": "1998||/y"}}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_all_date_fields_are_handled_correctly_with_range_query():
    query_str = "du 2000 and date 1997"
    expected_es_query = {
        "bool": {
            "must": [
                {"range": {"_updated": {"gte": "2000||/y", "lt": "2001||/y"}}},
                {
                    "bool": {
                        "should": [
                            {
                                "range": {
                                    "earliest_date": {
                                        "gte": "1997||/y",
                                        "lt": "1998||/y",
                                    }
                                }
                            },
                            {
                                "range": {
                                    "imprints.date": {
                                        "gte": "1997||/y",
                                        "lt": "1998||/y",
                                    }
                                }
                            },
                            {
                                "range": {
                                    "preprint_date": {
                                        "gte": "1997||/y",
                                        "lt": "1998||/y",
                                    }
                                }
                            },
                            {
                                "nested": {
                                    "path": "publication_info",
                                    "query": {
                                        "range": {
                                            "publication_info.year": {
                                                "gte": "1997||/y",
                                                "lt": "1998||/y",
                                            }
                                        }
                                    },
                                }
                            },
                            {
                                "range": {
                                    "thesis_info.date": {
                                        "gte": "1997||/y",
                                        "lt": "1998||/y",
                                    }
                                }
                            },
                        ]
                    }
                },
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_wildcard_queries_are_nested_for_nested_fields():
    query_str = "journal_title_variants: journal*"
    expected_es_query = {
        "query_string": {
            "query": "journal*",
            "fields": ["journal_title_variants"],
            "default_operator": "AND",
            "analyze_wildcard": True,
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_regex_search_works_without_keyword():
    query_str = "/inve/"
    expected_es_query = {"regexp": {"_all": "inve"}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_exact_match_works_without_keyword():
    query_str = '"invenio"'
    expected_es_query = {"match_phrase": {"_all": "invenio"}}

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_partial_match_works_without_keyword():
    query_str = "'invenio'"
    expected_es_query = {
        "query_string": {
            "query": "*invenio*",
            "default_field": "_all",
            "analyze_wildcard": True,
            "default_operator": "AND",
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_exact_match_works_without_keyword_in_complex_query():
    query_str = '"invenio" something'
    expected_es_query = {
        "bool": {
            "must": [
                {"match_phrase": {"_all": "invenio"}},
                {"match": {"_all": {"query": "something", "operator": "and"}}},
            ]
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_first_author_query_with_only_last_name():
    query_str = "fa beacom"
    expected_es_query = {
        "nested": {
            "path": "first_author",
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "first_author.last_name": {
                                    "operator": "AND",
                                    "query": "Beacom",
                                }
                            }
                        }
                    ]
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_first_author_query_with_full_name():
    query_str = "first-author Beacom, John F"
    expected_es_query = {
        "nested": {
            "path": "first_author",
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "first_author.last_name": {
                                    "operator": "AND",
                                    "query": "Beacom",
                                }
                            }
                        },
                        {
                            "bool": {
                                "must": [
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "match_phrase_prefix": {
                                                        "first_author.first_name": {
                                                            "analyzer": (
                                                                "names_analyzer"
                                                            ),
                                                            "query": "John",
                                                        }
                                                    }
                                                },
                                                {
                                                    "match": {
                                                        "first_author.first_name": {
                                                            "analyzer": "names_initials_analyzer",  # noqa E501
                                                            "operator": "AND",
                                                            "query": "John",
                                                        }
                                                    }
                                                },
                                            ]
                                        }
                                    },
                                    {
                                        "match": {
                                            "first_author.first_name.initials": {
                                                "analyzer": "names_initials_analyzer",
                                                "operator": "AND",
                                                "query": "F",
                                            }
                                        }
                                    },
                                ]
                            }
                        },
                    ]
                }
            },
        }
    }

    generated_es_query = _parse_query(query_str)
    assert ordered(generated_es_query) == ordered(expected_es_query)


def test_primary_arxiv_category():
    query_string = "primarch: phys-nulc"
    generated_es_query = _parse_query(query_string)
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "primary_arxiv_category": {
                            "query": "phys-nulc",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": "primary_arxiv_category:phys-nulc",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }
    assert ordered(generated_es_query) == ordered(expected_es_query)


def test_arxiv_handling():
    query_string = "eprint arXiv:1607.08327"
    expected_es_query = {
        "match": {"arxiv_eprints.value.raw": {"query": "1607.08327", "operator": "and"}}
    }
    generated_es_query = _parse_query(query_string)
    assert ordered(generated_es_query) == ordered(expected_es_query)

    query_string = "arXiv:1607.08327"
    generated_es_query = _parse_query(query_string)
    assert ordered(generated_es_query) == ordered(expected_es_query)

    query_string = "arxiv:1607.08327"
    generated_es_query = _parse_query(query_string)
    assert ordered(generated_es_query) == ordered(expected_es_query)


def test_eprint_as_invenio_keyword_handling():
    query_string = "eprint: arxiv:1607.08327"
    expected_es_query = {
        "match": {"arxiv_eprints.value.raw": {"query": "1607.08327", "operator": "and"}}
    }
    generated_es_query = _parse_query(query_string)
    assert ordered(generated_es_query) == ordered(expected_es_query)


def test_arxiv_categories():
    query_string = "arxiv_eprints.categories:hep-th"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "match": {
                        "arxiv_eprints.categories": {
                            "query": "hep-th",
                            "operator": "and",
                        }
                    }
                },
                {
                    "match": {
                        "_all": {
                            "query": "arxiv_eprints.categories:hep-th",
                            "operator": "and",
                        }
                    }
                },
            ]
        }
    }
    generated_es_query = _parse_query(query_string)
    assert ordered(generated_es_query) == ordered(expected_es_query)


def test_query_string_query_with_wildcard_should_use_and_operator():
    query_string = "t cosmic rays*"
    expected_es_query = {
        "query_string": {
            "analyze_wildcard": True,
            "fields": ["titles.full_title"],
            "query": "cosmic rays*",
            "default_operator": "AND",
        }
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_query_string_authors_query_with_wildcard_should_use_and_operator():
    query_string = "a mich*"
    expected_es_query = {
        "nested": {
            "path": "authors",
            "query": {
                "query_string": {
                    "analyze_wildcard": True,
                    "fields": ["authors.full_name"],
                    "query": "mich*",
                    "default_operator": "AND",
                }
            },
        }
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_partial_match_query_regression():
    query_str = "urls.value:*lss.fnal.gov*"
    expected_es_query = {
        "query_string": {
            "query": "*lss.fnal.gov*",
            "fields": ["urls.value"],
            "default_operator": "AND",
            "analyze_wildcard": True,
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_regression_date_added_keyword():
    query_string = "da Silva"
    expected_es_query = {"match": {"_all": {"query": "da Silva", "operator": "and"}}}
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_regression_date_edited_keyword():
    query_string = "de Silva"
    expected_es_query = {"match": {"_all": {"query": "de Silva", "operator": "and"}}}
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_regression_date_added_in_bool_query():
    query_string = "da Silva and du > 2010"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"_all": {"query": "da Silva", "operator": "and"}}},
                {"range": {"_updated": {"gt": "2010||/y"}}},
            ]
        }
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_regression_date_added_name_as_month_name():
    query_string = "da may"
    expected_es_query = {"match": {"_all": {"query": "da may", "operator": "and"}}}
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_regression_date_edited_name_as_month_name():
    query_string = "de augusto"
    expected_es_query = {"match": {"_all": {"query": "de augusto", "operator": "and"}}}
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_date_edited_with_date_with_month_name():
    query_string = "de august 2002"
    expected_es_query = {
        "range": {"earliest_date": {"gte": "2002-08||/M", "lt": "2002-09||/M"}}
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_regression_date_query_with_jy():
    query_string = "(jy 2020 or jy 2021)"
    expected_es_query = {
        "bool": {
            "should": [
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "match": {
                                            "publication_info.year": {
                                                "query": "2020",
                                                "operator": "and",
                                            }
                                        }
                                    },
                                    {
                                        "match": {
                                            "_all": {
                                                "query": "publication_info.year:2020",
                                                "operator": "and",
                                            }
                                        }
                                    },
                                ]
                            }
                        },
                    }
                },
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "bool": {
                                "should": [
                                    {
                                        "match": {
                                            "publication_info.year": {
                                                "query": "2021",
                                                "operator": "and",
                                            }
                                        }
                                    },
                                    {
                                        "match": {
                                            "_all": {
                                                "query": "publication_info.year:2021",
                                                "operator": "and",
                                            }
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
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == _parse_query("jy 2020 or jy 2021")
    assert generated_es_query == expected_es_query


def test_regression_date_query_with_months_as_string():
    query_string = "(da may 2020 or da july 2021)"
    expected_es_query = {
        "bool": {
            "should": [
                {"range": {"_created": {"gte": "2020-05||/M", "lt": "2020-06||/M"}}},
                {"range": {"_created": {"gte": "2021-07||/M", "lt": "2021-08||/M"}}},
            ]
        }
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == _parse_query("(da may 2020 or da july 2021)")
    assert generated_es_query == expected_es_query


def test_date_edited_is_interpreted_as_range_query():
    query_string = "de 2002"
    expected_es_query = {
        "range": {"earliest_date": {"gte": "2002||/y", "lt": "2003||/y"}}
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_journal_title_variants_regression():
    query_string = "j JHEP,0412,015"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"journal_title_variants": "JHEP"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match": {
                                            "publication_info.journal_volume": "12"
                                        }
                                    },
                                    {"match": {"publication_info.year": 2004}},
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "match": {
                                                        "publication_info.page_start": (
                                                            "015"
                                                        )
                                                    }
                                                },
                                                {
                                                    "match": {
                                                        "publication_info.artid": "015"
                                                    }
                                                },
                                            ]
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
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_journal_title_variants_regression_complex_journal_title():
    query_string = "j Phys.Lett.,B351"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"journal_title_variants": "Phys.Lett.B"}},
                {
                    "nested": {
                        "path": "publication_info",
                        "query": {"match": {"publication_info.journal_volume": "351"}},
                    }
                },
            ]
        }
    }
    generated_es_query = _parse_query(query_string)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_fulltext():
    query_str = "fulltext FCC"
    expected_es_query = {
        "match": {"documents.attachment.content": {"query": "FCC", "operator": "and"}}
    }
    generated_es_query = _parse_query(query_str)
    assert expected_es_query == generated_es_query


def test_elastic_search_visitor_fulltext_and_other_field():
    query_str = "ft something and t boson"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "documents.attachment.content": {
                            "query": "something",
                            "operator": "and",
                        }
                    }
                },
                {"match": {"titles.full_title": {"query": "boson", "operator": "and"}}},
            ]
        }
    }
    generated_es_query = _parse_query(query_str)
    assert expected_es_query == generated_es_query


def test_elastic_search_visitor_partial_match_fulltext():
    query_str = "ft 'this is a test'"
    expected_es_query = {
        "query_string": {
            "query": "*this is a test*",
            "fields": ["documents.attachment.content"],
            "default_operator": "AND",
            "analyze_wildcard": True,
        }
    }
    generated_es_query = _parse_query(query_str)
    assert expected_es_query == generated_es_query


def test_elastic_search_visitor_citedby():
    query_str = "citedby:recid:123456"
    expected_es_query = {
        "terms": {
            "self.$ref.raw": {
                "index": "records-hep",
                "id": "123456",
                "path": "references.record.$ref",
            }
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_complex_query():
    query_str = "citedby:recid:123456 and t Test"
    expected_es_query = {
        "bool": {
            "must": [
                {
                    "terms": {
                        "self.$ref.raw": {
                            "index": "records-hep",
                            "id": "123456",
                            "path": "references.record.$ref",
                        }
                    }
                },
                {"match": {"titles.full_title": {"query": "Test", "operator": "and"}}},
            ]
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_texkeys_regression():
    query_str = "texkey Chen:2014cwa"
    expected_es_query = {"match": {"texkeys.raw": "Chen:2014cwa"}}
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query


def test_elastic_search_visitor_texkeys_regression_bool_query():
    query_str = "texkey Chen:2014cwa and a Moskovic"
    expected_es_query = {
        "bool": {
            "must": [
                {"match": {"texkeys.raw": "Chen:2014cwa"}},
                {
                    "nested": {
                        "path": "authors",
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "match": {
                                            "authors.last_name": {
                                                "query": "Moskovic",
                                                "operator": "AND",
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                    }
                },
            ]
        }
    }
    generated_es_query = _parse_query(query_str)
    assert generated_es_query == expected_es_query
