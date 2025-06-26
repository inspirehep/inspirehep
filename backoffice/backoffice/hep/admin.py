from django.contrib import admin

from backoffice.hep.models import (
    HepWorkflow,
    HepDecision,
    HepWorkflowTicket,
)
from backoffice.common.admin import (
    BaseDecisionAdmin,
    BaseWorkflowTicketAdmin,
    BaseWorkflowAdmin,
    BaseWorkflowsDecisionsInline,
    BaseWorkflowTicketsInline,
)


class HepWorkflowsDecisionsInline(BaseWorkflowsDecisionsInline):
    model = HepDecision


class HepWorkflowTicketsInline(BaseWorkflowTicketsInline):
    model = HepWorkflowTicket


@admin.register(HepWorkflow)
class WorkflowAdmin(BaseWorkflowAdmin):
    inlines = [HepWorkflowsDecisionsInline, HepWorkflowTicketsInline]


@admin.register(HepDecision)
class DecisionAdmin(BaseDecisionAdmin):
    pass


@admin.register(HepWorkflowTicket)
class WorkflowTicketAdmin(BaseWorkflowTicketAdmin):
    pass
