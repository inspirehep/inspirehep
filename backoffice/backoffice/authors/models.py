from django.db import models

from backoffice.authors.constants import (
    DECISION_CHOICES,
    DEFAULT_TICKET_TYPE,
    TICKET_TYPES,
)
from backoffice.users.models import User
from backoffice.common.models import AbstractWorkflow


class AuthorWorkflow(AbstractWorkflow):
    pass


class AuthorWorkflowTicket(models.Model):
    workflow = models.ForeignKey(
        AuthorWorkflow, related_name="tickets", on_delete=models.CASCADE
    )
    ticket_id = models.CharField(
        max_length=32, null=False, blank=False
    )  # in SNOW it's GUID
    ticket_type = models.CharField(
        max_length=30, choices=TICKET_TYPES, default=DEFAULT_TICKET_TYPE
    )
    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)


class AuthorDecision(models.Model):
    user = models.ForeignKey(
        User,
        to_field="email",
        db_column="email",
        on_delete=models.CASCADE,
    )
    workflow = models.ForeignKey(
        AuthorWorkflow, related_name="decisions", on_delete=models.CASCADE
    )
    action = models.CharField(max_length=30, choices=DECISION_CHOICES)

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)
