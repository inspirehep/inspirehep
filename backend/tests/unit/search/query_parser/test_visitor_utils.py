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

import pytest
from helpers.query_parser import parametrize
from inspirehep.search.query_parser.utils.visitor_utils import (
    _truncate_wildcard_from_date,
    author_name_contains_fullnames,
    generate_match_query,
    generate_minimal_name_variations,
    generate_nested_query,
    wrap_queries_in_bool_clauses_if_more_than_one,
    wrap_query_in_nested_if_field_is_nested,
)


@parametrize(
    {
        "Name with full name parts": {
            "name": "mele salvatore",
            "expected_answer": True,
        },
        "Lastname only": {"name": "mele", "expected_answer": False},
        "Lastname, initial(Firstname)": {"name": "mele s", "expected_answer": False},
        "Lastname, initial(Firstname).": {"name": "mele s.", "expected_answer": False},
    }
)
def test_author_name_contains_fullnames(name, expected_answer):
    assert expected_answer == author_name_contains_fullnames(name)


def test_generate_minimal_name_variations_lastname_firstname():
    name = "Ellis, John"
    expected_variations = {
        "ellis john",
        "ellis j",
        "john ellis",
        "john e",
    }

    assert expected_variations == set(generate_minimal_name_variations(name))


def test_generate_minimal_name_variations_firstname_lastname():
    name = "John Ellis"
    expected_variations = {
        "ellis john",
        "ellis j",
        "john ellis",
        "john e",
    }

    assert expected_variations == set(generate_minimal_name_variations(name))


def test_generate_minimal_name_variations_with_dotted_initial():
    name = "Oz, Y."
    expected_variations = {
        "oz y.",
        "oz y",
        "y. oz",
    }

    result = generate_minimal_name_variations(name)

    assert len(expected_variations) == len(result)

    assert expected_variations == set(generate_minimal_name_variations(name))


def test_generate_minimal_name_variations_without_dotted_initial_doesnt_generate_same_variation():  # noqa E501
    name = "Oz, Y"
    expected_variations = {
        "oz y",
        "y oz",
    }

    result = generate_minimal_name_variations(name)

    assert len(expected_variations) == len(result)

    assert expected_variations == set(result)


def test_generate_minimal_name_variations_with_initial_strips_multiple_consecutive_whitespace():  # noqa E501
    name = "oz,y"
    expected_variations = {
        "oz y",
        "y oz",
    }

    assert expected_variations == set(generate_minimal_name_variations(name))


def test_generate_minimal_name_variations_with_lastname_lowercases():
    name = "Mele"
    expected_variations = ["mele"]

    assert expected_variations == generate_minimal_name_variations(name)


def test_generate_minimal_name_variations_with_dashed_lastname():
    name = "Caro-Estevez"
    expected_variations = ["caro estevez"]

    assert expected_variations == generate_minimal_name_variations(name)


@parametrize(
    {
        "Wildcard as whole day": {"date": "2018-01-*", "expected_date": "2018-01"},
        "Wildcard as part of the day": {
            "date": "2018-01-1*",
            "expected_date": "2018-01",
        },
        "Wildcard as whole day (space separated)": {
            "date": "2018 01 *",
            "expected_date": "2018-01",
        },
        "Wildcard as part of the day (space separated)": {
            "date": "2018 01 1*",
            "expected_date": "2018-01",
        },
        "Wildcard as whole month": {"date": "2018-*", "expected_date": "2018"},
        "Wildcard as part of the month": {"date": "2018-*", "expected_date": "2018"},
        "Wildcard as whole month (space separated)": {
            "date": "2018 *",
            "expected_date": "2018",
        },
        "Wildcard as part of the month (space separated)": {
            "date": "2018 1*",
            "expected_date": "2018",
        },
    }
)
def test_truncate_wildcard_from_date_with_wildcard(date, expected_date):
    assert _truncate_wildcard_from_date(date) == expected_date


def test_truncate_wildcard_from_date_throws_on_wildcard_in_year():
    date = "201*"
    with pytest.raises(ValueError, match="Erroneous date value:"):
        _truncate_wildcard_from_date(date)


def test_truncate_wildcard_from_date_throws_with_unsupported_separator():
    date = "2018_1*"
    with pytest.raises(ValueError, match="Erroneous date value:"):
        _truncate_wildcard_from_date(date)


def test_generate_match_query_with_bool_value():
    generated_match_query = generate_match_query("core", True, with_operator_and=True)

    expected_match_query = {"match": {"core": True}}

    assert generated_match_query == expected_match_query


def test_generate_match_query_with_operator_and():
    generated_match_query = generate_match_query(
        "author", "Ellis, John", with_operator_and=True
    )

    expected_match_query = {
        "match": {
            "author": {
                "query": "Ellis, John",
                "operator": "and",
            }
        }
    }

    assert generated_match_query == expected_match_query


