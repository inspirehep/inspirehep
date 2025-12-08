import pytest
from include.utils import workflows


@pytest.mark.parametrize(
    ("source", "expected_source"),
    [
        ("publisher", "publisher"),
        ("desy", "publisher"),
        ("jessica jones", "publisher"),
        ("arxiv", "arxiv"),
        ("submitter", "submitter"),
    ],
)
def test_get_source_root(source, expected_source):
    result = workflows.get_source_for_root(source)

    assert expected_source == result


def test_set_flag():
    workflow_data = {}
    workflows.set_flag("test_flag", True, workflow_data)
    assert workflow_data["flags"]["test_flag"] is True


def test_get_flag():
    workflow_data = {"flags": {"test_flag": True}}
    flag_value = workflows.get_flag("test_flag", workflow_data)
    assert flag_value is True


def test_build_matching_workflow_filter_params():
    workflow_data = {
        "data": {
            "arxiv_eprints": [{"value": "1234.5678"}, {"value": "2345.6789"}],
            "dois": [{"value": "10.1000/xyz123"}],
        }
    }
    statuses = ["pending", "rejected"]
    filter_params = workflows.build_matching_workflow_filter_params(
        workflow_data, statuses
    )

    assert filter_params["status__in"] == {"pending__rejected"}
    assert "search" in filter_params
    assert "data.arxiv_eprints.value.keyword:1234.5678" in filter_params["search"]
    assert "data.arxiv_eprints.value.keyword:2345.6789" in filter_params["search"]
    assert "data.dois.value.keyword:10.1000/xyz123" in filter_params["search"]


def test_has_same_source():
    workflow_1 = {"data": {"acquisition_source": {"source": "Publisher"}}}
    workflow_2 = {"data": {"acquisition_source": {"source": "publisher"}}}
    assert workflows.has_same_source(workflow_1, workflow_2) is True

    workflow_3 = {"data": {"acquisition_source": {"source": "arXiv"}}}
    assert workflows.has_same_source(workflow_1, workflow_3) is False


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_true():
    workflow_data = {
        "data": {
            "acquisition_source": {"source": "arXiv"},
            "arxiv_eprints": [{"value": "2504.01123"}],
        }
    }

    result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
        workflow_data
    )
    assert result is True


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_no_identifier():
    workflow_data = {"data": {"acquisition_source": {"source": "arXiv"}}}

    result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
        workflow_data
    )
    assert result is False


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_no_rejection():
    workflow_data = {
        "data": {
            "acquisition_source": {"source": "arXiv"},
            "arxiv_eprints": [{"value": "2507.26819"}],
        }
    }

    result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
        workflow_data
    )
    assert result is False


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_diff_source():
    workflow_data = {
        "data": {
            "acquisition_source": {"source": "bad_source"},
            "arxiv_eprints": [{"value": "2504.01123"}],
        }
    }

    result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
        workflow_data
    )
    assert result is False
