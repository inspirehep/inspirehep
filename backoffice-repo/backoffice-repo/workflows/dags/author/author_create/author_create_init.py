import datetime
import logging

from airflow.decorators import dag, task
from airflow.models.param import Param
from hooks.backoffice.workflow_management_hook import WorkflowManagementHook
from hooks.backoffice.workflow_ticket_management_hook import (
    WorkflowTicketManagementHook,
)
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils.set_workflow_status import set_workflow_status_to_error

logger = logging.getLogger(__name__)


@dag(
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule_interval=None,
    catchup=False,
    # TODO: what if callback fails? Data in backoffice not up to date!
    on_failure_callback=set_workflow_status_to_error,
)
def author_create_initialization_dag():
    """
    Initialize a DAG for author create workflow.

    Tasks:
    1. create_ticket_on_author_create: Creates a ticket using the InspireHttpHook
        to call the API endpoint.
    2. set_author_create_workflow_status_to_approval: Sets the workflow status
        to "approval" using the WorkflowManagementHook.

    """
    inspire_http_hook = InspireHttpHook()
    workflow_management_hook = WorkflowManagementHook()
    workflow_ticket_management_hook = WorkflowTicketManagementHook()

    @task()
    def set_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task()
    def set_schema(**context):
        schema = "https://inspirehep.net/schemas/records/authors.json"
        workflow_management_hook.partial_update_workflow(
            workflow_id=context["params"]["workflow_id"],
            workflow_partial_update_data={"data": {"$schema": schema}},
        )

    @task()
    def create_author_create_user_ticket(**context: dict) -> None:
        endpoint = "/api/tickets/create"
        request_data = {
            "functional_category": "Author curation",
            "template": "user_new_author",
            "workflow_id": context["params"]["workflow_id"],
            "subject": "test",  # TODO: set the subject and description
            "description": "test",
            "caller_email": "",  # leave empty
        }
        response = inspire_http_hook.call_api(
            endpoint=endpoint, data=request_data, method="POST"
        )
        logger.info(f"Ticket created. Response status code: {response.status_code}")
        logger.info(response.json())
        workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_type="author_create_user",
            ticket_id=response.json()["ticket_id"],
        )

    @task()
    def set_author_create_workflow_status_to_approval(**context: dict) -> None:
        status_name = "approval"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    # task dependencies
    (
        set_workflow_status_to_running()
        >> set_schema()
        >> create_author_create_user_ticket()
        >> set_author_create_workflow_status_to_approval()
    )


author_create_initialization_dag()
