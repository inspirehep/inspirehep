from django.contrib import admin

from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
    AuthorWorkflowTicket,
)

from backoffice.common.admin import WorkflowsAdminSite, WorkflowAdmin, BaseModelAdmin


class AuthorWorkflowsAdminSite(WorkflowsAdminSite):
    pass


class AuthorWorkflowsDecisionsInline(admin.StackedInline):
    model = AuthorDecision
    extra = 0
    can_delete = False
    show_change_link = True
    readonly_fields = ["action_value", "_updated_at", "user"]

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description="action")
    def action_value(self, obj):
        return obj.action


class AuthorWorkflowTicketsInline(admin.StackedInline):
    model = AuthorWorkflowTicket
    extra = 0
    can_delete = False
    show_change_link = True
    readonly_fields = ["ticket_id", "ticket_type", "_updated_at"]

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(AuthorWorkflow)
class AuthorWorkflowAdmin(WorkflowAdmin):
    """
    Admin class for Workflow model. Define get, update and delete permissions.
    """

    inlines = [AuthorWorkflowsDecisionsInline, AuthorWorkflowTicketsInline]


@admin.register(AuthorDecision)
class DecisionAdmin(BaseModelAdmin):
    """
    Admin class for Decision model. Define get, update and delete permissions.
    """

    ordering = ("-_updated_at",)
    search_fields = ["id", "data"]
    list_display = ("id", "action_value", "user", "workflow_id")
    list_filter = [
        "action",
        "user",
    ]

    @admin.display(description="action")
    def action_value(self, obj):
        return obj.action


@admin.register(AuthorWorkflowTicket)
class WorkflowTicketAdmin(BaseModelAdmin):
    """
    Admin class for WorkflowTicket model. Define get, update and delete permissions.
    """

    ordering = ("-_updated_at",)
    search_fields = ["id", "ticket_id"]
    list_display = ("id", "ticket_id", "ticket_type", "workflow_id")
    list_filter = ["workflow_id", "ticket_type"]
