import pytest
from inspirehep.matcher.core import (
    _compile_authors_query,
    _compile_exact,
    _compile_fuzzy,
    _compile_nested,
    _compile_nested_prefix,
    compile,
)


def test_compile_exact():
    query = {
        "path": "arxiv_eprints.value",
        "search_path": "arxiv_eprints.value.raw",
        "type": "exact",
    }
    record = {
        "arxiv_eprints": [
            {
                "categories": [
                    "hep-th",
                ],
                "value": "hep-th/9711200",
            },
        ],
    }

    expected = {
        "query": {
            "bool": {
                "should": [
                    {
                        "match": {
                            "arxiv_eprints.value.raw": "hep-th/9711200",
                        },
                    },
                ],
            },
        },
    }
    result = _compile_exact(query, record)

    assert expected == result


def test_compile_exact_supports_non_list_fields():
    query = {
        "path": "reference.arxiv_eprint",
        "search_path": "arxiv_eprints.value.raw",
        "type": "exact",
    }
    reference = {
        "reference": {
            "arxiv_eprint": "hep-th/9711200",
        },
    }

    expected = {
        "query": {
            "bool": {
                "should": [
                    {
                        "match": {
                            "arxiv_eprints.value.raw": "hep-th/9711200",
                        },
                    },
                ],
            },
        },
    }
    result = _compile_exact(query, reference)

    assert expected == result


def test_compile_fuzzy():
    query = {
        "clauses": [
            {
                "boost": 20,
                "path": "abstracts",
            },
        ],
        "type": "fuzzy",
    }
    record = {
        "abstracts": [
            {
                "source": "arXiv",
                "value": "Probably not.",
            },
        ],
    }

    expected = {
        "min_score": 1,
        "query": {
            "dis_max": {
                "queries": [
                    {
                        "more_like_this": {
                            "boost": 20,
                            "like": [
                                {
                                    "doc": {
                                        "abstracts": [
                                            {
                                                "source": "arXiv",
                                                "value": "Probably not.",
                                            },
                                        ],
                                    },
                                },
                            ],
                            "max_query_terms": 25,
                            "min_doc_freq": 1,
                            "min_term_freq": 1,
                        },
                    },
                ],
                "tie_breaker": 0.3,
            },
        },
    }
    result = _compile_fuzzy(query, record)

    assert expected == result


def test_compile_fuzzy_supports_slicing_in_paths():
    query = {
        "clauses": [
            {
                "boost": 10,
                "path": "authors[:3]",
            },
        ],
        "type": "fuzzy",
    }
    record = {
        "authors": [
            {"full_name": "Aharony, Ofer"},
            {"full_name": "Gubser, Steven S."},
            {"full_name": "Maldacena, Juan Martin"},
            {"full_name": "Ooguri, Hirosi"},
            {"full_name": "Oz, Yaron"},
        ],
    }

    expected = {
        "min_score": 1,
        "query": {
            "dis_max": {
                "queries": [
                    {
                        "more_like_this": {
                            "boost": 10,
                            "like": [
                                {
                                    "doc": {
                                        "authors": [
                                            {"full_name": "Aharony, Ofer"},
                                            {"full_name": "Gubser, Steven S."},
                                            {"full_name": "Maldacena, Juan Martin"},
                                        ],
                                    },
                                },
                            ],
                            "max_query_terms": 25,
                            "min_doc_freq": 1,
                            "min_term_freq": 1,
                        },
                    },
                ],
                "tie_breaker": 0.3,
            },
        },
    }
    result = _compile_fuzzy(query, record)

    assert expected == result


def test_compile_fuzzy_falls_back_to_boost_1():
    query = {
        "clauses": [
            {"path": "abstracts"},
        ],
    }
    record = {
        "abstracts": [
            {
                "source": "arXiv",
                "value": "Probably not.",
            },
        ],
    }

    expected = {
        "min_score": 1,
        "query": {
            "dis_max": {
                "queries": [
                    {
                        "more_like_this": {
                            "boost": 1,
                            "like": [
                                {
                                    "doc": {
                                        "abstracts": [
                                            {
                                                "source": "arXiv",
                                                "value": "Probably not.",
                                            },
                                        ],
                                    },
                                },
                            ],
                            "max_query_terms": 25,
                            "min_doc_freq": 1,
                            "min_term_freq": 1,
                        },
                    },
                ],
                "tie_breaker": 0.3,
            },
        },
    }
    result = _compile_fuzzy(query, record)

    assert expected == result


