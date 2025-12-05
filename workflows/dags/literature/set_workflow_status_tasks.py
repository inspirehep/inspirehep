from airflow.sdk import task
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)

workflow_management_hook = WorkflowManagementHook(HEP)


@task
def set_workflow_status_to_running(
    **context,
):
    """
    Set the status of the workflow to the given status name.
    """
    workflow_management_hook.set_workflow_status(
        status_name="running", workflow_id=context["params"]["workflow_id"]
    )
