import datetime
import logging
import random

from airflow.decorators import dag, task
from airflow.models.param import Param
from hooks.backoffice.workflow_management_hook import (
    HEP,
    RUNNING_STATUSES,
    WorkflowManagementHook,
)
from include.utils.alerts import dag_failure_callback

logger = logging.getLogger(__name__)


@dag(
    params={
        "workflow_id": Param(type="string"),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=dag_failure_callback,
    tags=[HEP],
)
def hep_create_dag():
    """
    Initialize a DAG for author create workflow.

    Tasks:
    1. create_ticket_on_author_create: Creates a ticket using the InspireHttpHook
        to call the API endpoint.
    2. set_author_create_workflow_status_to_approval: Sets the workflow status
        to "approval" using the WorkflowManagementHook.

    """

    workflow_management_hook = WorkflowManagementHook(HEP)

    @task
    def get_workflow_data(**context):
        return workflow_management_hook.get_workflow(context["params"]["workflow_id"])

    @task
    def set_workflow_status_to_running(
        **context,
    ):
        """
        Set the status of the workflow to the given status name.
        """
        workflow_management_hook.set_workflow_status(
            status_name="running", workflow_id=context["params"]["workflow_id"]
        )

    @task.short_circuit(ignore_downstream_trigger_rules=False)
    def check_for_blocking_workflows(workflow_data, **context):
        filter_params = {
            "status__in": {"__".join(RUNNING_STATUSES)},
            "data.arxiv_eprints.value": {
                workflow_data["data"]["arxiv_eprints"][0]["value"]
            },
        }

        response = workflow_management_hook.filter_workflows(filter_params)
        if response["count"] <= 1:
            return True

        workflow_management_hook.set_workflow_status(
            status_name="blocked", workflow_id=context["params"]["workflow_id"]
        )
        return False

    @task.branch
    def check_persistent_identifier_match(**context):
        # to be replaced with actual matching logic
        is_persisten_identifier_match = random.choice([True, False])

        if is_persisten_identifier_match:
            return "direct_update"

        return "set_workflow_status_to_matching"

    @task
    def set_workflow_status_to_matching(**context):
        print("set to wait for curator exact_matching")
        workflow_management_hook.set_workflow_status(
            status_name="matching", workflow_id=context["params"]["workflow_id"]
        )

    @task.branch
    def decision_exact_match(**context):
        # to be replaced with actual matching logic
        is_exact_match = random.choice([True, False])

        if is_exact_match:
            return "direct_update"

        return "direct_create"

    @task
    def direct_update(**context):
        print("direct update")

    @task
    def direct_create(**context):
        print("direct create")

    @task
    def set_workflow_status_to_completed(**context):
        """
        Set the status of the workflow to "completed".
        """
        workflow_management_hook.set_workflow_status(
            status_name="completed", workflow_id=context["params"]["workflow_id"]
        )

    workflow_data = get_workflow_data()
    decision_exact_match_task = decision_exact_match()
    direct_update_task = direct_update()
    direct_create_task = direct_create()
    set_workflow_status_to_matching_task = set_workflow_status_to_matching()

    (
        workflow_data
        >> set_workflow_status_to_running()
        >> check_for_blocking_workflows(workflow_data)
        >> check_persistent_identifier_match()
        >> [direct_update_task, set_workflow_status_to_matching_task]
    )

    (
        set_workflow_status_to_matching_task
        >> decision_exact_match_task
        >> [direct_update_task, direct_create_task]
        >> set_workflow_status_to_completed()
    )


hep_create_dag()
