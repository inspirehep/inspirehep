import uuid

from django.db import models

from backoffice.users.models import User
from backoffice.workflows.constants import (
    DECISION_CHOICES,
    DEFAULT_STATUS_CHOICE,
    DEFAULT_TICKET_TYPE,
    DEFAULT_WORKFLOW_TYPE,
    TICKET_TYPES,
    StatusChoices,
    WorkflowType,
)


class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    workflow_type = models.CharField(
        max_length=30,
        choices=WorkflowType.choices,
        default=DEFAULT_WORKFLOW_TYPE,
    )
    data = models.JSONField()
    status = models.CharField(
        max_length=30,
        choices=StatusChoices.choices,
        default=DEFAULT_STATUS_CHOICE,
    )
    core = models.BooleanField(default=False)
    is_update = models.BooleanField(default=False)

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)


class WorkflowTicket(models.Model):
    workflow_id = models.ForeignKey(
        Workflow, related_name="tickets", on_delete=models.CASCADE
    )
    ticket_id = models.CharField(
        max_length=32, null=False, blank=False
    )  # in SNOW it's GUID
    ticket_type = models.CharField(
        max_length=30, choices=TICKET_TYPES, default=DEFAULT_TICKET_TYPE
    )


class Decision(models.Model):
    user = models.ForeignKey(
        User, to_field="email", db_column="email", on_delete=models.CASCADE
    )
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    action = models.CharField(max_length=30, choices=DECISION_CHOICES)

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)
