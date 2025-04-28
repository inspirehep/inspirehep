import logging
import os

from airflow.utils.email import send_email
from include.utils.set_workflow_status import (
    set_workflow_status_to_error,
)

logger = logging.getLogger(__name__)


def task_failure_alert(context):
    """Send a Zulip notification when a task fails."""
    subject = os.environ.get("ZULIP_NOTIFICATION_TOPIC")  # Channel is inspire
    recipient = os.environ.get("ZULIP_NOTIFICATION_RECIPIENT")
    if not recipient:
        logger.error("Cannot send email.")
        return

    dag_id = context.get("dag").dag_id if context.get("dag") else "unknown"
    log_url = (
        context.get("task_instance").log_url if context.get("task_instance") else None
    )
    log_url_display = f'<a href="{log_url}">Log URL</a>' if log_url else "N/A"

    body = f"""
    <b>DAG</b>: `{dag_id}`<br>
    <b>Log URL</b>: {log_url_display}<br>
    """

    send_email(
        to=[recipient],
        subject=subject,
        html_content=body,
    )


def dag_failure_callback(context):
    """Callback function for DAG failure."""
    try:
        task_failure_alert(context)
    except Exception as e:
        logger.error(f"Error in sending alert: {e}")

    # TODO: what if callback fails? Data in backoffice not up to date!
    set_workflow_status_to_error(context)
