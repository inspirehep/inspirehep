from django.db import models

from backoffice.authors.constants import (
    AUTHOR_DECISION_CHOICES,
    AUTHOR_DEFAULT_STATUS_CHOICE,
    AUTHOR_DEFAULT_TICKET_TYPE,
    AUTHOR_DEFAULT_WORKFLOW_TYPE,
    AUTHOR_TICKET_TYPES,
    AuthorStatusChoices,
    AuthorWorkflowType,
)
from backoffice.common.models import BaseDecision, BaseWorkflow, BaseWorkflowTicket


class AuthorWorkflow(BaseWorkflow):
    workflow_type = models.CharField(
        max_length=30,
        choices=AuthorWorkflowType.choices,
        default=AUTHOR_DEFAULT_WORKFLOW_TYPE,
    )
    status = models.CharField(
        max_length=30,
        choices=AuthorStatusChoices.choices,
        default=AUTHOR_DEFAULT_STATUS_CHOICE,
    )


class AuthorWorkflowTicket(BaseWorkflowTicket):
    workflow = models.ForeignKey(
        AuthorWorkflow, related_name="tickets", on_delete=models.CASCADE
    )
    ticket_type = models.CharField(
        max_length=30, choices=AUTHOR_TICKET_TYPES, default=AUTHOR_DEFAULT_TICKET_TYPE
    )


class AuthorDecision(BaseDecision):
    workflow = models.ForeignKey(
        AuthorWorkflow, related_name="decisions", on_delete=models.CASCADE
    )
    action = models.CharField(max_length=30, choices=AUTHOR_DECISION_CHOICES)
