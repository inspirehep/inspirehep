import datetime
import logging

from airflow.decorators import dag, task
from airflow.models.param import Param
from airflow.utils.trigger_rule import TriggerRule
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from hooks.backoffice.workflow_ticket_management_hook import (
    AuthorWorkflowTicketManagementHook,
)
from hooks.inspirehep.inspire_http_hook import (
    AUTHOR_CURATION_FUNCTIONAL_CATEGORY,
    InspireHttpHook,
)
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import task_failure_alert
from include.utils.set_workflow_status import (
    get_wf_status_from_inspire_response,
    set_workflow_status_to_error,
)
from include.utils.tickets import get_ticket_by_type

logger = logging.getLogger(__name__)


@dag(
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
        "collection": Param(type="string", default=AUTHORS),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=set_workflow_status_to_error,  # TODO: what if callback fails? Data in backoffice not up to date!
    tags=[AUTHORS],
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
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    workflow_ticket_management_hook = AuthorWorkflowTicketManagementHook()

    @task(on_failure_callback=task_failure_alert)
    def set_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task.branch()
    def author_check_approval_branch(**context: dict) -> None:
        """Branching for the workflow: based on value parameter
        dag goes either to create_ticket_on_author_approval task or
        directly to create_author_on_inspire
        """
        if context["params"]["data"]["value"] == "accept_curate":
            return "create_author_create_curation_ticket"
        else:
            return "close_author_create_user_ticket"

    @task(on_failure_callback=task_failure_alert)
    def create_author_create_curation_ticket(**context: dict) -> None:
        workflow_data = context["params"]["workflow"]["data"]
        email = workflow_data["acquisition_source"]["email"]

        bai = f"[{workflow_data.get('bai')}]" if workflow_data.get("bai") else ""

        control_number = context["ti"].xcom_pull(
            task_ids="create_author_on_inspire", key="control_number"
        )

        inspire_http_hook.get_conn()

        response = inspire_http_hook.create_ticket(
            AUTHOR_CURATION_FUNCTIONAL_CATEGORY,
            "curation_needed_author",
            f"Curation needed for author "
            f"{workflow_data.get('name').get('preferred_name')} {bai}",
            email,
            {
                "email": email,
                "record_url": f"{inspire_http_hook.base_url}/authors/{control_number}",
            },
        )

        workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_id=response.json()["ticket_id"],
            ticket_type="author_create_curation",
        )

    @task(do_xcom_push=True, on_failure_callback=task_failure_alert)
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
            context["ti"].xcom_push(key="control_number", value=control_number)
            logger.info(f"Created author with control number: {control_number}")
            workflow_data["data"]["control_number"] = control_number
            workflow_management_hook.partial_update_workflow(
                workflow_id=context["params"]["workflow_id"],
                workflow_partial_update_data={"data": workflow_data["data"]},
            )
        logger.info(f"Workflow status: {status}")
        return status

    @task.branch()
    def author_create_success_branch(**context: dict) -> str:
        ti = context["ti"]
        workflow_status = ti.xcom_pull(task_ids="create_author_on_inspire")
        if workflow_status == "completed":
            return "author_check_approval_branch"
        else:
            return "set_author_create_workflow_status_to_error"

    @task(on_failure_callback=task_failure_alert)
    def set_author_create_workflow_status_to_completed(**context: dict) -> None:
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task(
        trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
        on_failure_callback=task_failure_alert,
    )
    def close_author_create_user_ticket(**context: dict) -> None:
        ticket_id = get_ticket_by_type(
            context["params"]["workflow"], "author_create_user"
        )["ticket_id"]

        workflow_data = context["params"]["workflow"]["data"]
        email = workflow_data["acquisition_source"]["email"]
        control_number = context["ti"].xcom_pull(
            task_ids="create_author_on_inspire", key="control_number"
        )

        inspire_http_hook.get_conn()

        request_data = {
            "user_name": workflow_data["acquisition_source"].get("given_names", email),
            "author_name": workflow_data.get("name").get("preferred_name"),
            "record_url": f"{inspire_http_hook.base_url}/authors/{control_number}",
        }
        inspire_http_hook.close_ticket(ticket_id, "user_accepted_author", request_data)

    @task(on_failure_callback=task_failure_alert)
    def set_author_create_workflow_status_to_error(**context: dict) -> None:
        ti = context["ti"]
        status_name = ti.xcom_pull(task_ids="create_author_on_inspire")
        logger.info(f"Workflow status: {status_name}")
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
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

    # task dependencies
    (
        set_status_to_running_task
        >> create_author_on_inspire_task
        >> author_create_success_branch_task
    )
    author_create_success_branch_task >> [
        author_check_approval_branch_task,
        set_workflow_status_to_error_task,
    ]
    (
        [
            author_check_approval_branch_task
            >> create_author_create_curation_ticket_task,
            author_check_approval_branch_task,
        ]
        >> close_author_create_user_ticket_task
        >> set_workflow_status_to_completed_task
    )


author_create_approved_dag()
