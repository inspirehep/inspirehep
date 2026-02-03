from airflow.exceptions import AirflowFailException
from airflow.sdk import task
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)


@task(on_failure_callback=None)
def validate_record(**context):
    workflow_id = context["params"]["workflow_id"]
    workflow_management_hook = WorkflowManagementHook(HEP)
    workflow_data = workflow_management_hook.get_workflow(workflow_id)

    validation_errors = workflow_data.get("validation_errors")

    if validation_errors:
        workflow_management_hook.set_workflow_status(
            status_name="error_validation", workflow_id=workflow_id
        )
        raise AirflowFailException(
            f"Validation failed for workflow {workflow_id}: {validation_errors}"
        )
