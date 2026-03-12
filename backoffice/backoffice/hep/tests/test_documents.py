from unittest.mock import Mock

import pytest

from backoffice.hep.documents import HepWorkflowDocument


@pytest.fixture
def document():
    return HepWorkflowDocument()


def test_prepare_data_defaults_affiliations_for_authors(document):
    instance = Mock()
    instance.data = {
        "authors": [
            {"full_name": "Smith, J."},
            {"full_name": "Doe, J.", "affiliations": [{"value": "CERN"}]},
        ]
    }

    result = document.prepare_data(instance)

    assert result["authors"][0]["affiliations"] == []
    assert result["authors"][1]["affiliations"] == [{"value": "CERN"}]


def test_prepare_data_defaults_affiliations_for_supervisors(document):
    instance = Mock()
    instance.data = {"supervisors": [{"full_name": "Smith, J."}]}

    result = document.prepare_data(instance)

    assert result["supervisors"][0]["affiliations"] == []


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


def test_prepare_data_handles_none_data(document):
    instance = Mock()
    instance.data = None

    result = document.prepare_data(instance)

    assert result == {"public_notes": [], "arxiv_eprints": []}


def test_prepare_data_handles_empty_data(document):
    instance = Mock()
    instance.data = {}

    result = document.prepare_data(instance)

    assert result["public_notes"] == []
    assert result["arxiv_eprints"] == []
