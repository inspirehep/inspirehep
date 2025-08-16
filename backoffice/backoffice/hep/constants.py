from django.db import models

HEP_TICKET_TYPES = (
    ("hep_create_curation", "HEP create curation"),
    ("hep_update_curation", "HEP update curation"),
)
HEP_DEFAULT_TICKET_TYPE = "hep_create_curation"


class HepStatusChoices(models.TextChoices):
    RUNNING = "running", "Running"
    APPROVAL = "approval", "Waiting for approval"
    BLOCKED = "blocked", "Blocked"
    MATCHING = "matching", "Matching"
    FUZZY_MATCHING = "fuzzy_matching", "Fuzzy matching"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    ERROR = "error", "Error"


HEP_DEFAULT_STATUS_CHOICE = HepStatusChoices.PROCESSING


class HepWorkflowType(models.TextChoices):
    HEP_CREATE = "HEP_CREATE", "HEP create"
    HEP_UPDATE = "HEP_UPDATE", "HEP update"


HEP_DEFAULT_WORKFLOW_TYPE = HepWorkflowType.HEP_CREATE


class HepResolutions(models.TextChoices):
    exact_match = "exact_match", "await_decision_exact_match"
    fuzzy_match = "fuzzy_match", "fuzzy_match"
    approval = "approval", "approval"


HEP_DECISION_CHOICES = HepResolutions.choices
