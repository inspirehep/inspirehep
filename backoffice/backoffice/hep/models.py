from django.db import models

from backoffice.hep.constants import (
    HEP_DECISION_CHOICES,
    HEP_DEFAULT_STATUS_CHOICE,
    HEP_DEFAULT_TICKET_TYPE,
    HEP_DEFAULT_WORKFLOW_TYPE,
    HEP_TICKET_TYPES,
    HepStatusChoices,
    HepWorkflowType,
)
from backoffice.common.models import BaseDecision, BaseWorkflow, BaseWorkflowTicket


class HepWorkflow(BaseWorkflow):
    workflow_type = models.CharField(
        max_length=30,
        choices=HepWorkflowType.choices,
        default=HEP_DEFAULT_WORKFLOW_TYPE,
    )
    status = models.CharField(
        max_length=30,
        choices=HepStatusChoices.choices,
        default=HEP_DEFAULT_STATUS_CHOICE,
    )


class HepWorkflowTicket(BaseWorkflowTicket):
    workflow = models.ForeignKey(
        HepWorkflow, related_name="tickets", on_delete=models.CASCADE
    )
    ticket_type = models.CharField(
        max_length=30, choices=HEP_TICKET_TYPES, default=HEP_DEFAULT_TICKET_TYPE
    )


class HepDecision(BaseDecision):
    workflow = models.ForeignKey(
        HepWorkflow, related_name="decisions", on_delete=models.CASCADE
    )
    action = models.CharField(max_length=30, choices=HEP_DECISION_CHOICES)
    value = models.CharField(max_length=30, default="", blank=True)
