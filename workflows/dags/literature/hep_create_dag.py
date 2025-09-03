import datetime
import logging

from airflow.decorators import dag, task_group
from airflow.models.param import Param
from airflow.models.variable import Variable
from airflow.operators.empty import EmptyOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import task
from airflow.utils.edgemodifier import Label
from airflow.utils.trigger_rule import TriggerRule
from hooks.backoffice.workflow_management_hook import (
    HEP,
    RUNNING_STATUSES,
    WorkflowManagementHook,
)
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.s3 import read_object, write_object
from literature.exact_match_tasks import (
    await_decision_exact_match,
    check_decision_exact_match,
    check_for_exact_matches,
    get_exact_matches,
)
from literature.set_workflow_status_tasks import (
    set_workflow_status_to_completed,
    set_workflow_status_to_matching,
    set_workflow_status_to_running,
)

logger = logging.getLogger(__name__)
s3_hook = S3Hook(aws_conn_id="s3_conn")

bucket_name = Variable.get("s3_bucket_name")


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
            s3_hook,
            workflow_data,
            bucket_name,
            context["params"]["workflow_id"],
            overwrite=True,
        )

    @task.short_circuit(ignore_downstream_trigger_rules=False)
    def check_for_blocking_workflows(**context):
        workflow_data = read_object(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )
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

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def set_update_flag(**context):
        return True

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def get_fuzzy_matches(**context):
        return True

    @task_group
    def preprocessing():
        pre1 = EmptyOperator(task_id="pre1")
        return [pre1]

    dummy_set_update_flag = EmptyOperator(task_id="dummy_set_update_flag")
    dummy_get_fuzzy_matches = EmptyOperator(task_id="dummy_get_fuzzy_matches")

    check_for_blocking_workflows_task = check_for_blocking_workflows()

    preprocessing_group = preprocessing()
    set_workflow_status_to_completed_task = set_workflow_status_to_completed()

    set_update_flag_task = set_update_flag()
    get_fuzzy_matches_task = get_fuzzy_matches()

    # Exact matching
    set_workflow_status_to_matching_task = set_workflow_status_to_matching()
    await_decision_exact_match_task = await_decision_exact_match()
    exact_matches = get_exact_matches()
    set_workflow_status_to_running_task = set_workflow_status_to_running()
    check_decision_exact_match_task = check_decision_exact_match()
    check_for_exact_matches_task = check_for_exact_matches(exact_matches)

    await_decision_exact_match_task >> [
        set_workflow_status_to_running_task,
        set_workflow_status_to_matching_task,
    ]

    set_workflow_status_to_running_task >> check_decision_exact_match_task

    (
        exact_matches
        >> check_for_exact_matches_task
        >> [
            await_decision_exact_match_task,
            dummy_set_update_flag,
            dummy_get_fuzzy_matches,
        ]
    )
    dummy_set_update_flag >> Label("1 Exact Matches") >> set_update_flag_task
    dummy_get_fuzzy_matches >> Label("No Exact Matches") >> get_fuzzy_matches_task

    (
        check_for_exact_matches_task
        >> Label("Multiple Exact Matches")
        >> await_decision_exact_match_task
    )

    # Fuzzy matching

    (
        get_workflow_data()
        >> set_workflow_status_to_running()
        >> check_for_blocking_workflows_task
        >> exact_matches
    )

    set_update_flag_task >> preprocessing_group >> set_workflow_status_to_completed_task

    check_decision_exact_match_task.set_downstream(
        get_fuzzy_matches_task, edge_modifier=Label("No match picked")
    )
    check_decision_exact_match_task.set_downstream(
        set_update_flag_task, edge_modifier=Label("Match chosen")
    )
    get_fuzzy_matches_task >> set_workflow_status_to_completed_task


hep_create_dag()