def test_compile_fuzzy_raises_if_path_contains_a_dot():
    query = {
        "clauses": [
            {
                "boost": 10,
                "path": "authors.full_name",
            },
        ],
    }
    record = {
        "authors": [
            {"full_name": "Aharony, Ofer"},
            {"full_name": "Gubser, Steven S."},
            {"full_name": "Maldacena, Juan Martin"},
            {"full_name": "Ooguri, Hirosi"},
            {"full_name": "Oz, Yaron"},
        ],
    }

    with pytest.raises(
        ValueError, match='the "path" key can\'t contain dots'
    ) as excinfo:
        _compile_fuzzy(query, record)
    assert "dots" in str(excinfo.value)


def test_compile_nested():
    query = {
        "paths": [
            "reference.publication_info.journal_title",
            "reference.publication_info.journal_volume",
            "reference.publication_info.artid",
        ],
        "search_paths": [
            "publication_info.journal_title",
            "publication_info.journal_volume",
            "publication_info.artid",
        ],
        "type": "nested",
    }
    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys.Rev.",
                "journal_volume": "D94",
                "artid": "124054",
            },
        },
    }

    expected = {
        "query": {
            "nested": {
                "path": "publication_info",
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "publication_info.journal_title": {
                                        "query": "Phys.Rev.",
                                        "operator": "OR",
                                    }
                                },
                            },
                            {
                                "match": {
                                    "publication_info.journal_volume": {
                                        "query": "D94",
                                        "operator": "OR",
                                    }
                                },
                            },
                            {
                                "match": {
                                    "publication_info.artid": {
                                        "query": "124054",
                                        "operator": "OR",
                                    }
                                },
                            },
                        ],
                    },
                },
            },
        },
    }
    result = _compile_nested(query, reference)

    assert expected == result


def test_compile_nested_requires_all_paths_for_query():
    query = {
        "paths": [
            "reference.publication_info.journal_title",
            "reference.publication_info.journal_volume",
            "reference.publication_info.artid",
        ],
        "search_paths": [
            "publication_info.journal_title",
            "publication_info.journal_volume",
            "publication_info.artid",
        ],
    }
    reference = {
        "reference": {
            "publication_info": {
                "label": "23",
                "misc": [
                    "Strai~burger, C., this Conference",
                ],
            },
        },
    }

    assert _compile_nested(query, reference) is None


def test_compile_nested_raises_when_search_paths_dont_share_a_common_path():
    query = {
        "paths": [
            "foo.bar",
            "foo.baz",
        ],
        "search_paths": [
            "bar",
            "baz",
        ],
        "type": "nested",
    }

    with pytest.raises(
        ValueError, match="search_paths must share a common path"
    ) as excinfo:
        _compile_nested(query, None)
    assert "common path" in str(excinfo.value)


def test_compile_nested_raises_when_paths_and_search_paths_dont_have_the_same_length():
    query = {
        "paths": [
            "foo",
            "bar",
        ],
        "search_paths": ["baz"],
        "type": "nested",
    }

    with pytest.raises(
        ValueError, match="paths and search_paths must be of the same length"
    ) as excinfo:
        _compile_nested(query, None)
    assert "same length" in str(excinfo.value)


def test_compile_without_optional_args():
    query = {
        "type": "exact",
        "path": "dummy.path",
        "search_path": "dummy.search.path",
    }
    record = {
        "dummy": {
            "path": "foo",
        },
    }

    result = compile(query, record)
    expected = {
        "query": {
            "bool": {
                "must": {
                    "bool": {
                        "should": [
                            {
                                "match": {
                                    "dummy.search.path": "foo",
                                },
                            }
                        ],
                    },
                },
                "filter": {
                    "bool": {
                        "must_not": {
                            "match": {
                                "deleted": True,
                            },
                        },
                    },
                },
            },
        },
    }

    assert expected == result


def test_compile_with_match_deleted():
    query = {
        "type": "exact",
        "path": "dummy.path",
        "search_path": "dummy.search.path",
    }
    record = {
        "dummy": {
            "path": "foo",
        },
    }

    result = compile(query, record, match_deleted=True)
    expected = {
        "query": {
            "bool": {
                "should": [
                    {
                        "match": {
                            "dummy.search.path": "foo",
                        },
                    }
                ],
            },
        },
    }

    assert expected == result


def test_compile_with_collections():
    query = {
        "type": "exact",
        "path": "dummy.path",
        "search_path": "dummy.search.path",
    }
    record = {
        "dummy": {
            "path": "foo",
        },
    }

    result = compile(query, record, collections=["Literature", "HAL Hidden"])
    expected = {
        "query": {
            "bool": {
                "must": {
                    "bool": {
                        "should": [
                            {
                                "match": {
                                    "dummy.search.path": "foo",
                                },
                            }
                        ],
                    },
                },
                "filter": {
                    "bool": {
                        "should": [
                            {
                                "match": {
                                    "_collections": "Literature",
                                },
                            },
                            {
                                "match": {
                                    "_collections": "HAL Hidden",
                                },
                            },
                        ],
                        "must_not": {
                            "match": {
                                "deleted": True,
                            },
                        },
                    },
                },
            },
        },
    }

    assert expected == result