def test_generate_match_query_with_operator_and_false():
    generated_match_query = generate_match_query(
        "document_type", "book", with_operator_and=False
    )

    expected_match_query = {"match": {"document_type": "book"}}

    assert generated_match_query == expected_match_query


def test_wrap_queries_in_bool_clauses_if_more_than_one_with_two_queries():
    queries = [
        {"match": {"title": "collider"}},
        {"match": {"subject": "hep"}},
    ]

    generated_bool_clause = wrap_queries_in_bool_clauses_if_more_than_one(
        queries, use_must_clause=True
    )

    expected_bool_clause = {
        "bool": {
            "must": [
                {"match": {"title": "collider"}},
                {"match": {"subject": "hep"}},
            ]
        }
    }

    assert generated_bool_clause == expected_bool_clause


def test_wrap_queries_in_bool_clauses_if_more_than_one_with_one_query_drops_bool_clause_with_flag_disabled():  # noqa E501
    queries = [
        {"match": {"title": "collider"}},
    ]

    generated_bool_clause = wrap_queries_in_bool_clauses_if_more_than_one(
        queries, use_must_clause=True
    )

    expected_bool_clause = {"match": {"title": "collider"}}

    assert generated_bool_clause == expected_bool_clause


def test_wrap_queries_in_bool_clauses_if_more_than_one_with_one_query_preserves_bool_clause_with_flag_enabled():  # noqa E501
    queries = [
        {"match": {"title": "collider"}},
    ]

    generated_bool_clause = wrap_queries_in_bool_clauses_if_more_than_one(
        queries, use_must_clause=True, preserve_bool_semantics_if_one_clause=True
    )

    expected_bool_clause = {"bool": {"must": [{"match": {"title": "collider"}}]}}

    assert generated_bool_clause == expected_bool_clause


def test_wrap_queries_in_bool_clauses_if_more_than_one_with_no_query_returns_empty_dict():  # noqa E501
    queries = []

    generated_bool_clause = wrap_queries_in_bool_clauses_if_more_than_one(
        queries, use_must_clause=True
    )

    expected_bool_clause = {}

    assert generated_bool_clause == expected_bool_clause


def test_wrap_queries_in_bool_clauses_if_more_than_one_with_one_query_generates_should_clause():  # noqa E501
    queries = [
        {"match": {"title": "collider"}},
    ]

    generated_bool_clause = wrap_queries_in_bool_clauses_if_more_than_one(
        queries, use_must_clause=False, preserve_bool_semantics_if_one_clause=True
    )

    expected_bool_clause = {
        "bool": {
            "should": [
                {"match": {"title": "collider"}},
            ]
        }
    }

    assert generated_bool_clause == expected_bool_clause


def test_generate_nested_query():
    query = {
        "bool": {
            "must": [
                {"match": {"journal.title": "Phys.Rev"}},
                {"match": {"journal.volume": "D42"}},
            ]
        }
    }
    path = "journal"

    generated_query = generate_nested_query(path, query)

    expected_query = {
        "nested": {
            "path": "journal",
            "query": {
                "bool": {
                    "must": [
                        {"match": {"journal.title": "Phys.Rev"}},
                        {"match": {"journal.volume": "D42"}},
                    ]
                }
            },
        }
    }

    assert generated_query == expected_query


def test_generate_nested_query_returns_empty_dict_on_falsy_query():
    query = {}
    path = "journal"

    generated_query = generate_nested_query(path, query)

    expected_query = {}

    assert generated_query == expected_query


def test_wrap_query_in_nested_if_field_is_nested():
    query = {"match": {"title.name": "collider"}}

    generated_query = wrap_query_in_nested_if_field_is_nested(
        query, "title.name", ["title"]
    )
    expected_query = {
        "nested": {"path": "title", "query": {"match": {"title.name": "collider"}}}
    }

    assert generated_query == expected_query

    generated_query_2 = wrap_query_in_nested_if_field_is_nested(
        query, "title.name", ["authors"]
    )

    assert generated_query_2 == query


def test_boolean_string_argument_in_query_case_insensitive():
    expected = {"match": {"citeable": "true"}}

    query = generate_match_query("citeable", "true", with_operator_and=True)
    assert expected == query

    query = generate_match_query("citeable", "True", with_operator_and=True)
    assert expected == query

    query = generate_match_query("citeable", "TRUE", with_operator_and=True)
    assert expected == query

    expected = {"match": {"citeable": "false"}}

    query = generate_match_query("citeable", "false", with_operator_and=True)
    assert expected == query

    query = generate_match_query("citeable", "False", with_operator_and=True)
    assert expected == query

    query = generate_match_query("citeable", "FALSE", with_operator_and=True)
    assert expected == query
