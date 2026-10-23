from django.db import models

# tickets
AUTHOR_TICKET_TYPES = (
    ("author_create_curation", "Author create curation"),
    ("author_create_user", "Author create user"),
    ("author_update_curation", "Author update curation"),
)
AUTHOR_DEFAULT_TICKET_TYPE = "author_create_curation"

# workflows


class AuthorStatusChoices(models.TextChoices):
    RUNNING = "running", "Running"
    APPROVAL = "approval", "Waiting for approval"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    ERROR = "error", "Error"


AUTHOR_DEFAULT_STATUS_CHOICE = AuthorStatusChoices.PROCESSING


class AuthorWorkflowType(models.TextChoices):
    AUTHOR_CREATE = "AUTHOR_CREATE", "Author create"
    AUTHOR_UPDATE = "AUTHOR_UPDATE", "Author update"


AUTHOR_DEFAULT_WORKFLOW_TYPE = AuthorWorkflowType.AUTHOR_CREATE


class AuthorResolutions(models.TextChoices):
    accept = "accept", "await_author_check_approval"
    accept_curate = "accept_curate", "await_author_check_approval"
    reject = "reject", "await_author_check_approval"


AUTHOR_DECISION_CHOICES = AuthorResolutions.choices


class AuthorCreateDags(models.TextChoices):
    initialize = "author_create_initialization_dag", "initialize"
    approve = "author_create_approved_dag", "approve"
    reject = "author_create_rejected_dag", "reject"


class AuthorUpdateDags(models.TextChoices):
    initialize = "author_update_dag", "initialize"
