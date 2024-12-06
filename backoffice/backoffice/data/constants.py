from django.db import models
from backoffice.authors.constants import WorkflowType

# tickets
TICKET_TYPES = (
    ("author_create_curation", "Author create curation"),
    ("author_create_user", "Author create user"),
    ("author_update_curation", "Author update curation"),
)
DEFAULT_TICKET_TYPE = "author_create_curation"

# workflows
allowed_workflow_types = [
    WorkflowType.AUTHOR_CREATE,
    WorkflowType.AUTHOR_UPDATE,
]


class AuthorResolutionDags(models.TextChoices):
    accept = "accept", "author_create_approved_dag"
    reject = "reject", "author_create_rejected_dag"
    accept_curate = "accept_curate", "author_create_approved_dag"


DECISION_CHOICES = AuthorResolutionDags.choices


class AuthorCreateDags(models.TextChoices):
    initialize = "author_create_initialization_dag", "initialize"
    approve = "author_create_approved_dag", "approve"
    reject = "author_create_rejected_dag", "reject"


class AuthorUpdateDags(models.TextChoices):
    initialize = "author_update_dag", "initialize"


WORKFLOW_DAGS = {
    WorkflowType.HEP_CREATE: "",
    WorkflowType.HEP_UPDATE: "",
    WorkflowType.AUTHOR_CREATE: AuthorCreateDags,
    WorkflowType.AUTHOR_UPDATE: AuthorUpdateDags,
}
