from airflow.sdk import task
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)
from include.utils import s3
from include.utils.constants import STATUS_RUNNING

workflow_management_hook = WorkflowManagementHook(HEP)
s3_store = s3.S3JsonStore(aws_conn_id="s3_conn")


@task
def set_workflow_status_to_running(
    **context,
):
    """
    Set the status of the workflow to the given status name.
    """
    response = workflow_management_hook.set_workflow_status(
        status_name=STATUS_RUNNING,
        workflow_id=context["params"]["workflow_id"],
    )
    s3_store.write_workflow(response.json())
