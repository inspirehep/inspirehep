# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl import Search
from flask import current_app
from helpers.utils import override_config
from mock import patch

from inspirehep.search.factories.facet import inspire_facets_factory


def test_inspire_facets_factory(app_clean):
    index_name = "test_facet_aggs"
    facets_aggs = {"aggs": {"type": {"terms": {"field": "value"}}}}
    config = {"RECORDS_REST_FACETS": {index_name: facets_aggs}}
    with override_config(**config):
        with current_app.test_request_context("?type=FOO&q=BAR"):
            search = Search()
            search, urlwargs = inspire_facets_factory(search, index_name)
            search_to_dict = search.to_dict()

            assert facets_aggs["aggs"] == search_to_dict["aggs"]


def test_inspire_facets_factory_with_missing_index(app_clean):
    index_name = "test_facet_aggs"
    index_name_missing = "test_facet_aggs_missing"
    facets_aggs = {"aggs": {"type": {"terms": {"field": "value"}}}}
    config = {"RECORDS_REST_FACETS": {index_name: facets_aggs}}
    with override_config(**config):
        with current_app.test_request_context("?type=FOO&q=BAR"):
            search = Search()
            search, urlwargs = inspire_facets_factory(search, index_name_missing)
            search_to_dict = search.to_dict()

            assert "aggs" not in search_to_dict
