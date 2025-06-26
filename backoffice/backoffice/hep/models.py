from django.db import models

from backoffice.hep.constants import (
    DECISION_CHOICES,
    DEFAULT_STATUS_CHOICE,
    DEFAULT_TICKET_TYPE,
    DEFAULT_WORKFLOW_TYPE,
    TICKET_TYPES,
    StatusChoices,
    HepWorkflowType,
)
from backoffice.common.models import BaseDecision, BaseWorkflow, BaseWorkflowTicket


class HepWorkflow(BaseWorkflow):
    workflow_type = models.CharField(
        max_length=30,
        choices=HepWorkflowType.choices,
        default=DEFAULT_WORKFLOW_TYPE,
    )
    status = models.CharField(
        max_length=30,
        choices=StatusChoices.choices,
        default=DEFAULT_STATUS_CHOICE,
    )


class HepWorkflowTicket(BaseWorkflowTicket):
    workflow = models.ForeignKey(
        HepWorkflow, related_name="tickets", on_delete=models.CASCADE
    )
    ticket_type = models.CharField(
        max_length=30, choices=TICKET_TYPES, default=DEFAULT_TICKET_TYPE
    )


class HepDecision(BaseDecision):
    workflow = models.ForeignKey(
        HepWorkflow, related_name="decisions", on_delete=models.CASCADE
    )
    action = models.CharField(max_length=30, choices=DECISION_CHOICES)
