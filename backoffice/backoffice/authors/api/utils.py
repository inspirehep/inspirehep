from json import JSONDecodeError

from rest_framework.response import Response
from backoffice.authors.api.serializers import AuthorDecisionSerializer
import logging


logger = logging.getLogger(__name__)


def add_decision(workflow_id, user, action):
    serializer_class = AuthorDecisionSerializer
    data = {"workflow": workflow_id, "user": user, "action": action}

    serializer = serializer_class(data=data)
    if serializer.is_valid(raise_exception=True):
        serializer.save()
        return serializer.data


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
