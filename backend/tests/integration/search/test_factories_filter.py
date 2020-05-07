# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl import Search
from flask import current_app
from helpers.utils import override_config
from mock import MagicMock, patch

from inspirehep.search.factories.filter import inspire_filter_factory


def test_inspire_filter_factory(app_clean):
    index_name = "test_facet_aggs"
    mock_filter = MagicMock()
    mock_filter_wrapper = MagicMock()
    mock_filter_wrapper.return_value = mock_filter

    mock_post_filter = MagicMock()
    mock_post_filter_wrapper = MagicMock()
    mock_post_filter_wrapper.return_value = mock_post_filter

    facets_filter = {
        "filters": {"type": mock_filter("type")},
        "post_filters": {"type": mock_post_filter("type")},
    }
    config = {"RECORDS_REST_FACETS": {index_name: facets_filter}}

    with override_config(**config):
        with current_app.test_request_context("?type=FOO&q=BAR"):

            search = Search()
            search, urlwargs = inspire_filter_factory(search, index_name)

            mock_filter.assert_called_once()
            mock_post_filter.assert_called_once()
