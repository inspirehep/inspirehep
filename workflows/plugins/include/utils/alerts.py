import logging
import os
from urllib.parse import urlparse, urlunparse

from airflow.utils.email import send_email

logger = logging.getLogger(__name__)


def task_failure_alert(context):
    """Send a Zulip notification when a task fails."""
    subject = os.environ.get("ZULIP_NOTIFICATION_TOPIC")  # Channel is inspire
    recipient = os.environ.get("ZULIP_NOTIFICATION_RECIPIENT")
    if not recipient:
        logger.error("Cannot send email.")
        return

    base_url = os.environ.get("AIRFLOW_BASE_URL")
    task_instance = context["task_instance"]
    parsed_log_url = urlparse(task_instance.log_url)
    parsed_base_url = urlparse(base_url)
    new_log_url = urlunparse(
        parsed_log_url._replace(
            scheme=parsed_base_url.scheme, netloc=parsed_base_url.netloc
        )
    )

    body = f"""
    <b>DAG</b>: `{context['dag'].dag_id}`<br>
    <b>Task</b>: `{task_instance.task_id}`<br>
    <b>Log URL</b>: <a href="{new_log_url}">Log URL</a><br>
    """
    send_email(
        to=[recipient],
        subject=subject,
        html_content=body,
    )
