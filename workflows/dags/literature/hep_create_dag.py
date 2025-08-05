import datetime
import logging
import random

from airflow.decorators import dag, task
from airflow.models.param import Param
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.utils.trigger_rule import TriggerRule
from hooks.backoffice.workflow_management_hook import (
    HEP,
    RUNNING_STATUSES,
    WorkflowManagementHook,
)
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.s3 import read_object, write_object
from include.utils.workflows import get_decision

logger = logging.getLogger(__name__)

s3_hook = S3Hook(aws_conn_id="s3_conn")


@dag(
    params={
        "workflow_id": Param(type="string"),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=FailedDagNotifierSetError(collection=HEP),
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
        workflow_data = workflow_management_hook.get_workflow(
            context["params"]["workflow_id"]
        )
        return write_object(
            s3_hook, workflow_data, context["params"]["workflow_id"], overwrite=True
        )

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
    def check_for_blocking_workflows(**context):
        workflow_data = read_object(s3_hook, context["params"]["workflow_id"])
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

        return "await_decision_exact_match"

    @task
    def set_workflow_status_to_matching(**context):
        workflow_management_hook.set_workflow_status(
            status_name="matching", workflow_id=context["params"]["workflow_id"]
        )

    @task.branch
    def await_decision_exact_match(**context):
        workflow_data = workflow_management_hook.get_workflow(
            context["params"]["workflow_id"]
        )

        decision = get_decision(workflow_data.get("decisions"), "exact_match")
        if decision:
            write_object(
                s3_hook, workflow_data, context["params"]["workflow_id"], overwrite=True
            )
            return "set_workflow_status_to_running"

        return "set_workflow_status_to_matching"

    @task.branch
    def check_is_update(**context):
        """
        Check if the workflow is an update or create.
        """

        workflow_data = read_object(s3_hook, context["params"]["workflow_id"])
        # update the update logic
        decision = get_decision(workflow_data.get("decisions"), "exact_match")
        if decision and decision.get("value"):
            return "direct_update"
        return "direct_create"

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def direct_update(**context):
        print("direct update")

    @task
    def direct_create(**context):
        print("direct create")

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def set_workflow_status_to_completed(**context):
        """
        Set the status of the workflow to "completed".
        """
        workflow_management_hook.set_workflow_status(
            status_name="completed", workflow_id=context["params"]["workflow_id"]
        )

    await_decision_exact_match_task = await_decision_exact_match()
    direct_update_task = direct_update()
    direct_create_task = direct_create()
    set_workflow_status_to_matching_task = set_workflow_status_to_matching()
    set_workflow_status_to_running_task = set_workflow_status_to_running()

    (
        get_workflow_data()
        >> set_workflow_status_to_running()
        >> check_for_blocking_workflows()
        >> check_persistent_identifier_match()
        >> [direct_update_task, await_decision_exact_match_task]
    )

    await_decision_exact_match_task >> [
        set_workflow_status_to_running_task,
        set_workflow_status_to_matching_task,
    ]

    (
        set_workflow_status_to_running_task
        >> check_is_update()
        >> [direct_update_task, direct_create_task]
        >> set_workflow_status_to_completed()
    )


hep_create_dag()
