import logging

from celery.exceptions import SoftTimeLimitExceeded
from requests.exceptions import RequestException

from config import celery_app
from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS
from django.contrib.auth import get_user_model
from django.utils import timezone

from backoffice.hep.constants import HepStatusChoices
from backoffice.hep.models import HepWorkflow
from backoffice.hep.utils import resolve_workflow

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
def batch_resolve_workflows(data, user_id):
    """Resolve a batch of HEP workflows in the background.

    ``data`` is the validated batch payload (``action`` + ``ids``).

    Runs in autocommit (Celery tasks are not covered by ATOMIC_REQUESTS): each
    ``add_hep_decision`` write inside ``resolve_workflow`` is committed before the
    Airflow DAG task is cleared. Do NOT wrap ``resolve_workflow`` in ``transaction.atomic()``,
    that would defer the decision commit past the Airflow clear and reintroduce the race.
    """
    user = get_user_model().objects.get(pk=user_id)
    for wf_id in data["ids"]:
        try:
            resolve_workflow(wf_id, data, user)
        except SoftTimeLimitExceeded:
            raise
        except Exception:
            logger.exception("Error resolving workflow %s", wf_id)
            HepWorkflow.objects.filter(pk=wf_id).update(
                status=HepStatusChoices.ERROR, _updated_at=timezone.now()
            )
