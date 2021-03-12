# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from mock import patch

from inspirehep.rt.tickets import _get_all_of, query_rt


@patch("inspirehep.rt.tickets.rt_instance")
def test_query_rt_pass_all_arguments(mock_rt_instance):
    mock_rt_instance.url = "http://test_instance"

    query_rt("type", "body", ["field1", "field2"])
    expected_url = "http://test_instance/search/type?query=body&fields=field1,field2"

    mock_rt_instance.session.get.assert_called_once_with(expected_url)


@patch("inspirehep.rt.tickets.rt_instance")
def test_query_rt_pass_only_type(mock_rt_instance):
    mock_rt_instance.url = "http://test_instance"

    query_rt("type")
    expected_url = "http://test_instance/search/type?query="

    mock_rt_instance.session.get.assert_called_once_with(expected_url)


@patch("inspirehep.rt.tickets.rt_instance")
def test_query_rt_pass_type_and_body(mock_rt_instance):
    mock_rt_instance.url = "http://test_instance"

    query_rt("type", "body")
    expected_url = "http://test_instance/search/type?query=body"

    mock_rt_instance.session.get.assert_called_once_with(expected_url)


@patch("inspirehep.rt.tickets.rt_instance")
def test_query_rt_pass_type_and_fields(mock_rt_instance):
    mock_rt_instance.url = "http://test_instance"

    query_rt("type", fields=["field1", "field2"])
    expected_url = "http://test_instance/search/type?query=&fields=field1,field2"

    mock_rt_instance.session.get.assert_called_once_with(expected_url)


@patch("inspirehep.rt.tickets.rt_instance")
def test_query_rt_response(mock_rt_instance):
    mock_rt_instance.session.get.return_value.content.decode.return_value = (
        "u'RT/4.2.16 200 Ok\n\nline_1\nline_2\nline_3\n\n\n"
    )
    mock_rt_instance.url = "http://test_instance"

    expected_response = ["line_1", "line_2", "line_3"]
    response = query_rt("type", "body", ["field1", "field2"])

    assert response == expected_response


@patch("inspirehep.rt.tickets.query_rt")
def test_get_all_of(mock_query_rt):
    mock_query_rt.return_value = ["1: user1", "2: user2"]

    expected = [{"id": "1", "name": "user1"}, {"id": "2", "name": "user2"}]

    response = _get_all_of("user")

    assert response == expected
    mock_query_rt.called_once_with("user")
