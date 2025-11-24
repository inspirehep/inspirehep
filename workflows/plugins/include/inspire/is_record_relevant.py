from inspire_utils.record import get_value


def is_submission(workflow_data):
    source = get_value(workflow_data, "data.acquisition_source.method", "")
    return source == "submitter"


def is_journal_coverage_full(workflow_data):
    coverage = get_value(workflow_data, "journal_coverage", "")
    return coverage == "full"


def is_auto_approved(workflow_data):
    # TODO: adjust when auto_approve flow is ready
    return False


def is_auto_rejected(workflow_data):
    relevance_prediction = get_value(workflow_data, "relevance_prediction", {})
    classification_results = get_value(workflow_data, "classifier_results", {})
    fulltext_used = classification_results.get("fulltext_used")
    if not relevance_prediction or not classification_results or not fulltext_used:
        return False

    decision = relevance_prediction.get("decision")
    all_class_results = classification_results.get("complete_output")
    core_keywords = all_class_results.get("core_keywords")

    return decision.lower() == "rejected" and len(core_keywords) == 0
