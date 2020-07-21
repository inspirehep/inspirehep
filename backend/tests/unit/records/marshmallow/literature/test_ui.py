# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from marshmallow import missing

from inspirehep.records.marshmallow.literature import LiteratureDetailSchema


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
@mock.patch("inspirehep.records.marshmallow.literature.ui.current_s3_instance")
def test_internal_fulltext(current_s3_mock, current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}
    expected_data = [
        {
            "description": "Some description",
            "value": "http://localhost:8080/api/files/url_to_file",
        }
    ]

    entry_data = {
        "documents": [
            {
                "description": "Some description",
                "fulltext": True,
                "url": "http://localhost:8080/api/files/url_to_file",
            }
        ],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["fulltext_links"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
@mock.patch("inspirehep.records.marshmallow.literature.ui.current_s3_instance")
def test_internal_fulltext_no_description(current_s3_mock, current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}
    expected_data = [
        {
            "description": "fulltext",
            "value": "http://localhost:8080/api/files/url_to_file",
        }
    ]

    entry_data = {
        "documents": [
            {"fulltext": True, "url": "http://localhost:8080/api/files/url_to_file"}
        ],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["fulltext_links"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_internal_fulltext_hidden(current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}
    entry_data = {
        "documents": [
            {
                "hidden": True,
                "fulltext": True,
                "url": "http://localhost:8080/api/files/url_to_file",
            }
        ],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
@mock.patch("inspirehep.records.marshmallow.literature.ui.current_s3_instance")
def test_non_fulltext_documents_appear_in_fulltext_links_field(
    current_s3_mock, current_app_mock
):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}

    expected_data = [
        {
            "description": "fulltext",
            "value": "http://localhost:8080/api/files/url_to_file",
        }
    ]

    entry_data = {
        "documents": [
            {"fulltext": False, "url": "http://localhost:8080/api/files/url_to_file"}
        ],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" in serialized
    assert serialized["fulltext_links"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_internal_missing_url(current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}
    entry_data = {
        "documents": [{"description": "fulltext", "fulltext": True}],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
@mock.patch("inspirehep.records.marshmallow.literature.ui.current_s3_instance")
def test_internal_fulltext_files_turned_off(current_s3_mock, current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": False}
    entry_data = {
        "documents": [
            {
                "description": "Some description",
                "fulltext": True,
                "url": "http://localhost:8080/api/files/url_to_file",
            }
        ],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


def test_arxiv_url():
    expected_data = [
        {"value": "https://arxiv.org/pdf/nucl-th/9310030", "description": "arXiv"}
    ]

    entry_data = {
        "arxiv_eprints": [{"categories": ["nucl-th"], "value": "nucl-th/9310030"}],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["fulltext_links"] == expected_data


def test_arxiv_missing_value():
    entry_data = {"arxiv_eprints": [{"categories": ["nucl-th"]}], "control_number": 1}
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


def test_kek_url():
    expected_data = [
        {
            "description": "KEK scanned document",
            "value": "https://lib-extopc.kek.jp/preprints/PDF/1994/9407/9407219.pdf",
        }
    ]

    entry_data = {
        "external_system_identifiers": [{"schema": "KEKSCAN", "value": "94-07-219"}],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["fulltext_links"] == expected_data


def test_kek_missing_value():
    entry_data = {
        "external_system_identifiers": [{"schema": "KEKSCAN"}],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


def test_arxiv_paper_without_ads_id_gets_ads_link_with_arxiv():
    expected_data = [
        {
            "url_name": "ADS Abstract Service",
            "url_link": "https://ui.adsabs.harvard.edu/abs/arXiv:1909.07643",
        }
    ]

    entry_data = {
        "external_system_identifiers": [],
        "arxiv_eprints": [{"value": "1909.07643"}],
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data

    assert serialized["external_system_identifiers"] == expected_data


def test_arxiv_paper_with_ads_id_does_not_get_ads_link_with_arxiv():
    expected_data = [
        {
            "url_name": "ADS Abstract Service",
            "url_link": "https://ui.adsabs.harvard.edu/abs/2019MNRAS.490.1678C",
        }
    ]

    entry_data = {
        "external_system_identifiers": [
            {"schema": "ADS", "value": "2019MNRAS.490.1678C"}
        ],
        "arxiv_eprints": [{"value": "1909.07643"}],
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["external_system_identifiers"] == expected_data
