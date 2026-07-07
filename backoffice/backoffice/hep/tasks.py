import logging

from celery.exceptions import SoftTimeLimitExceeded
from requests.exceptions import RequestException
from backoffice.hep.constants import HepResolutions
from config import celery_app
from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS
from django.utils import timezone

from backoffice.hep.constants import HepStatusChoices
from backoffice.hep.models import HepWorkflow

logger = logging.getLogger(__name__)


@celery_app.task(
    autoretry_for=(RequestException,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def trigger_hep_workflow_initialization(workflow_id, workflow_type):
    dag_id = WORKFLOW_DAGS[workflow_type].initialize
    logger.info(
        "Triggering HEP workflow DAG %s asynchronously for workflow %s",
        dag_id,
        workflow_id,
    )
    return airflow_utils.trigger_airflow_dag(dag_id, workflow_id)


@celery_app.task(soft_time_limit=10 * 60, time_limit=11 * 60)
def batch_resolve_workflows(data):
    """Clear the requested Airflow task for each workflow in a batch.

    ``data`` is the validated batch payload and must contain ``action`` and
    ``ids``. For each workflow ID, the task resolves the Airflow task label
    mapped from ``action`` and clears that task on the workflow's initialize
    DAG. Per-workflow failures are logged and the affected workflow is marked
    ``ERROR``; ``SoftTimeLimitExceeded`` is re-raised so Celery can stop the
    task cleanly.
    """
    for wf_id in data["ids"]:
        try:
            workflow = HepWorkflow.objects.only("workflow_type").get(pk=wf_id)
            task_to_restart = HepResolutions[data["action"]].label
            if task_to_restart:
                airflow_utils.clear_airflow_dag_tasks(
                    WORKFLOW_DAGS[workflow.workflow_type].initialize,
                    wf_id,
                    tasks=[task_to_restart],
                )
        except SoftTimeLimitExceeded:
            raise
        except Exception:
            logger.exception("Error resolving workflow %s", wf_id)
            HepWorkflow.objects.filter(pk=wf_id).update(
                status=HepStatusChoices.ERROR, _updated_at=timezone.now()
            )
