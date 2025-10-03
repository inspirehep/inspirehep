import datetime
import logging

from airflow.decorators import dag, task
from airflow.models import Variable
from airflow.providers.standard.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.sdk import Param
from author.shared_tasks import set_submission_number
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from hooks.backoffice.workflow_ticket_management_hook import (
    AuthorWorkflowTicketManagementHook,
)
from hooks.inspirehep.inspire_http_hook import (
    AUTHOR_SUBMIT_FUNCTIONAL_CATEGORY,
    InspireHttpHook,
)
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
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    workflow_ticket_management_hook = AuthorWorkflowTicketManagementHook()

    @task
    def set_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task
    def set_schema(**context):
        schema = Variable.get("author_schema")
        return workflow_management_hook.partial_update_workflow(
            workflow_id=context["params"]["workflow_id"],
            workflow_partial_update_data={
                "data": {**context["params"]["workflow"]["data"], "$schema": schema}
            },
        ).json()

    @task
    def create_author_create_user_ticket(**context: dict) -> None:
        workflow_data = context["params"]["workflow"]["data"]
        email = workflow_data["acquisition_source"]["email"]

        if get_ticket_by_type(context["params"]["workflow"], "author_create_user"):
            return

        response = inspire_http_hook.create_ticket(
            AUTHOR_SUBMIT_FUNCTIONAL_CATEGORY,
            "curator_new_author",
            f"Your suggestion to INSPIRE: author "
            f"{workflow_data.get('name').get('preferred_name')}",
            workflow_data["acquisition_source"]["email"],
            {
                "email": email,
                "obj_url": inspire_http_hook.get_backoffice_url(
                    context["params"]["workflow_id"]
                ),
            },
        )

        ticket_id = response.json()["ticket_id"]

        response = inspire_http_hook.reply_ticket(
            ticket_id,
            "user_new_author",
            {
                "user_name": workflow_data["acquisition_source"].get(
                    "given_names", email
                ),
                "author_name": workflow_data.get("name").get("preferred_name"),
            },
            email,
        )

        workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_type="author_create_user",
            ticket_id=ticket_id,
        )

    @task.branch
    def author_check_approval_branch(**context: dict) -> None:
        """Branching for the workflow: based on value parameter
        dag goes either to create_ticket_on_author_approval task or
        directly to create_author_on_inspire
        """

        workflow_data = context["params"]["workflow"]["data"]
        decisions = workflow_data.get("decisions")
        if not decisions:
            return "set_author_create_workflow_status_to_approval"
        elif decisions[0]["value"] in ["accept_curate", "accept"]:
            return "trigger_accept"
        return "trigger_reject"

    @task
    def set_author_create_workflow_status_to_approval(**context: dict) -> None:
        status_name = "approval"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    data_with_schema = set_schema()
    set_submission_number_task = set_submission_number(data_with_schema)

    trigger_accept = TriggerDagRunOperator(
        task_id="trigger_accept",
        trigger_dag_id="author_create_approved_dag",
        conf='{"workflow": '
        '{{ti.xcom_pull(task_ids="set_submission_number") | tojson}}}',
    )

    trigger_reject = TriggerDagRunOperator(
        task_id="trigger_reject",
        trigger_dag_id="author_create_rejected_dag",
        conf='{"workflow": '
        '{{ti.xcom_pull(task_ids="set_submission_number") | tojson}}}',
    )

    (
        set_workflow_status_to_running()
        >> data_with_schema
        >> set_submission_number_task
        >> create_author_create_user_ticket()
        >> author_check_approval_branch()
        >> [
            trigger_accept,
            trigger_reject,
            set_author_create_workflow_status_to_approval(),
        ]
    )


author_create_initialization_dag()
