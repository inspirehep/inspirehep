# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from mock import patch, Mock

from inspirehep.search.utils import get_facet_configuration


@patch("inspirehep.config.RECORDS_REST_ENDPOINTS")
def test_facet_configuration_with_existing_facet_import_string(facet_mock, base_app):
    facet_mock.return_value = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    config = {
        "RECORDS_REST_FACETS": {"defenders": "inspirehep.config.RECORDS_REST_ENDPOINTS"}
    }
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with base_app.test_request_context("?facet_name=defenders"):
        with patch.dict(base_app.config, config):
            result = get_facet_configuration("records-hep")
            facet_mock.assert_called_once()
            assert expected == result


def test_facet_configuration_with_existing_facet_callable(base_app):
    facet_mock = Mock()
    facet_mock.return_value = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    config = {"RECORDS_REST_FACETS": {"defenders": facet_mock}}
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with base_app.test_request_context("?facet_name=defenders"):
        with patch.dict(base_app.config, config):
            result = get_facet_configuration("records-hep")
            facet_mock.assert_called_once()
            assert expected == result


def test_facet_configuration_with_existing_facet_dict(base_app):
    config = {
        "RECORDS_REST_FACETS": {
            "defenders": {
                "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
            }
        }
    }
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with base_app.test_request_context("?facet_name=defenders"):
        with patch.dict(base_app.config, config):
            result = get_facet_configuration("records-hep")
            assert expected == result


def test_facet_configuration_without_request_facet_name(base_app):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
            }
        }
    }
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with base_app.test_request_context():
        with patch.dict(base_app.config, config):
            result = get_facet_configuration("records-hep")
            assert expected == result


def test_facet_configuration_with_fallback_to_default_facet(base_app):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
            }
        }
    }
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with base_app.test_request_context("?facet_name=defenders"):
        with patch.dict(base_app.config, config):
            result = get_facet_configuration("records-hep")
            assert expected == result
