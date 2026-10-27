from unittest.mock import MagicMock

import pytest
from include.inspire import is_record_relevant


def test_is_auto_rejected_noclassifierresults():
    workflow_data = {
        "relevance_prediction": {"label": "auto-reject"},
        "classifier_results": None,
    }
    assert not is_record_relevant.is_auto_rejected(workflow_data)


def test_is_auto_rejected_no_relevance_prediction():
    assert not is_record_relevant.is_auto_rejected({"data": {}})


def test_is_auto_rejected_rejected_without_classifier_results():
    workflow_data = {"relevance_prediction": {"decision": "Rejected"}}
    assert is_record_relevant.is_auto_rejected(workflow_data)


def test_is_auto_rejected_not_rejected():
    for decision in ["CORE", "Non-CORE"]:
        workflow_data = {"relevance_prediction": {"decision": decision}}
        assert not is_record_relevant.is_auto_rejected(workflow_data)


@pytest.mark.parametrize(
    ("workflow_data", "expected"),
    [
        (
            {
                "data": {"acquisition_source": {"source": "arXiv"}},
                "relevance_prediction": {"decision": "Rejected"},
            },
            True,
        ),
        (
            {
                "data": {"acquisition_source": {"source": "arXiv"}},
                "relevance_prediction": {"decision": "CORE"},
            },
            False,
        ),
        (
            {
                "data": {"acquisition_source": {"method": "submitter"}},
                "relevance_prediction": {"decision": "Rejected"},
            },
            False,
        ),
        (
            {
                "data": {"acquisition_source": {"source": "arXiv"}},
                "journal_coverage": "full",
                "relevance_prediction": {"decision": "Rejected"},
            },
            False,
        ),
    ],
    ids=["rejected", "not_rejected", "submission", "full_journal_coverage"],
)
def test_should_auto_reject(workflow_data, expected):
    s3_store = MagicMock()
    s3_store.get_flag.return_value = False

    assert (
        is_record_relevant.should_auto_reject(workflow_data, "workflow_id", s3_store)
        is expected
    )


def test_should_auto_reject_auto_approved():
    workflow_data = {
        "data": {"acquisition_source": {"source": "arXiv"}},
        "relevance_prediction": {"decision": "Rejected"},
    }
    s3_store = MagicMock()
    s3_store.get_flag.return_value = True

    assert not is_record_relevant.should_auto_reject(
        workflow_data, "workflow_id", s3_store
    )


@pytest.mark.parametrize(
    ("auto_approved", "categories", "expected"),
    [
        (True, ["hep-th", "gr-qc"], True),
        (True, ["gr-qc", "hep-th"], False),
        (False, ["hep-th"], False),
    ],
    ids=["auto_approved_core", "auto_approved_non_core", "not_auto_approved"],
)
def test_is_auto_accepted_core(auto_approved, categories, expected):
    s3_store = MagicMock()
    s3_store.get_flag.return_value = auto_approved
    s3_store.read_workflow.return_value = {
        "data": {"arxiv_eprints": [{"value": "2501.00001", "categories": categories}]}
    }

    assert is_record_relevant.is_auto_accepted_core("workflow_id", s3_store) is expected
