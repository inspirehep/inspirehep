# tickets
TICKET_TYPES = (
    ("author_create_curation", "Author create curation"),
    ("author_create_user", "Author create user"),
)
DEFAULT_TICKET_TYPE = "author_create_curation"

# workflows
DEFAULT_STATUS_CHOICE = "running"
DEFAULT_WORKFLOW_TYPE = "HEP_create"
STATUS_CHOICES = (
    ("running", "Running"),
    ("approval", "Waiting for approval"),
    ("completed", "Completed"),
    ("error", "Error"),
)

WORKFLOW_TYPES = (
    ("HEP_CREATE", "HEP create"),
    ("HEP_UPDATE", "HEP update"),
    ("AUTHOR_CREATE", "Author create"),
    ("AUTHOR_UPDATE", "Author update"),
)
