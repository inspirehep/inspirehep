#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest
from inspirehep.records.marshmallow.literature.ui import LiteratureDetailSchema


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


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_arxiv_url(current_app_mock):
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


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_arxiv_missing_value(current_app_mock):
    entry_data = {"arxiv_eprints": [{"categories": ["nucl-th"]}], "control_number": 1}
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_kek_url(current_app_mock):
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


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_kek_missing_value(current_app_mock):
    entry_data = {
        "external_system_identifiers": [{"schema": "KEKSCAN"}],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "fulltext_links" not in serialized


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_arxiv_paper_without_ads_id_gets_ads_link_with_arxiv(current_app_mock):
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


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_arxiv_paper_with_ads_id_does_not_get_ads_link_with_arxiv(current_app_mock):
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


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_cds_with_cdsrdm_creates_links_correctly(current_app_mock):
    expected_data = [
        {
            "url_name": "CERN Document Server",
            "url_link": "https://repository.cern/records/123",
        }
    ]

    entry_data = {
        "external_system_identifiers": [
            {"schema": "CDS", "value": "test-123"},
            {"schema": "CDSRDM", "value": "123"},
        ],
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["external_system_identifiers"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_dataset_links(current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_LITERATURE_DATA_LINKS": False}
    external_system_identifiers = {
        "external_system_identifiers": [
            {"schema": "HEPDATA", "value": "hep-123"},
            {"schema": "ADS", "value": "ads-id-2"},
        ]
    }
    expected_data = [
        {"value": "https://www.hepdata.net/record/hep-123", "description": "HEPData"}
    ]
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(external_system_identifiers).data
    assert serialized["dataset_links"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_dataset_links_data(current_app_mock):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_LITERATURE_DATA_LINKS": True}

    entry_data = {
        "data": [
            {"record": {"$ref": "https://inspirebeta.net/api/data/2727272"}},
            {"record": {"$ref": "https://inspirebeta.net/api/data/2727275"}},
        ]
    }
    expected_data = [
        {"value": "https://inspirebeta.net/data/2727272", "description": 2727272},
        {"value": "https://inspirebeta.net/data/2727275", "description": 2727275},
    ]
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["dataset_links"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_literature_detail_serializes_date_from_dictionary(current_app_mock):
    data = {"preprint_date": "2020-09-15"}
    expected_data = {"date": "Sep 15, 2020", "preprint_date": "2020-09-15"}
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(data).data
    assert serialized == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
@pytest.mark.parametrize(
    ("collections", "expected_is_collection_hidden"),
    [
        (["Literature", "FermiLab"], False),
        (["Literature"], False),
        (["FermiLab"], True),
    ],
)
def test_literature_is_collection_hidden(
    current_app_mock, collections, expected_is_collection_hidden
):
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump({"_collections": collections}).data

    assert serialized["is_collection_hidden"] == expected_is_collection_hidden


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
@mock.patch("inspirehep.records.marshmallow.literature.ui.current_s3_instance")
def test_documents_doesnt_contain_error_from_fulltext(
    current_s3_mock, current_app_mock
):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}

    entry_data = {
        "documents": [
            {
                "fulltext": False,
                "url": "http://localhost:8080/api/files/url_to_file",
                "error": {
                    "message": (
                        "Fulltext indexing failed with message expected='>' actual='À'"
                        " at offset 102005"
                    )
                },
            }
        ],
        "control_number": 1,
    }
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(entry_data).data
    assert "_error" not in serialized


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_filter_non_pdg_keywords(current_app_mock):
    data = {
        "keywords": [
            {"schema": "PDG", "source": "PDG", "value": "M013WX"},
            {"source": "publisher", "value": "Strong Interactions"},
        ]
    }
    expected_data = [{"source": "publisher", "value": "Strong Interactions"}]
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(data).data
    assert serialized["keywords"] == expected_data


@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_filter_pdg_keywords(current_app_mock):
    data = {
        "keywords": [
            {"schema": "PDG", "source": "PDG", "value": "M013WX"},
            {"source": "publisher", "value": "Strong Interactions"},
        ]
    }
    expected_data = [
        {
            "value": "M013WX",
            "description": "${{\\mathit f}_{{{2}}}^{\\,'}{(1525)}}$ WIDTH",
        }
    ]
    serializer = LiteratureDetailSchema()
    serialized = serializer.dump(data).data
    assert serialized["pdg_keywords"] == expected_data
