from airflow.sdk import task
from airflow.utils.trigger_rule import TriggerRule
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


@task
def set_workflow_status_to_matching(**context):
    workflow_management_hook.set_workflow_status(
        status_name="matching", workflow_id=context["params"]["workflow_id"]
    )


@task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
def set_workflow_status_to_completed(**context):
    """
    Set the status of the workflow to "completed".
    """
    workflow_management_hook.set_workflow_status(
        status_name="completed", workflow_id=context["params"]["workflow_id"]
    )
