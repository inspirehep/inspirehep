# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl import Search
from flask import current_app
from helpers.utils import create_record
from mock import patch

from inspirehep.search.factories.query import inspire_query_factory


@patch("inspirehep.search.factories.query.inspire_query_parser.parse_query")
def test_inspire_query_parser_is_called(mock_inspire_query_parser, inspire_app):
    query_string = "foo"
    with current_app.test_request_context():
        factory = inspire_query_factory()
        search = Search()

        factory(query_string, search)

        mock_inspire_query_parser.assert_called_once_with(query_string)


def test_inspire_query_parser_max_recursion_on_complicated_queries(inspire_app):
    query_string = "find a name" + " or a name" * 250
    with current_app.test_request_context():
        factory = inspire_query_factory()
        search = Search()

        factory(query_string, search)


@patch("inspirehep.search.factories.query.inspire_query_parser.parse_query")
def test_inspire_query_parser_is_called_with_updated_query_string_for_citedby(
    mock_inspire_query_parser, inspire_app
):
    record1 = create_record("lit")
    query_string = f"citedby:recid:{record1['control_number']}"
    expected_query_string = f"citedby:recid:{str(record1.id)}"
    with current_app.test_request_context():
        factory = inspire_query_factory()
        search = Search()

        factory(query_string, search)
        mock_inspire_query_parser.assert_called_once_with(expected_query_string)


@patch("inspirehep.search.factories.query.inspire_query_parser.parse_query")
def test_inspire_query_parser_is_called_with_updated_query_string_for_multiple_citedby(
    mock_inspire_query_parser, inspire_app
):
    record1 = create_record("lit")
    record2 = create_record("lit")
    record3 = create_record("lit")
    query_string = f"citedby:recid:{record1['control_number']} or citedby:recid:{record2['control_number']} or citedby:recid:{record3['control_number']}"
    expected_query_string = f"citedby:recid:{str(record1.id)} or citedby:recid:{str(record2.id)} or citedby:recid:{str(record3.id)}"
    with current_app.test_request_context():
        factory = inspire_query_factory()
        search = Search()

        factory(query_string, search)
        mock_inspire_query_parser.assert_called_once_with(expected_query_string)


@patch("inspirehep.search.factories.query.inspire_query_parser.parse_query")
def test_inspire_query_parser_is_called_with_updated_query_string_for_citedby_in_complex_query(
    mock_inspire_query_parser, inspire_app
):
    record1 = create_record("lit")
    query_string = f"citedby:recid:{record1['control_number']} and t boson"
    expected_query_string = f"citedby:recid:{str(record1.id)} and t boson"
    with current_app.test_request_context():
        factory = inspire_query_factory()
        search = Search()

        factory(query_string, search)
        mock_inspire_query_parser.assert_called_once_with(expected_query_string)
