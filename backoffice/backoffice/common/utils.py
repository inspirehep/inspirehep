from json import JSONDecodeError
import logging

from django.shortcuts import get_object_or_404
from django_opensearch_dsl.registries import registry
from django.conf import settings
from rest_framework.response import Response

from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS


logger = logging.getLogger(__name__)


def render_validation_error_response(validation_errors):
    validation_errors_messages = [
        {
            "message": error.message,
            "path": list(error.path),
        }
        for error in validation_errors
    ]
    return validation_errors_messages


def handle_request_exception(error_text, exception, *args, response_text=None):
    """
    Handle exceptions raised during request processing and log the error.
    Args:
        error_text (str): The error message template to log.
        exception (Exception): The exception that was raised.
        *args: Additional arguments to format the error message.
        response_text (str, optional): A custom response text to return in the response.
    Returns:
        Response: A DRF Response object with the error message and status code.
    """
    try:
        error_msg = exception.response.json()
    except (ValueError, JSONDecodeError, AttributeError):
        error_msg = (
            exception.response.text
            if getattr(exception, "response", None) and exception.response.text
            else str(exception)
        )
    formatted_log_text = error_text % args if args else error_text
    logger.error("%s: %s", formatted_log_text, error_msg)

    if response_text:
        formatted_response = response_text % args
    else:
        formatted_response = formatted_log_text
    return Response(
        {"error": f"{formatted_response}"},
        status=getattr(exception.response, "status_code", 502),
    )


def get_index_for_document(document_key):
    """
    Return the OpenSearch index object for the given document_key,
    or None if no index with that name exists.
    """
    target_name = settings.OPENSEARCH_INDEX_NAMES[document_key]
    return next(
        (idx for idx in registry.get_indices() if idx._name == target_name), None
    )


def add_decision(
    workflow_id,
    user,
    action,
    decision_model,
    decision_serializer,
    value=None,
):
    existing = decision_model.objects.filter(
        workflow_id=workflow_id, action=action
    ).first()
    if existing:
        logger.info(
            "Decision already exists for workflow %s with action %s, skipping",
            workflow_id,
            action,
        )
        return decision_serializer(existing).data

    data = {"workflow": workflow_id, "user": user, "action": action}
    if value is not None:
        data["value"] = value

    serializer = decision_serializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data


def resolve_workflow(
    workflow_id,
    data,
    user,
    workflow_model,
    decision_model,
    decision_serializer,
    workflow_resolutions,
    status_choices,
    action_field="action",
):
    action = data[action_field]
    logger.info(
        "Restarting workflow DAG Run %s after choice: %s",
        workflow_id,
        action,
    )

    add_decision(
        workflow_id,
        user,
        action,
        decision_model,
        decision_serializer,
        data.get("value"),
    )
    workflow = get_object_or_404(workflow_model, pk=workflow_id)
    task_to_restart = workflow_resolutions[action].label

    if task_to_restart:
        airflow_utils.clear_airflow_dag_tasks(
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            workflow_id,
            tasks=[task_to_restart],
        )

    workflow.status = status_choices.RUNNING
    workflow.save()
    return workflow
