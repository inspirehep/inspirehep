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
