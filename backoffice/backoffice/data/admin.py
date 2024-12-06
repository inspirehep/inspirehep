from django.contrib import admin

from backoffice.data.models import DataWorkflow

from backoffice.common.admin import WorkflowsAdminSite, WorkflowAdmin


class DataWorkflowsAdminSite(WorkflowsAdminSite):
    pass


@admin.register(DataWorkflow)
class AuthorWorkflowAdmin(WorkflowAdmin):
    """
    Admin class for Workflow model. Define get, update and delete permissions.
    """

    pass
