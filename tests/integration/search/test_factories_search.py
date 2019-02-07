# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from mock import patch, MagicMock

from inspirehep.search.factories.search import (
    _get_search_with_source,
    inspire_search_factory,
    search_factory_with_aggs,
    search_factory_only_with_aggs,
    search_factory_without_aggs,
)
from elasticsearch_dsl import Search
from inspirehep.search.api import InspireSearch, LiteratureSearch


def test_get_search_with_source_with_LiteratureSearch_instance(base_app):
    config = {"SEARCH_SOURCE_INCLUDES": {"literature": ["title", "description"]}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context():
            search = LiteratureSearch()
            search = _get_search_with_source(search)

            expected_source_includes = ["title", "description"]

            search_to_dict = search.to_dict()
            search_source_includes = search_to_dict["_source"]["includes"]

            assert expected_source_includes == search_source_includes


def test_get_search_with_source_with_LiteratureSearch_instance_without_config(base_app):
    config = {"SEARCH_SOURCE_INCLUDES": {"something_else": ["title", "description"]}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context():
            search = LiteratureSearch()
            search = _get_search_with_source(search)

            search_to_dict = search.to_dict()
            assert "_source" not in search_to_dict


def test_get_search_with_source_with_other_search_instance(base_app):
    config = {"SEARCH_SOURCE_INCLUDES": {"literature": ["title", "description"]}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context():
            search = InspireSearch()
            search = _get_search_with_source(search)

            search_to_dict = search.to_dict()
            assert "_source" not in search_to_dict


def test_search_factory_with_query(base_app):
    with base_app.test_request_context("?q=foo"):
        search = InspireSearch()
        expected_query_string = "foo"
        expected_search_to_dict = {"query": {"match": {"_all": "foo"}}}
        query_string, search = inspire_search_factory(None, search)
        search_to_dict = search.to_dict()

        assert expected_query_string == query_string
        assert expected_search_to_dict == search_to_dict


def test_search_factory_without_query(base_app):
    with base_app.test_request_context(""):
        search = InspireSearch()
        expected_query_string = ""
        expected_search_to_dict = {"query": {"match_all": {}}}
        query_string, search = inspire_search_factory(None, search)
        search_to_dict = search.to_dict()

        assert expected_query_string == query_string
        assert expected_search_to_dict == search_to_dict


def test_search_factory_with_aggs_with_query(base_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"_all": facets}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context("?q=foo&type=bar"):
            search = InspireSearch()
            search, urlkwargs = search_factory_with_aggs(None, search)
            search_to_dict = search.to_dict()
            urlkwargs_to_dict = urlkwargs.to_dict()
            search_to_dict_filters = search_to_dict["query"]["bool"]

            expected_urlkwargs = {"q": "foo", "type": "bar"}

            assert expected_urlkwargs == urlkwargs_to_dict
            assert "aggs" in search_to_dict
            assert "filter" in search_to_dict_filters
            assert "post_filter" in search_to_dict


def test_search_factory_with_aggs_without_query(base_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"_all": facets}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context(""):
            search = InspireSearch()
            search, urlkwargs = search_factory_with_aggs(None, search)
            search_to_dict = search.to_dict()

            assert "aggs" in search_to_dict
            assert "filter" not in search_to_dict
            assert "post_filter" not in search_to_dict


def test_search_factory_without_aggs_with_query(base_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"_all": facets}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context("?q=foo&type=bar"):
            search = InspireSearch()
            search, urlkwargs = search_factory_without_aggs(None, search)
            search_to_dict = search.to_dict()
            urlkwargs_to_dict = urlkwargs.to_dict()
            search_to_dict_filters = search_to_dict["query"]["bool"]

            expected_urlkwargs = {"q": "foo", "type": "bar"}

            assert expected_urlkwargs == urlkwargs_to_dict
            assert "aggs" not in search_to_dict
            assert "filter" in search_to_dict_filters
            assert "post_filter" in search_to_dict


def test_search_factory_without_aggs_without_query(base_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"_all": facets}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context(""):
            search = InspireSearch()
            search, urlkwargs = search_factory_without_aggs(None, search)
            search_to_dict = search.to_dict()

            assert "aggs" not in search_to_dict
            assert "filter" not in search_to_dict
            assert "post_filter" not in search_to_dict


def test_search_factory_only_with_aggs(base_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"_all": facets}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context("?q=foo&type=bar"):
            search = InspireSearch()
            search, urlkwargs = search_factory_only_with_aggs(None, search)
            search_to_dict = search.to_dict()
            urlkwargs_to_dict = urlkwargs.to_dict()

            expected_urlkwargs = {"q": "foo"}

            assert expected_urlkwargs == urlkwargs_to_dict
            assert "aggs" in search_to_dict
            assert "filter" not in search_to_dict
            assert "post_filter" not in search_to_dict


def test_search_factory_only_with_aggs_without_query(base_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"_all": facets}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context(""):
            search = InspireSearch()
            search, urlkwargs = search_factory_only_with_aggs(None, search)
            search_to_dict = search.to_dict()

            assert "aggs" in search_to_dict
            assert "filter" not in search_to_dict
            assert "post_filter" not in search_to_dict
