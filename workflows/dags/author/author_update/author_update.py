import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from hooks.backoffice.workflow_ticket_management_hook import (
    WorkflowTicketManagementHook,
)
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.set_workflow_status import (
    get_wf_status_from_inspire_response,
    set_workflow_status_to_error,
)


@dag(
    start_date=datetime.datetime(2024, 5, 5),
    schedule_interval=None,
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
    },
    catchup=False,
    on_failure_callback=set_workflow_status_to_error,  # TODO: what if callback fails? Data in backoffice not up to date!
)
def author_update_dag():
    """
    DAG for updating author on Inspire.

    Tasks:
    1. Sets the workflow status to "running".
    2. Creates a ticket for author updates.
    3. Updates the author information in Inspire.
    4. Sets the workflow status to "completed".

    """
    inspire_http_hook = InspireHttpHook()
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    workflow_management_hook = WorkflowManagementHook()
    workflow_ticket_management_hook = WorkflowTicketManagementHook()

    @task()
    def set_author_update_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
            typ=AUTHORS,
        )

    @task()
    def create_ticket_on_author_update(**context):
        endpoint = "/tickets/create-with-template"
        request_data = {
            "functional_category": "Author updates",
            "template": "curator_update_author",
            "workflow_id": context["params"]["workflow_id"],
            "subject": "test",
            "description": "test",
            "caller_email": "",
        }
        response = inspire_http_hook.call_api(
            endpoint=endpoint, data=request_data, method="POST"
        )
        workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_type="author_update_curation",
            ticket_id=response.json()["ticket_id"],
        )

    @task()
    def update_author_on_inspire(**context):
        workflow_data = workflow_management_hook.get_workflow(
            workflow_id=context["params"]["workflow_id"]
        )
        control_number = workflow_data["data"]["control_number"]
        record_data = inspire_http_record_management_hook.get_record(
            pid_type="authors", control_number=control_number
        )
        updated_record_data = record_data["metadata"].update(workflow_data["data"])
        response = inspire_http_record_management_hook.update_record(
            data=updated_record_data,
            pid_type="authors",
            control_number=control_number,
            revision_id=record_data["revision_id"] + 1,
        )
        status = get_wf_status_from_inspire_response(response)
        return status

    @task()
    def set_author_update_workflow_status_to_completed(**context):
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
            typ=AUTHORS,
        )

    @task.branch(provide_context=True)
    def author_update_success_branch(**context):
        ti = context["ti"]
        workflow_status = ti.xcom_pull(task_ids="update_author_on_inspire")

        if workflow_status == "completed":
            return "set_author_update_workflow_status_to_completed"
        else:
            return "set_author_update_workflow_status_to_error"

    @task()
    def set_author_update_workflow_status_to_error(**context):
        ti = context["ti"]
        status_name = ti.xcom_pull(task_ids="update_author_on_inspire")
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
            typ=AUTHORS,
        )

    # task definitions
    set_workflow_status_to_running_task = set_author_update_workflow_status_to_running()
    create_ticket_task = create_ticket_on_author_update()
    update_author_on_inspire_task = update_author_on_inspire()
    set_status_to_completed_task = set_author_update_workflow_status_to_completed()
    set_status_to_error_task = set_author_update_workflow_status_to_error()
    author_update_success_branch_task = author_update_success_branch()

    # task dependencies
    (
        set_workflow_status_to_running_task
        >> create_ticket_task
        >> update_author_on_inspire_task
        >> author_update_success_branch_task
        >> [set_status_to_error_task, set_status_to_completed_task]
    )


author_update_dag_instance = author_update_dag()
