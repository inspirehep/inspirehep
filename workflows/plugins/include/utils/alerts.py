import logging
import os

from airflow.sdk import BaseNotifier
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
    workflow_id = context.get("run_id", "unknown")
    log_url = (
        f"{os.environ.get('AIRFLOW__WEBSERVER__BASE_URL')}"
        f"/dags/{dag_id}/runs/{workflow_id}/?state=failed"
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


class FailedDagNotifier(BaseNotifier):
    def __init__(self, collection=None):
        self.collection = collection

    def notify(self, context):
        """Callback function for DAG failure."""
        try:
            task_failure_alert(context)
        except Exception as e:
            logger.error(f"Error in sending alert: {e}")


class FailedDagNotifierSetError(FailedDagNotifier):
    def notify(self, context):
        """Callback function for DAG failure."""

        super().notify(context)

        # TODO: what if callback fails? Data in backoffice not up to date!
        if self.collection:
            set_workflow_status_to_error(self.collection, context)
