#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from flask import current_app
from inspirehep.search.utils import RecursionLimit, get_facet_configuration
from mock import Mock, patch


@patch("inspirehep.records.config.RECORDS_REST_ENDPOINTS")
def test_facet_configuration_with_existing_facet_import_string(
    facet_mock, inspire_app, override_config
):
    facet_mock.return_value = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    config = {
        "RECORDS_REST_FACETS": {
            "defenders": "inspirehep.records.config.RECORDS_REST_ENDPOINTS"
        }
    }
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with (
        current_app.test_request_context("?facet_name=defenders"),
        override_config(**config),
    ):
        result = get_facet_configuration("records-hep")
        facet_mock.assert_called_once()
        assert expected == result


def test_facet_configuration_with_existing_facet_callable(inspire_app, override_config):
    facet_mock = Mock()
    facet_mock.return_value = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    config = {"RECORDS_REST_FACETS": {"defenders": facet_mock}}
    expected = {
        "aggs": {"jessica-jones": {"terms": {"field": "defenders", "size": 20}}}
    }
    with (
        current_app.test_request_context("?facet_name=defenders"),
        override_config(**config),
    ):
        result = get_facet_configuration("records-hep")
        facet_mock.assert_called_once()
        assert expected == result


def test_facet_configuration_with_existing_facet_dict(inspire_app, override_config):
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
    with (
        current_app.test_request_context("?facet_name=defenders"),
        override_config(**config),
    ):
        result = get_facet_configuration("records-hep")
        assert expected == result


def test_facet_configuration_without_request_facet_name(inspire_app, override_config):
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
    with current_app.test_request_context(), override_config(**config):
        result = get_facet_configuration("records-hep")
        assert expected == result


def test_facet_configuration_with_fallback_to_default_facet(
    inspire_app, override_config
):
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
    with (
        current_app.test_request_context("?facet_name=defenders"),
        override_config(**config),
    ):
        result = get_facet_configuration("records-hep")
        assert expected == result


def test_setting_recursion_limit():
    def recursion_test(max_depth, current_level=1):
        level = current_level
        if current_level < max_depth:
            level = recursion_test(max_depth, current_level + 1)
        return level

    assert recursion_test(100) == 100
    with pytest.raises(RecursionError), RecursionLimit(50):
        recursion_test(100)
    assert recursion_test(100) == 100
