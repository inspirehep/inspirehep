# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from flask import current_app
from helpers.utils import override_config
from mock import MagicMock

from inspirehep.search.api import InspireSearch, LiteratureSearch
from inspirehep.search.errors import FieldsParamForbidden
from inspirehep.search.factories.search import (
    get_search_with_source,
    inspire_search_factory,
    search_factory_only_with_aggs,
    search_factory_with_aggs,
    search_factory_without_aggs,
)


def test_get_search_with_source_with_fields_query_param_and_wrong_formats(inspire_app):
    with current_app.test_request_context("?fields=authors,ids&format=bibtex"):
        search = LiteratureSearch()
        with pytest.raises(FieldsParamForbidden):
            get_search_with_source(search)

    with current_app.test_request_context("?fields=authors,ids&format=latex-eu"):
        search = LiteratureSearch()
        with pytest.raises(FieldsParamForbidden):
            get_search_with_source(search)

    with current_app.test_request_context("?fields=authors,ids&format=latex-us"):
        search = LiteratureSearch()
        with pytest.raises(FieldsParamForbidden):
            get_search_with_source(search)


def test_get_search_with_source_with_fields_query_param_and_wrong_mimetype(inspire_app):
    with current_app.test_request_context(
        "?fields=authors,ids", headers={"Accept": "application/x-bibtex"}
    ):
        with pytest.raises(FieldsParamForbidden):
            search = LiteratureSearch()
            get_search_with_source(search)

    with current_app.test_request_context(
        "?fields=authors,ids",
        headers={"Accept": "application/vnd+inspire.latex.eu+x-latex"},
    ):
        with pytest.raises(FieldsParamForbidden):
            search = LiteratureSearch()
            get_search_with_source(search)

    with current_app.test_request_context(
        "?fields=authors,ids",
        headers={"Accept": "application/vnd+inspire.latex.us+x-latex"},
    ):
        with pytest.raises(FieldsParamForbidden):
            search = LiteratureSearch()
            get_search_with_source(search)


def test_get_search_with_source_with_fields_query_param(inspire_app):
    with current_app.test_request_context("?fields=authors,ids"):
        search = LiteratureSearch()
        search = get_search_with_source(search)
        expected_search_to_dict_source = {
            "includes": ["authors", "ids", "control_number", "_updated", "_created"]
        }
        search_to_dict = search.to_dict()
        assert expected_search_to_dict_source == search_to_dict["_source"]


def test_get_search_with_source_with_fields_query_param_and_allow_all_header(
    inspire_app
):
    with current_app.test_request_context(
        "?fields=authors,ids", headers={"Accept": "*/*"}
    ):
        search = LiteratureSearch()
        search = get_search_with_source(search)
        expected_search_to_dict_source = {
            "includes": ["authors", "ids", "control_number", "_updated", "_created"]
        }
        search_to_dict = search.to_dict()
        assert expected_search_to_dict_source == search_to_dict["_source"]


def test_get_search_with_source_with_LiteratureSearch_instance_with_defined_headers(
    inspire_app
):
    config = {
        "LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE": {
            "application/vnd+inspire.record.ui+json": ["title", "description"]
        },
        "LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE": {
            "application/vnd+inspire.record.ui+json": [
                "excludes_with_includes_looks_stupid"
            ],
            "application/bibtex": ["control_number"],
        },
    }
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with override_config(**config), current_app.test_request_context(headers=headers):
        search = LiteratureSearch()
        search = get_search_with_source(search)

        expected_source_includes = ["title", "description"]
        expected_source_excludes = ["excludes_with_includes_looks_stupid"]

        search_to_dict = search.to_dict()
        search_source = search_to_dict["_source"]

        assert expected_source_includes == search_source["includes"]
        assert expected_source_excludes == search_source["excludes"]


def test_get_search_with_source_with_LiteratureSearch_instance_with_not_defined_headers(
    inspire_app
):
    config = {
        "LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE": {
            "application/vnd+inspire.record.ui+json": ["title", "description"]
        },
        "LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE": {
            "application/bibtex": ["control_number"]
        },
    }
    headers = {"Accept": "application/json"}
    with override_config(**config), current_app.test_request_context(headers=headers):
        search = LiteratureSearch()
        search = get_search_with_source(search)

        search_to_dict = search.to_dict()
        assert "_source" not in search_to_dict


