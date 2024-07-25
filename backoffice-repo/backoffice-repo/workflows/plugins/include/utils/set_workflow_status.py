import logging

from hooks.backoffice.workflow_management_hook import WorkflowManagementHook
from requests import Response

logger = logging.getLogger(__name__)


def get_wf_status_from_inspire_response(response: Response) -> str:
    """
    Sets the workflow status in the Airflow xvom based on the response from INSPIRE.

    Args:
        response (Response): The response object from the external service.
        context (dict): The Airflow context.
        workflow_id (str): The identifier for the workflow.
    """
    if response.ok:
        workflow_status = "completed"
    elif (
        response.status_code == 400
        and "validation error" in response.json()["message"].lower()
    ):
        workflow_status = "validation_error"
    else:
        workflow_status = "error"

    return workflow_status


def set_workflow_status_to_error(context: dict) -> None:
    """
    Sets the workflow status to error.

    Args:
        workflow_id (str): The identifier for the workflow.
    """
    logger.info("Setting workflow status to error")
    response = WorkflowManagementHook().set_workflow_status(
        status_name="error", workflow_id=context["params"]["workflow_id"]
    )
    try:
        response.raise_for_status()
    except Exception as e:
        logger.error(f"Error setting workflow status to error: {e}")
        raise e
