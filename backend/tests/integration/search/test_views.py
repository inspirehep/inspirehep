# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def test_query_parser(inspire_app):
    query = "title"
    with inspire_app.test_client() as client:
        response = client.get(
            f"/search/query-parser?q={query}", content_type="application/json"
        )
    expected = {"match": {"_all": {"operator": "and", "query": "title"}}}
    assert response.status_code == 200
    assert expected == response.json


def test_query_parser_should_return_404_when_endpoint_is_disabled(
    inspire_app, override_config
):
    with override_config(
        FEATURE_FLAG_ENABLE_QUERY_PARSER_ENDPOINT=False
    ), inspire_app.test_client() as client:
        response = client.get(f"/search/query-parser", content_type="application/json")

        assert response.status_code == 404


def test_query_parser_should_return_400_when_query_is_malformed(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get(
            "/search/query-parser?query={}", content_type="application/json"
        )
    assert response.status_code == 400
