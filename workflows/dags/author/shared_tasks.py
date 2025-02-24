from airflow.decorators import task
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook


@task()
def set_submission_number(workflow=None, **context):
    workflow_data = (
        context["params"]["workflow"]["data"] if not workflow else workflow["data"]
    )

    acquisition_source = workflow_data.get("acquisition_source", {})
    acquisition_source["submission_number"] = context["params"]["workflow_id"]

    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    return workflow_management_hook.partial_update_workflow(
        workflow_id=context["params"]["workflow_id"],
        workflow_partial_update_data={
            "data": {
                **workflow_data,
                "acquisition_source": acquisition_source,
            }
        },
    ).json()
