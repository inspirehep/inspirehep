from django.contrib import admin

from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
    AuthorWorkflowTicket,
)
from backoffice.common.admin import (
    BaseDecisionAdmin,
    BaseWorkflowTicketAdmin,
    BaseWorkflowAdmin,
    BaseWorkflowsDecisionsInline,
    BaseWorkflowTicketsInline,
)


class AuthorWorkflowsDecisionsInline(BaseWorkflowsDecisionsInline):
    model = AuthorDecision


class AuthorWorkflowTicketsInline(BaseWorkflowTicketsInline):
    model = AuthorWorkflowTicket


@admin.register(AuthorWorkflow)
class WorkflowAdmin(BaseWorkflowAdmin):
    inlines = [AuthorWorkflowsDecisionsInline, AuthorWorkflowTicketsInline]


@admin.register(AuthorDecision)
class DecisionAdmin(BaseDecisionAdmin):
    pass


@admin.register(AuthorWorkflowTicket)
class WorkflowTicketAdmin(BaseWorkflowTicketAdmin):
    pass
