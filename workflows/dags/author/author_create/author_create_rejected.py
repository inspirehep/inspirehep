import datetime
import logging

from airflow.decorators import dag, task
from airflow.sdk import Param
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.tickets import get_ticket_by_type

logger = logging.getLogger(__name__)


@dag(
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=FailedDagNotifierSetError(collection=AUTHORS),
    tags=[AUTHORS],
)
def author_create_rejected_dag() -> None:
    """
    This DAG defines the workflow for handling an author after reject action.

    Tasks:
    1. close_ticket_on_author_reject: Closes the ticket associated with the rejected
        author.
    2. set_author_create_workflow_status_to_completed: Sets the status of
        the author creation workflow to 'completed'.
    """
    inspire_http_hook = InspireHttpHook()
    workflow_management_hook = WorkflowManagementHook(AUTHORS)

    @task
    def set_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow"]["id"]
        )

    @task
    def close_author_create_user_ticket(**context: dict) -> None:
        logger.info("Closing ticket for rejected author")
        ticket_id = get_ticket_by_type(
            context["params"]["workflow"], "author_create_user"
        )["ticket_id"]
        inspire_http_hook.close_ticket(ticket_id)

    @task
    def set_author_create_workflow_status_to_completed(**context: dict) -> None:
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow"]["id"]
        )

    # task definitions
    set_status_to_running_task = set_workflow_status_to_running()
    close_ticket_task = close_author_create_user_ticket()
    set_status_completed_task = set_author_create_workflow_status_to_completed()

    # task dependencies
    set_status_to_running_task >> close_ticket_task >> set_status_completed_task


author_create_rejected_dag()
