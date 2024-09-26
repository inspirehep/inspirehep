import datetime
import logging

from airflow.decorators import dag, task
from airflow.models.param import Param
from author.author_create.shared_tasks import close_author_create_user_ticket
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

logger = logging.getLogger(__name__)


@dag(
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
        "create_ticket": Param(type="boolean", default=False),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=set_workflow_status_to_error,  # TODO: what if callback fails? Data in backoffice not up to date!
)
def author_create_approved_dag():
    """Defines the DAG for the author creation workflow after curator's approval.

    Tasks:
    1. author_check_approval: Branching for the workflow: based on create_ticket
        parameter
    2. create_ticket_on_author_approval: Creates a ticket using the InspireHttpHook to
        call the API endpoint.
    3. create_author_on_inspire: Updates the author record on INSPIRE using the
        InspireHTTPRecordManagementHook.
    4. close_ticket: Closes the ticket associated with the author creation workflow.
    5. set_author_create_workflow_status_to_completed: Sets the status of the author
        creation workflow to 'completed'.

    """
    inspire_http_hook = InspireHttpHook()
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    workflow_management_hook = WorkflowManagementHook()
    workflow_ticket_management_hook = WorkflowTicketManagementHook()

    @task()
    def set_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
            collection=AUTHORS,
        )

    @task.branch()
    def author_check_approval_branch(**context: dict) -> None:
        """Branching for the workflow: based on create_ticket parameter
        dag goes either to create_ticket_on_author_approval task or
        directly to create_author_on_inspire
        """
        if context["params"]["create_ticket"]:
            return "create_author_create_curation_ticket"
        else:
            return "empty_task"

    @task
    def create_author_create_curation_ticket(**context: dict) -> None:
        endpoint = "api/tickets/create"
        request_data = {
            "functional_category": "",
            "workflow_id": context["params"]["workflow_id"],
            "subject": "test",  # TODO: update subject and description
            "description": "test",
            "caller_email": "",  # leave empty
            "template": "curation_needed_author",  # TODO: check template
        }
        response = inspire_http_hook.call_api(
            endpoint=endpoint, data=request_data, method="POST"
        )
        workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_id=response.json()["ticket_id"],
            ticket_type="author_create_curation",
        )

    @task(do_xcom_push=True)
    def create_author_on_inspire(**context: dict) -> str:
        workflow_data = workflow_management_hook.get_workflow(
            workflow_id=context["params"]["workflow_id"]
        )
        response = inspire_http_record_management_hook.post_record(
            data=workflow_data["data"], pid_type="authors"
        )
        status = get_wf_status_from_inspire_response(response)
        if response.ok:
            control_number = response.json()["metadata"]["control_number"]
            logger.info(f"Created author with control number: {control_number}")
            workflow_data["data"]["control_number"] = control_number
            workflow_management_hook.partial_update_workflow(
                workflow_id=context["params"]["workflow_id"],
                workflow_partial_update_data={"data": workflow_data["data"]},
                collection=AUTHORS,
            )
        return status

    @task.branch()
    def author_create_success_branch(**context: dict) -> str:
        ti = context["ti"]
        workflow_status = ti.xcom_pull(task_ids="create_author_on_inspire")
        if workflow_status == "completed":
            return "author_check_approval_branch"
        else:
            return "set_author_create_workflow_status_to_error"

    @task()
    def set_author_create_workflow_status_to_completed(**context: dict) -> None:
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
            collection=AUTHORS,
        )

    @task
    def empty_task() -> None:
        # Logic to combine the results of branches
        pass

    @task()
    def set_author_create_workflow_status_to_error(**context: dict) -> None:
        ti = context["ti"]
        status_name = ti.xcom_pull(task_ids="create_author_on_inspire")
        logger.info(f"Workflow status: {status_name}")
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
            collection=AUTHORS,
        )

    # task definitions
    set_status_to_running_task = set_workflow_status_to_running()
    create_author_on_inspire_task = create_author_on_inspire()
    author_create_success_branch_task = author_create_success_branch()
    author_check_approval_branch_task = author_check_approval_branch()
    close_author_create_user_ticket_task = close_author_create_user_ticket()
    create_author_create_curation_ticket_task = create_author_create_curation_ticket()
    set_workflow_status_to_completed_task = (
        set_author_create_workflow_status_to_completed()
    )
    set_workflow_status_to_error_task = set_author_create_workflow_status_to_error()
    combine_ticket_and_no_ticket_task = empty_task()

    # task dependencies
    ticket_branch = create_author_create_curation_ticket_task
    (
        ticket_branch
        >> close_author_create_user_ticket_task
        >> set_workflow_status_to_completed_task
    )

    no_ticket_branch = combine_ticket_and_no_ticket_task
    (
        no_ticket_branch
        >> close_author_create_user_ticket_task
        >> set_workflow_status_to_completed_task
    )

    author_check_approval_branch_task >> [ticket_branch, no_ticket_branch]
    (
        set_status_to_running_task
        >> create_author_on_inspire_task
        >> author_create_success_branch_task
    )
    author_create_success_branch_task >> [
        author_check_approval_branch_task,
        set_workflow_status_to_error_task,
    ]


author_create_approved_dag()
