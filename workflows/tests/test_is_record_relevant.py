from include.inspire import is_record_relevant


def test_is_auto_rejected_noclassifierresults():
    workflow_data = {
        "relevance_prediction": {"label": "auto-reject"},
        "classifier_results": None,
    }
    assert not is_record_relevant.is_auto_rejected(workflow_data)
