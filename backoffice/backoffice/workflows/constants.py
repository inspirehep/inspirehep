from django.db import models

# tickets
TICKET_TYPES = (
    ("author_create_curation", "Author create curation"),
    ("author_create_user", "Author create user"),
)
DEFAULT_TICKET_TYPE = "author_create_curation"

# workflows


class StatusChoices(models.TextChoices):
    RUNNING = "running", "Running"
    APPROVAL = "approval", "Waiting for approva"
    COMPLETED = "completed", "Completed"
    ERROR = "error", "Error"


DEFAULT_STATUS_CHOICE = StatusChoices.RUNNING


class WorkflowType(models.TextChoices):
    HEP_CREATE = "HEP_CREATE", "HEP create"
    HEP_UPDATE = "HEP_UPDATE", "HEP update"
    AUTHOR_CREATE = "AUTHOR_CREATE", "Author create"
    AUTHOR_UPDATE = "AUTHOR_UPDATE", "Author update"


DEFAULT_WORKFLOW_TYPE = WorkflowType.HEP_CREATE

# author dags for each workflow type
WORKFLOW_DAG = {
    WorkflowType.HEP_CREATE: "",
    WorkflowType.HEP_UPDATE: "",
    WorkflowType.AUTHOR_CREATE: "author_create_initialization_dag",
    WorkflowType.AUTHOR_UPDATE: "author_update_dag",
}


class ResolutionDags(models.TextChoices):
    accept = "accept", "author_create_approved_dag"
    reject = "reject", "author_create_rejected_dag"
