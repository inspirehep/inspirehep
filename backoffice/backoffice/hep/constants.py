from django.db import models

HEP_TICKET_TYPES = (
    ("hep_create_curation", "HEP create curation"),
    ("hep_create_curation_core", "HEP create curation core"),
    ("hep_create_publisher_curation_core", "HEP create publisher curation"),
    ("hep_update_curation", "HEP update curation"),
    ("hep_submission", "HEP submission"),
)
HEP_DEFAULT_TICKET_TYPE = "hep_create_curation"


class HepStatusChoices(models.TextChoices):
    APPROVAL = "approval", "Waiting for approval"
    APPROVAL_CORE_SELECTION = (
        "approval_core_selection",
        "Waiting for CORE selection approval",
    )
    APPROVAL_FUZZY_MATCHING = (
        "approval_fuzzy_matching",
        "Waiting for matching approval",
    )
    APPROVAL_MERGE = "approval_merge", "Waiting for merging conflicts"
    ERROR = "error", "Error"
    ERROR_MULTIPLE_EXACT_MATCHES = (
        "error_multiple_exact_matches",
        "Multiple exact matches",
    )
    ERROR_VALIDATION = "error_validation", "Validation error"
    RUNNING = "running", "Running"
    BLOCKED = "blocked", "Blocked"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    MISSING_SUBJECT_FIELDS = "missing_subject_fields", "Missing subject fields"


HEP_DEFAULT_STATUS_CHOICE = HepStatusChoices.PROCESSING


class HepWorkflowType(models.TextChoices):
    HEP_CREATE = "HEP_CREATE", "HEP create"
    HEP_PUBLISHER_CREATE = "HEP_PUBLISHER_CREATE", "HEP publisher create"
    HEP_PUBLISHER_UPDATE = "HEP_PUBLISHER_UPDATE", "HEP publisher update"
    HEP_SUBMISSION = "HEP_SUBMISSION", "HEP submission"
    HEP_UPDATE = "HEP_UPDATE", "HEP update"


HEP_DEFAULT_WORKFLOW_TYPE = HepWorkflowType.HEP_CREATE


class HepResolutions(models.TextChoices):
    exact_match = "exact_match", "await_decision_exact_match"
    fuzzy_match = "fuzzy_match", "await_decision_fuzzy_match"
    hep_accept = (
        "hep_accept",
        "halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
    )
    hep_accept_core = (
        "hep_accept_core",
        "halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
    )
    hep_reject = (
        "hep_reject",
        "halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
    )
    core_selection_accept = (
        "core_selection_accept",
        "core_selection.await_decision_core_selection_approval",
    )
    core_selection_accept_core = (
        "core_selection_accept_core",
        "core_selection.await_decision_core_selection_approval",
    )
    auto_accept_core = (
        "auto_accept_core",
        "",
    )
    auto_reject = (
        "auto_reject",
        "",
    )
    merge_approve = (
        "merge_approve",
        "halt_for_approval_if_new_or_reject_if_not_relevant.await_merge_conflicts_resolved",
    )
    discard = (
        "discard",
        "",
    )
    missing_subject_fields = (
        "missing_subject_fields",
        "halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
    )


HEP_DECISION_CHOICES = HepResolutions.choices


class HepJournalCoverage(models.TextChoices):
    FULL = "full", "Full"
    PARTIAL = "partial", "Partial"


class HepCreateDags(models.TextChoices):
    initialize = "hep_create_dag", "initialize"