def test_get_search_with_source_with_LiteratureSearch_instance_without_config(
    inspire_app
):
    config = {
        "LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE": None,
        "LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE": None,
    }
    with override_config(**config), current_app.test_request_context():
        search = LiteratureSearch()
        search = get_search_with_source(search)

        search_to_dict = search.to_dict()
        assert "_source" not in search_to_dict


def test_search_factory_with_query(inspire_app):
    with current_app.test_request_context("?q=foo"):
        search = InspireSearch()
        expected_query_string = "foo"
        expected_search_to_dict = {
            "query": {"query_string": {"default_operator": "AND", "query": "foo"}},
            "track_total_hits": True,
        }
        query_string, search = inspire_search_factory(None, search)
        search_to_dict = search.to_dict()

        assert expected_query_string == query_string
        assert expected_search_to_dict == search_to_dict


def test_search_factory_with_query_has_operator_AND(inspire_app):
    with current_app.test_request_context("?q=foo"):
        search = InspireSearch()
        expected_query_string = "foo"
        expected_search_to_dict = {
            "query": {"query_string": {"default_operator": "AND", "query": "foo"}},
            "track_total_hits": True,
        }
        query_string, search = inspire_search_factory(None, search)
        search_to_dict = search.to_dict()

        assert expected_query_string == query_string
        assert expected_search_to_dict == search_to_dict


def test_search_factory_without_query(inspire_app):
    with current_app.test_request_context(""):
        search = InspireSearch()
        expected_query_string = ""
        expected_search_to_dict = {"query": {"match_all": {}}, "track_total_hits": True}
        query_string, search = inspire_search_factory(None, search)
        search_to_dict = search.to_dict()

        assert expected_query_string == query_string
        assert expected_search_to_dict == search_to_dict


def test_search_factory_with_aggs_with_query(inspire_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"*": facets}}
    with override_config(**config), current_app.test_request_context("?q=foo&type=bar"):
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


def test_search_factory_with_aggs_without_query(inspire_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"*": facets}}
    with override_config(**config), current_app.test_request_context(""):
        search = InspireSearch()
        search, urlkwargs = search_factory_with_aggs(None, search)
        search_to_dict = search.to_dict()

        assert "aggs" in search_to_dict
        assert "filter" not in search_to_dict
        assert "post_filter" not in search_to_dict


def test_search_factory_without_aggs_with_query(inspire_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"*": facets}}
    with override_config(**config), current_app.test_request_context("?q=foo&type=bar"):
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


def test_search_factory_without_aggs_without_query(inspire_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"*": facets}}
    with override_config(**config), current_app.test_request_context(""):
        search = InspireSearch()
        search, urlkwargs = search_factory_without_aggs(None, search)
        search_to_dict = search.to_dict()

        assert "aggs" not in search_to_dict
        assert "filter" not in search_to_dict
        assert "post_filter" not in search_to_dict


def test_search_factory_only_with_aggs(inspire_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"*": facets}}
    with override_config(**config), current_app.test_request_context("?q=foo&type=bar"):
        search = InspireSearch()
        search, urlkwargs = search_factory_only_with_aggs(None, search)
        search_to_dict = search.to_dict()
        search_to_dict_filters = search_to_dict["query"]["bool"]
        urlkwargs_to_dict = urlkwargs.to_dict()

        expected_urlkwargs = {"q": "foo", "type": "bar"}

        assert expected_urlkwargs == urlkwargs_to_dict
        assert "aggs" in search_to_dict
        assert "filter" in search_to_dict_filters
        assert "post_filter" in search_to_dict


def test_search_factory_only_with_aggs_without_query(inspire_app):
    mock_filter = MagicMock()
    mock_post_filter = MagicMock()
    facets = {
        "aggs": {"type": {"terms": {"field": "value"}}},
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {"*": facets}}
    with override_config(**config), current_app.test_request_context(""):
        search = InspireSearch()
        search, urlkwargs = search_factory_only_with_aggs(None, search)
        search_to_dict = search.to_dict()

        assert "aggs" in search_to_dict
        assert "filter" not in search_to_dict
        assert "post_filter" not in search_to_dict
