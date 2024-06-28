import uuid

from django.db import models

from .constants import (
    DEFAULT_STATUS_CHOICE,
    DEFAULT_TICKET_TYPE,
    DEFAULT_WORKFLOW_TYPE,
    STATUS_CHOICES,
    TICKET_TYPES,
    WORKFLOW_TYPES,
)


class Workflow(models.Model):
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
    core = models.BooleanField(default=False)
    is_update = models.BooleanField(default=False)

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)


class WorkflowTicket(models.Model):
    workflow_id = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    ticket_id = models.CharField(max_length=32, null=False, blank=False)  # in SNOW it's GUID
    ticket_type = models.CharField(max_length=30, choices=TICKET_TYPES, default=DEFAULT_TICKET_TYPE)
