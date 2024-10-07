from django.contrib import admin
from django.db.models import JSONField
from django_json_widget.widgets import JSONEditorWidget

from backoffice.management.permissions import IsAdminOrCuratorUser
from backoffice.workflows.models import Decision, Workflow, WorkflowTicket


class WorkflowsAdminSite(admin.AdminSite):
    """
    Custom admin site for managing workflows.

    This admin site extends the default Django admin site to include additional
    functionality for managing workflows. It checks whether the user has the
    necessary permissions to access the admin site by verifying that they are
    an active user and either a superuser or a member of the 'curator' group.

    Attributes:
        None

    Methods:
        has_permission(request): Checks whether the user has permission to access
            the admin site.
    """

    def has_permission(self, request):
        return request.user.is_active and (
            request.user.is_superuser
            or request.user.groups.filter(name="curator").exists()
        )


class BaseModelAdmin(admin.ModelAdmin):
    def has_view_permission(self, request, obj=None):
        """
        Returns True if the user has permission to view the Workflow model.
        """
        permission_check = IsAdminOrCuratorUser()
        return request.user.is_superuser or permission_check.has_permission(
            request, self
        )

    def has_change_permission(self, request, obj=None):
        """
        Returns True if the user has permission to change the Workflow model.
        """
        permission_check = IsAdminOrCuratorUser()
        return request.user.is_superuser or permission_check.has_permission(
            request, self
        )

    def has_delete_permission(self, request, obj=None):
        """
        Returns True if the user has permission to delete the Workflow model.
        """
        permission_check = IsAdminOrCuratorUser()
        return request.user.is_superuser or permission_check.has_permission(
            request, self
        )

    formfield_overrides = {
        JSONField: {"widget": JSONEditorWidget},
    }


class WorkflowsDecisionsInline(admin.StackedInline):
    model = Decision
    extra = 0
    can_delete = False
    show_change_link = True
    readonly_fields = ["action_value", "_updated_at", "user"]

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description="action")
    def action_value(self, obj):
        return obj.action


class WorkflowTicketsInline(admin.StackedInline):
    model = WorkflowTicket
    extra = 0
    can_delete = False
    show_change_link = True
    readonly_fields = ["ticket_id", "ticket_type", "_updated_at"]

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Workflow)
class WorkflowAdmin(BaseModelAdmin):
    """
    Admin class for Workflow model. Define get, update and delete permissions.
    """

    ordering = ("-_updated_at",)
    search_fields = ["id", "data"]
    list_display = (
        "id",
        "workflow_type",
        "status",
        "core",
        "is_update",
        "_created_at",
        "_updated_at",
    )
    list_filter = [
        "workflow_type",
        "status",
        "core",
        "is_update",
        "_created_at",
        "_updated_at",
    ]

    inlines = [WorkflowsDecisionsInline, WorkflowTicketsInline]


@admin.register(Decision)
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


@admin.register(WorkflowTicket)
class WorkflowTicketAdmin(BaseModelAdmin):
    """
    Admin class for WorkflowTicket model. Define get, update and delete permissions.
    """

    ordering = ("-_updated_at",)
    search_fields = ["id", "ticket_id"]
    list_display = ("id", "ticket_id", "ticket_type", "workflow_id")
    list_filter = ["workflow_id", "ticket_type"]
