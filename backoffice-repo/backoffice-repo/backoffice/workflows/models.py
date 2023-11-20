import uuid

from django.db import models


class Workflow(models.Model):
    DEFAULT_STATUS_CHOICE = "PREPROCESSING"
    DEFAULT_WORKFLOW_TYPE = "HEP_create"
    STATUS_CHOICES = (
        ("PREPROCESSING", "Preprocessing"),
        ("APPROVAL", "Approval"),
        ("POSTPROCESSING", "Postprocessing"),
    )

    WORKFLOW_TYPES = (
        ("HEP_CREATE", "HEP create"),
        ("HEP_UPDATE", "HEP update"),
        ("AUTHOR_CREATE", "Author create"),
        ("AUTHOR_UPDATE", "Author update"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    workflow_type = models.CharField(
        max_length=30,
        choices=WORKFLOW_TYPES,
        default=DEFAULT_WORKFLOW_TYPE,
    )
    data = models.JSONField()
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=DEFAULT_STATUS_CHOICE,
    )
    core = models.BooleanField()
    is_update = models.BooleanField()


class WorkflowTicket(models.Model):
    workflow_id = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    ticket_id = models.CharField(max_length=32)  # in SNOW it's GUID
