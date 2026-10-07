from inspire_utils.record import get_value


def is_submission(workflow_data):
    source = get_value(workflow_data, "data.acquisition_source.method", "")
    return source == "submitter"


def is_journal_coverage_full(workflow_data):
    coverage = get_value(workflow_data, "journal_coverage", "")
    return coverage == "full"


def is_auto_approved(workflow_id, s3_store):
    return bool(s3_store.get_flag("auto-approved", workflow_id))


def is_auto_rejected(workflow_data):
    relevance_prediction = get_value(workflow_data, "relevance_prediction") or {}
    decision = relevance_prediction.get("decision", "")
    return decision.lower() == "rejected"
