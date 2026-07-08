import datetime
import logging

from airflow.sdk import Param, Variable, dag, task
from airflow.task.trigger_rule import TriggerRule
from author.shared_tasks import set_submission_number
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from hooks.inspirehep.inspire_http_hook import (
    AUTHOR_CURATION_FUNCTIONAL_CATEGORY,
    AUTHOR_SUBMIT_FUNCTIONAL_CATEGORY,
    InspireHttpHook,
)
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.constants import (
    DECISION_ACCEPT,
    DECISION_ACCEPT_CURATE,
    STATUS_APPROVAL,
    TICKET_AUTHOR_CREATE,
    TICKET_AUTHOR_CURATION,
)
from include.utils.set_workflow_status import (
    get_wf_status_from_inspire_response,
)
from include.utils.tickets import (
    close_ticket,
    create_ticket,
    get_ticket_by_type,
    reply_ticket,
)

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
    Initialize an author-create workflow and drive it through approval.

    The DAG:
    1. Marks the workflow as running and ensures the payload has the author schema
       and submission number.
    2. Creates the initial submitter ticket if it does not already exist.
    3. Waits for a backoffice decision; if no decision exists yet, the workflow is
       moved to ``approval`` and the DAG stops.
    4. Once approved, creates the author record in INSPIRE.
    5. Branches to optional curation follow-up for ``accept_curate`` decisions,
       closes the submitter ticket, and finishes by marking the workflow completed
       or error depending on the record-creation result.
    """
    inspire_http_hook = InspireHttpHook()
    workflow_management_hook = WorkflowManagementHook(AUTHORS)

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
        workflow_id = context["params"]["workflow_id"]
        email = workflow_data["acquisition_source"]["email"]

        if get_ticket_by_type(context["params"]["workflow"], "author_create_user"):
            return

        ticket_id = create_ticket(
            inspire_http_hook,
            AUTHOR_SUBMIT_FUNCTIONAL_CATEGORY,
            "curator_new_author",
            f"Your suggestion to INSPIRE: author "
            f"{workflow_data.get('name').get('preferred_name')}",
            email,
            {
                "email": email,
                "url": inspire_http_hook.get_backoffice_url(AUTHORS, workflow_id),
            },
            TICKET_AUTHOR_CREATE,
            workflow_id,
            AUTHORS,
        )

        reply_ticket(
            inspire_http_hook,
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

    @task.short_circuit
    def await_author_check_approval(**context: dict) -> None:
        """Pause the DAG until the workflow has at least one decision."""
        workflow_id = context["params"]["workflow_id"]
        workflow_data = workflow_management_hook.get_workflow(workflow_id)

        decisions = workflow_data.get("decisions")
        if not decisions:
            workflow_management_hook.set_workflow_status(
                status_name=STATUS_APPROVAL,
                workflow_id=workflow_id,
            )
            return False

        context["ti"].xcom_push(key="decision", value=decisions[0]["action"])
        return True

    @task.branch
    def author_check_approval_branch(**context: dict) -> None:
        """Branching for the workflow: based on value parameter
        dag goes either to create_ticket_on_author_approval task or
        directly to create_author_on_inspire
        """
        decision = context["ti"].xcom_pull(
            task_ids="await_author_check_approval", key="decision"
        )

        if decision in [DECISION_ACCEPT_CURATE, DECISION_ACCEPT]:
            return "create_author_on_inspire"
        else:
            return "close_author_create_user_ticket"

    @task(do_xcom_push=True)
    def create_author_on_inspire(**context: dict) -> str:
        workflow_data = workflow_management_hook.get_workflow(
            workflow_id=context["params"]["workflow_id"]
        )
        response = InspireHTTPRecordManagementHook().post_record(
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

    @task.branch
    def author_should_curate_branch(**context: dict) -> None:
        """Route accepted workflows based on the decision value.

        ``accept_curate`` creates a curation ticket before closing the submitter
        ticket; all other accepted outcomes go directly to ticket closure.
        """

        decision = context["ti"].xcom_pull(
            task_ids="await_author_check_approval", key="decision"
        )

        if decision == DECISION_ACCEPT_CURATE:
            return "create_author_create_curation_ticket"
        else:
            return "close_author_create_user_ticket"

    @task
    def create_author_create_curation_ticket(**context: dict) -> None:
        workflow_data = context["params"]["workflow"]["data"]
        email = workflow_data["acquisition_source"]["email"]

        bai = f"[{workflow_data.get('bai')}]" if workflow_data.get("bai") else ""

        control_number = context["ti"].xcom_pull(
            task_ids="create_author_on_inspire", key="control_number"
        )

        inspire_http_hook.get_conn()

        create_ticket(
            inspire_http_hook,
            AUTHOR_CURATION_FUNCTIONAL_CATEGORY,
            "curation_needed_author",
            f"Curation needed for author "
            f"{workflow_data.get('name').get('preferred_name')} {bai}",
            email,
            {
                "email": email,
                "record_url": f"{inspire_http_hook.base_url}/authors/{control_number}",
            },
            TICKET_AUTHOR_CURATION,
            context["params"]["workflow_id"],
            AUTHORS,
        )

    @task.branch
    def author_create_success_branch(**context: dict) -> str:
        ti = context["ti"]
        workflow_status = ti.xcom_pull(task_ids="create_author_on_inspire")
        if workflow_status == "completed":
            return "author_should_curate_branch"
        else:
            return "set_author_create_workflow_status_to_error"

    @task
    def set_author_create_workflow_status_to_completed(**context: dict) -> None:
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task(
        trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
    )
    def close_author_create_user_ticket(**context: dict) -> None:
        workflow = workflow_management_hook.get_workflow(
            workflow_id=context["params"]["workflow_id"]
        )

        ticket_id = get_ticket_by_type(workflow, "author_create_user")["ticket_id"]

        workflow_data = workflow["data"]
        email = workflow_data["acquisition_source"]["email"]
        control_number = context["ti"].xcom_pull(
            task_ids="create_author_on_inspire", key="control_number"
        )
        decision = context["ti"].xcom_pull(
            task_ids="await_author_check_approval", key="decision"
        )

        inspire_http_hook.get_conn()

        request_data = {
            "user_name": email,
            "author_name": workflow_data.get("name").get("preferred_name"),
            "record_url": f"{inspire_http_hook.base_url}/authors/{control_number}",
        }
        if decision in [DECISION_ACCEPT_CURATE, DECISION_ACCEPT]:
            close_ticket(
                inspire_http_hook, ticket_id, "user_accepted_author", request_data
            )
        else:
            close_ticket(inspire_http_hook, ticket_id)

    @task
    def set_author_create_workflow_status_to_error(**context: dict) -> None:
        ti = context["ti"]
        status_name = ti.xcom_pull(task_ids="create_author_on_inspire")
        logger.info(f"Workflow status: {status_name}")
        workflow_management_hook.set_workflow_status(
            status_name=status_name,
            workflow_id=context["params"]["workflow_id"],
        )

    # task definitions
    data_with_schema = set_schema()
    set_submission_number_task = set_submission_number(data_with_schema)

    create_author_on_inspire_task = create_author_on_inspire()
    close_author_create_user_ticket_task = close_author_create_user_ticket()
    author_should_curate_branch_task = author_should_curate_branch()
    author_create_success_branch_task = author_create_success_branch()
    create_author_create_curation_ticket_task = create_author_create_curation_ticket()
    set_workflow_status_to_error_task = set_author_create_workflow_status_to_error()

    # task dependencies
    (
        set_workflow_status_to_running()
        >> data_with_schema
        >> set_submission_number_task
        >> create_author_create_user_ticket()
        >> await_author_check_approval()
        >> author_check_approval_branch()
        >> [create_author_on_inspire_task, close_author_create_user_ticket_task]
    )
    (
        author_should_curate_branch_task
        >> [
            create_author_create_curation_ticket_task,
            close_author_create_user_ticket_task,
        ]
    )

    create_author_create_curation_ticket_task >> close_author_create_user_ticket_task

    (create_author_on_inspire_task >> author_create_success_branch_task)
    author_create_success_branch_task >> [
        author_should_curate_branch_task,
        set_workflow_status_to_error_task,
    ]

    (
        close_author_create_user_ticket_task
        >> set_author_create_workflow_status_to_completed()
    )


author_create_initialization_dag()
