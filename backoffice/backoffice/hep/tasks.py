import logging

from requests.exceptions import RequestException

from config import celery_app
from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS

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
