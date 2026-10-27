from include.inspire.approval import is_first_category_core
from inspire_utils.record import get_value


def is_submission(workflow_data):
    source = get_value(workflow_data, "data.acquisition_source.method", "")
    return source == "submitter"


def is_journal_coverage_full(workflow_data):
    coverage = get_value(workflow_data, "journal_coverage", "")
    return coverage == "full"


def is_auto_approved(workflow_id, s3_store):
    return bool(s3_store.get_flag("auto-approved", workflow_id))


def is_auto_accepted_core(workflow_id, s3_store):
    if not is_auto_approved(workflow_id, s3_store):
        return False
    workflow_data = s3_store.read_workflow(workflow_id)
    return is_first_category_core(workflow_data.get("data", {}))


def is_auto_rejected(workflow_data):
    relevance_prediction = get_value(workflow_data, "relevance_prediction") or {}
    decision = relevance_prediction.get("decision", "")
    return decision.lower() == "rejected"


def should_auto_reject(workflow_data, workflow_id, s3_store):
    return (
        not is_auto_approved(workflow_id, s3_store)
        and is_auto_rejected(workflow_data)
        and not is_submission(workflow_data)
        and not is_journal_coverage_full(workflow_data)
    )
