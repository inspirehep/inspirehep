import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param
from author.author_create.shared_tasks import close_author_create_user_ticket
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from include.utils.set_workflow_status import set_workflow_status_to_error


@dag(
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    # TODO: what if callback fails? Data in backoffice not up to date!
    on_failure_callback=set_workflow_status_to_error,
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
    workflow_management_hook = WorkflowManagementHook(AUTHORS)

    @task()
    def set_author_create_workflow_status_to_completed(**context: dict) -> None:
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task()
    def set_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    # task definitions
    set_status_to_running_task = set_workflow_status_to_running()
    close_ticket_task = close_author_create_user_ticket()
    set_status_completed_task = set_author_create_workflow_status_to_completed()

    # task dependencies
    set_status_to_running_task >> close_ticket_task >> set_status_completed_task


author_create_rejected_dag()
