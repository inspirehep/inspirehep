from unittest.mock import Mock

import pytest

from backoffice.hep.documents import HepWorkflowDocument


@pytest.fixture
def document():
    return HepWorkflowDocument()


def test_prepare_data_preserves_missing_affiliations_for_authors(document):
    instance = Mock()
    instance.data = {
        "authors": [
            {"full_name": "Smith, J."},
            {"full_name": "Doe, J.", "affiliations": [{"value": "CERN"}]},
        ]
    }

    result = document.prepare_data(instance)

    assert "affiliations" not in result["authors"][0]
    assert result["authors"][1]["affiliations"] == [{"value": "CERN"}]


def test_prepare_data_preserves_missing_affiliations_for_supervisors(document):
    instance = Mock()
    instance.data = {"supervisors": [{"full_name": "Smith, J."}]}

    result = document.prepare_data(instance)

    assert "affiliations" not in result["supervisors"][0]


def test_prepare_data_defaults_public_notes(document):
    instance = Mock()
    instance.data = {}

    result = document.prepare_data(instance)

    assert result["public_notes"] == []


def test_prepare_data_preserves_existing_public_notes(document):
    instance = Mock()
    instance.data = {"public_notes": [{"value": "some note", "source": "arXiv"}]}

    result = document.prepare_data(instance)

    assert result["public_notes"] == [{"value": "some note", "source": "arXiv"}]


def test_prepare_data_defaults_arxiv_eprints(document):
    instance = Mock()
    instance.data = {}

    result = document.prepare_data(instance)

    assert result["arxiv_eprints"] == []


def test_prepare_data_preserves_existing_arxiv_eprints(document):
    instance = Mock()
    instance.data = {
        "arxiv_eprints": [{"value": "2301.00001", "categories": ["hep-ph"]}]
    }

    result = document.prepare_data(instance)

    assert result["arxiv_eprints"] == [
        {"value": "2301.00001", "categories": ["hep-ph"]}
    ]


def test_prepare_data_use_acquisition_source_for_non_desy(document):
    instance = Mock()
    instance.data = {
        "acquisition_source": {"source": "Elsevier"},
    }

    result = document.prepare_data(instance)

    assert result["source"] == "Elsevier"


def test_prepare_data_use_titles_source_for_desy(document):
    instance = Mock()
    instance.data = {
        "acquisition_source": {"source": "desy"},
        "titles": [{"source": "Wiley"}],
    }

    result = document.prepare_data(instance)

    assert result["source"] == "desy/Wiley"


def test_prepare_data_handles_none_data(document):
    instance = Mock()
    instance.data = None

    result = document.prepare_data(instance)

    assert result == {"public_notes": [], "arxiv_eprints": [], "source": None}


def test_prepare_data_handles_empty_data(document):
    instance = Mock()
    instance.data = {}

    result = document.prepare_data(instance)

    assert result["public_notes"] == []
    assert result["arxiv_eprints"] == []


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("classifier_results", {}),
        ("classifier_results", None),
        ("relevance_prediction", {}),
        ("relevance_prediction", None),
        ("matches", {}),
        ("matches", None),
    ],
)
def test_prepare_optional_json_fields_return_none_for_empty_values(
    document, field_name, value
):
    instance = Mock()
    setattr(instance, field_name, value)

    result = getattr(document, f"prepare_{field_name}")(instance)

    assert result is None


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("classifier_results", {"score": 0.9}),
        ("relevance_prediction", {"decision": "CORE"}),
        ("matches", {"exact": [{"control_number": 1}]}),
    ],
)
def test_prepare_optional_json_fields_preserve_non_empty_values(
    document, field_name, value
):
    instance = Mock()
    setattr(instance, field_name, value)

    result = getattr(document, f"prepare_{field_name}")(instance)

    assert result == value


@pytest.mark.parametrize(
    ("reference_count_value", "references_value", "expected"),
    [
        (None, [{}], None),
        ({}, [{}], {"total": 1}),
    ],
)
def test_prepare_reference_count_returns_none_when_missing(
    document, reference_count_value, references_value, expected
):
    instance = Mock()
    instance.reference_count = reference_count_value
    instance.data = {"references": references_value}

    result = document.prepare_reference_count(instance)

    assert result == expected


def test_prepare_reference_count_adds_total_from_data_references(document):
    instance = Mock()
    instance.reference_count = {"core": 3, "non_core": 1}
    instance.data = {"references": [{}, {}, {}, {}]}

    result = document.prepare_reference_count(instance)

    assert result == {"core": 3, "non_core": 1, "total": 4}


def test_prepare_reference_count_total_defaults_to_zero_without_references(document):
    instance = Mock()
    instance.reference_count = {"core": 0, "non_core": 0}
    instance.data = {}

    result = document.prepare_reference_count(instance)

    assert result == {"core": 0, "non_core": 0, "total": 0}
