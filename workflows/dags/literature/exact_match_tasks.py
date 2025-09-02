import logging

from airflow.decorators import task
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils.s3 import read_object, write_object
from include.utils.workflows import get_decision

logger = logging.getLogger(__name__)

inspire_http_hook = InspireHttpHook()
workflow_management_hook = WorkflowManagementHook(HEP)
s3_hook = S3Hook(aws_conn_id="s3_conn")


@task
def get_exact_matches(**context):
    workflow_data = read_object(s3_hook, context["params"]["workflow_id"])

    response = inspire_http_hook.call_api(
        endpoint="api/matcher/exact-match",
        method="GET",
        data={"data": workflow_data["data"]},
    )
    response.raise_for_status()
    return response.json()["matched_ids"]


@task.branch
def check_for_exact_matches(matches, **context):
    logger.info(f"Exact matches: {matches}")
    if not matches:
        return "dummy_get_fuzzy_matches"
    elif len(matches) == 1:
        return "dummy_set_update_flag"

    return "await_decision_exact_match"


@task.branch
def await_decision_exact_match(**context):
    workflow_data = workflow_management_hook.get_workflow(
        context["params"]["workflow_id"]
    )

    decision = get_decision(workflow_data.get("decisions"), "exact_match")
    if decision:
        write_object(
            s3_hook,
            workflow_data,
            context["params"]["workflow_id"],
            overwrite=True,
        )
        return "set_workflow_status_to_running"

    return "set_workflow_status_to_matching"


@task.branch
def check_decision_exact_match(**context):
    """
    Check if the workflow is an update or create.
    """

    workflow_data = read_object(s3_hook, context["params"]["workflow_id"])
    # update the update logic
    decision = get_decision(workflow_data.get("decisions"), "exact_match")
    if decision and decision.get("value"):
        return "set_update_flag"
    return "get_fuzzy_matches"
