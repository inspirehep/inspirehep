from django.contrib import admin
from django.db.models import JSONField
from django_json_widget.widgets import JSONEditorWidget

from backoffice.management.permissions import IsAdminOrCuratorUser
from backoffice.workflows.models import Workflow


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


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
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

    formfield_overrides = {
        JSONField: {"widget": JSONEditorWidget},
    }

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