def test_compile_returns_none_if_empty_inner():
    query = {
        "type": "exact",
        "path": "dummy.path",
        "search_path": "dummy.search.path",
    }
    record = {}

    assert compile(query, record) is None


def test_compile_prefix():
    query = {
        "paths": [
            "reference.publication_info.journal_title",
            "reference.publication_info.journal_volume",
            "reference.publication_info.artid",
        ],
        "search_paths": [
            "publication_info.journal_title",
            "publication_info.journal_volume",
            "publication_info.artid",
        ],
        "prefix_search_path": "publication_info.journal_title",
    }
    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys.Rev.D.",
                "journal_volume": "94",
                "artid": "124054",
            },
        },
    }
    result = _compile_nested_prefix(query, reference)
    expected = {
        "query": {
            "nested": {
                "path": "publication_info",
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match_phrase_prefix": {
                                    "publication_info.journal_title": "Phys.Rev.D."
                                }
                            },
                            {"match": {"publication_info.journal_volume": "94"}},
                            {"match": {"publication_info.artid": "124054"}},
                        ]
                    }
                },
            }
        }
    }

    assert expected == result


def test_compile_nested_with_inner_hits():
    query = {
        "paths": [
            "first_name",
            "last_name",
        ],
        "search_paths": [
            "authors.first_name",
            "authors.last_name",
        ],
        "type": "nested",
        "inner_hits": {"_source": ["authors.full_name"]},
    }
    author_data = {"first_name": "Name", "last_name": "Test"}

    expected = {
        "query": {
            "nested": {
                "path": "authors",
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "authors.first_name": {
                                        "query": "Name",
                                        "operator": "OR",
                                    }
                                },
                            },
                            {
                                "match": {
                                    "authors.last_name": {
                                        "query": "Test",
                                        "operator": "OR",
                                    }
                                },
                            },
                        ],
                    },
                },
                "inner_hits": {"_source": ["authors.full_name"]},
            },
        },
    }

    result = _compile_nested(query, author_data)

    assert expected == result


def test_compile_authors_query():
    query = {"type": "authors-names", "inner_hits": {"_source": ["authors.full_name"]}}
    author_data = {"full_name": "Copernicus, Nicholas A.", "last_name": "Test"}

    expected = {
        "query": {
            "nested": {
                "path": "authors",
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "authors.last_name": {
                                        "query": "Copernicus",
                                        "operator": "AND",
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
                                                            "authors.first_name": {
                                                                "query": "Nicholas",
                                                                "analyzer": (
                                                                    "names_analyzer"
                                                                ),
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "match": {
                                                            "authors.first_name": {
                                                                "query": "Nicholas",
                                                                "operator": "AND",
                                                                "analyzer": (
                                                                    "names_initials_analyzer"
                                                                ),
                                                            }
                                                        }
                                                    },
                                                ]
                                            }
                                        },
                                        {
                                            "match": {
                                                "authors.first_name.initials": {
                                                    "query": "A",
                                                    "operator": "AND",
                                                    "analyzer": (
                                                        "names_initials_analyzer"
                                                    ),
                                                }
                                            }
                                        },
                                    ]
                                }
                            },
                        ]
                    }
                },
                "inner_hits": {"_source": ["authors.full_name"]},
            }
        }
    }

    result = _compile_authors_query(query, author_data)
    assert result == expected


def test_nested_query_uses_correct_path_if_only_one_search_path_provided():
    query = {
        "type": "nested",
        "paths": ["full_name"],
        "search_paths": ["authors.full_name"],
    }
    author_data = {"full_name": "John Smith"}

    expected = {
        "query": {
            "nested": {
                "path": "authors",
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "authors.full_name": {
                                        "query": "John Smith",
                                        "operator": "OR",
                                    }
                                }
                            }
                        ]
                    }
                },
            }
        }
    }
    result = _compile_nested(query, author_data)
    assert result == expected


def test_nested_query_with_and_operator():
    query = {
        "type": "nested",
        "paths": ["full_name"],
        "search_paths": ["authors.full_name"],
        "operator": "AND",
    }
    author_data = {"full_name": "John Smith"}

    expected = {
        "query": {
            "nested": {
                "path": "authors",
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "authors.full_name": {
                                        "query": "John Smith",
                                        "operator": "AND",
                                    }
                                }
                            }
                        ]
                    }
                },
            }
        }
    }
    result = _compile_nested(query, author_data)
    assert result == expected
