import logging
import os

from airflow.utils.email import send_email

logger = logging.getLogger(__name__)


def task_failure_alert(context):
    """Send a Zulip notification when a task fails."""
    subject = os.environ.get("ZULIP_NOTIFICATION_TOPIC")  # Channel is inspire
    recipient = os.environ.get("ZULIP_NOTIFICATION_RECIPIENT")
    if not recipient:
        logger.error("Cannot send email.")
        return

    body = f"""
    <b>DAG</b>: `{context['dag'].dag_id}`<br>
    <b>Task</b>: `{context['task_instance'].task_id}`<br>
    <b>Log URL</b>: <a href="{context['task_instance'].log_url}">Log URL</a><br>
    """
    send_email(
        to=[recipient],
        subject=subject,
        html_content=body,
    )
