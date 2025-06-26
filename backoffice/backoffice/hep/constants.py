from django.db import models

HEP_TICKET_TYPES = (
    ("hep_create_curation", "HEP create curation"),
    ("hep_update_curation", "HEP update curation"),
)
HEP_DEFAULT_TICKET_TYPE = "hep_create_curation"


class HepStatusChoices(models.TextChoices):
    RUNNING = "running", "Running"
    APPROVAL = "approval", "Waiting for approval"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    ERROR = "error", "Error"


HEP_DEFAULT_STATUS_CHOICE = HepStatusChoices.PROCESSING


class HepWorkflowType(models.TextChoices):
    HEP_CREATE = "HEP_CREATE", "HEP create"
    HEP_UPDATE = "HEP_UPDATE", "HEP update"


HEP_DEFAULT_WORKFLOW_TYPE = HepWorkflowType.HEP_CREATE


class HepResolutionDags(models.TextChoices):
    accept = "accept", "hep_create_approved_dag"
    reject = "reject", "hep_create_rejected_dag"
    accept_curate = "accept_curate", "hep_create_approved_dag"


HEP_DECISION_CHOICES = HepResolutionDags.choices
