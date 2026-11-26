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

from inspirehep.search.query_parser.parsing_driver import parse_query


def test_driver_with_simple_query():
    query_str = "subject astrophysics"
    expected_es_query = {
        "match": {
            "facet_inspire_categories": {"query": "astrophysics", "operator": "and"}
        }
    }

    es_query = parse_query(query_str)

    assert es_query == expected_es_query


def test_driver_with_utf8_bytes():
    query = "title γ-radiation"
    assert parse_query(query.encode("utf-8")) == parse_query(query)


@mock.patch("inspirehep.search.query_parser.parsing_driver.StatefulParser")
def test_driver_with_nothing_recognized(mocked_parser):
    query_str = "unrecognized query"
    expected_es_query = {
        "multi_match": {
            "query": "unrecognized query",
            "fields": ["_all"],
            "zero_terms_query": "all",
        }
    }

    mocked_parser.return_value.parse.return_value = ("unrecognized query", None)

    es_query = parse_query(query_str)

    assert es_query == expected_es_query


@mock.patch("inspirehep.search.query_parser.parsing_driver.StatefulParser")
def test_driver_with_syntax_error(mocked_parser):
    query_str = "query with syntax error"
    expected_es_query = {
        "multi_match": {
            "query": "query with syntax error",
            "fields": ["_all"],
            "zero_terms_query": "all",
        }
    }

    mocked_parser.return_value.parse.side_effect = SyntaxError()

    es_query = parse_query(query_str)

    assert es_query == expected_es_query


@mock.patch("inspirehep.search.query_parser.parsing_driver.RestructuringVisitor")
def test_driver_with_rst_visitor_error(mocked_rst_visitor):
    query_str = "foo"
    expected_es_query = {
        "multi_match": {"query": "foo", "fields": ["_all"], "zero_terms_query": "all"}
    }
    mocked_rst_visitor.return_value.visit.side_effect = Exception(
        "Something went wrong with visit_value"
    )
    mocked_rst_visitor.__name__ = "MockedRestructuringVisitor"

    es_query = parse_query(query_str)

    assert es_query == expected_es_query


@mock.patch("inspirehep.search.query_parser.parsing_driver.ElasticSearchVisitor")
def test_driver_with_es_visitor_error(mocked_es_visitor):
    query_str = "foo"
    expected_es_query = {
        "multi_match": {"query": "foo", "fields": ["_all"], "zero_terms_query": "all"}
    }
    mocked_es_visitor.return_value.visit.side_effect = Exception(
        "Something went wrong with visit_value"
    )
    mocked_es_visitor.__name__ = "MockedElasticSearchVisitor"

    es_query = parse_query(query_str)

    assert es_query == expected_es_query


def test_driver_with_es_visitor_empty_query_generates_a_query_against_all():
    query_str = "d < 200"
    expected_es_query = {
        "multi_match": {
            "query": "d < 200",
            "fields": ["_all"],
            "zero_terms_query": "all",
        }
    }

    es_query = parse_query(query_str)

    assert es_query == expected_es_query
