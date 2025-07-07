import datetime
import logging
import random

from airflow.decorators import dag, task
from airflow.models import Variable
from airflow.models.param import Param
from airflow.providers.opensearch.hooks.opensearch import OpenSearchHook
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
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
    opensearch_hook = OpenSearchHook(
        open_search_conn_id="opensearch_connection", log_query=True
    )

    @task
    def get_workflow_data(**context):
        return workflow_management_hook.get_workflow(context["params"]["workflow_id"])

    @task
    def set_workflow_status(
        **context,
    ):
        """
        Set the status of the workflow to the given status name.
        """
        workflow_management_hook.set_workflow_status(
            status_name="running", workflow_id=context["params"]["workflow_id"]
        )

    @task.short_circuit(ignore_downstream_trigger_rules=False)
    def check_wait_decision(workflow_data):
        """
        Check if the workflow is in a waiting decision state.
        """
        logger.info("Checking if workflow is in a waiting state.")
        # alternatively check workflow_data["decisions"] - to implement later
        # if its not waiting, then continue
        return workflow_data["status"] in ["processing", "blocked"]

    @task.short_circuit(ignore_downstream_trigger_rules=False)
    def check_for_blocking_workflows(workflow_data, **context):
        response = opensearch_hook.search(
            index_name=Variable.get("hep_index_name"),
            query={
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "data.arxiv_eprints.value": workflow_data["data"][
                                        "arxiv_eprints"
                                    ][0]["value"]
                                }
                            },
                            {"match": {"status": "running"}},
                        ]
                    }
                }
            },
        )
        print(response["hits"]["total"]["value"])
        if response["hits"]["total"]["value"] == 1:
            return True

        workflow_management_hook.set_workflow_status(
            status_name="blocked", workflow_id=context["params"]["workflow_id"]
        )
        return False

    @task.branch
    def check_matches(**context):
        is_exact_match = random.choice([True, False])
        is_fuzzy_match = False

        context["ti"].xcom_push(key="is_update", value=is_exact_match or is_fuzzy_match)

        if is_exact_match:
            return "waiting_for_exact_approval"

        if is_fuzzy_match:
            return "waiting_for_fuzzy_approval"

        return "auto_reject"

    @task
    def waiting_for_exact_approval(**context):
        print("waiting_for_exact_approval")
        workflow_management_hook.set_workflow_status(
            status_name="approval", workflow_id=context["params"]["workflow_id"]
        )

    @task
    def waiting_for_fuzzy_approval(**context):
        print("waiting_for_fuzzy_approval")
        workflow_management_hook.set_workflow_status(
            status_name="approval", workflow_id=context["params"]["workflow_id"]
        )

    @task
    def auto_reject(**context):
        print("Auto Reject")

    @task
    def enhance(**context):
        print("Enhance")

    @task
    def auto_approve(**context):
        print("auto_approve")

    @task
    def set_workflow_status_to_completed(**context):
        """
        Set the status of the workflow to "completed".
        """
        workflow_management_hook.set_workflow_status(
            status_name="completed", workflow_id=context["params"]["workflow_id"]
        )

    auto_reject_task = auto_reject()
    workflow_data = get_workflow_data()
    workflow_data >> set_workflow_status()

    (
        check_wait_decision(workflow_data)
        >> check_for_blocking_workflows(workflow_data)
        >> check_matches()
        >> [
            waiting_for_exact_approval(),
            waiting_for_fuzzy_approval(),
            auto_reject_task,
        ]
    )
    (
        auto_reject_task
        >> enhance()
        >> auto_approve()
        >> set_workflow_status_to_completed()
    )


hep_create_dag()
