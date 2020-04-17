# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import override_config


def test_query_parser(api_client):
    query = "title"
    response = api_client.get(
        f"/search/query-parser?q={query}", content_type="application/json"
    )
    expected = {"simple_query_string": {"fields": ["_all"], "query": "title"}}
    assert response.status_code == 200
    assert expected == response.json


def test_query_parser_should_return_404_when_endpoint_is_disabled(base_app, api_client):
    with override_config(app=base_app, FEATURE_FLAG_ENABLE_QUERY_PARSER_ENDPOINT=False):
        response = api_client.get(
            f"/search/query-parser", content_type="application/json"
        )

        assert response.status_code == 404


def test_query_parser_should_return_400_when_query_is_malformed(api_client):
    response = api_client.get(
        "/search/query-parser?query={}", content_type="application/json"
    )
    assert response.status_code == 400
