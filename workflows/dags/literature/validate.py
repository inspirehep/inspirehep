from airflow.exceptions import AirflowFailException
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Variable, task
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)
from include.utils import s3
from include.utils.constants import STATUS_ERROR_VALIDATION


@task(on_failure_callback=None)
def validate_record(**context):
    workflow_id = context["params"]["workflow_id"]
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    bucket_name = Variable.get("s3_bucket_name")
    workflow_management_hook = WorkflowManagementHook(HEP)
    workflow_data = workflow_management_hook.get_workflow(workflow_id, validate=True)

    validation_errors = workflow_data.get("validation_errors")

    if validation_errors:
        workflow_management_hook.set_workflow_status(
            status_name=STATUS_ERROR_VALIDATION, workflow_id=workflow_id
        )
        raise AirflowFailException(
            f"Validation failed for workflow {workflow_id}: {validation_errors}"
        )
    s3.write_workflow(s3_hook, workflow_data, bucket_name)
