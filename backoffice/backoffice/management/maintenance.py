"""Ad-hoc maintenance helpers meant to be run from `python manage.py shell`.

Example:
    >>> from backoffice.management.maintenance import restart_stuck_workflows
    >>> restart_stuck_workflows()
    >>> restart_stuck_workflows(
    ...     stuck_hep_statuses=[HepStatusChoices.ERROR],
    ...     workflow_types=[HepWorkflowType.HEP_CREATE, HepWorkflowType.HEP_UPDATE],
    ... )
"""

import logging
import time

from requests.exceptions import RequestException

from backoffice.common.airflow_utils import clear_airflow_dag_run
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.hep.constants import HepStatusChoices, HepWorkflowType
from backoffice.hep.models import HepWorkflow

logger = logging.getLogger(__name__)

STUCK_HEP_STATUSES = [HepStatusChoices.ERROR]
WORKFLOW_TYPES = [HepWorkflowType.HEP_CREATE]


def restart_stuck_workflows(
    stuck_hep_statuses=None,
    workflow_types=None,
    batch_size=30,
    sleep_between_batches=10,
    only_failed=True,
):
    """Restart stuck HEP workflows by clearing their initialize DAG run.

    :param stuck_hep_statuses: statuses to pick up (defaults to STUCK_HEP_STATUSES)
    :param workflow_types: workflow types to restart (defaults to WORKFLOW_TYPES)
    :param batch_size: how many workflows to restart before sleeping
    :param sleep_between_batches: seconds to sleep between batches
    :param only_failed: restart only the failed/current task instead of from scratch
    """
    stuck_hep_statuses = stuck_hep_statuses or STUCK_HEP_STATUSES
    workflow_types = workflow_types or WORKFLOW_TYPES

    statuses = [str(status) for status in stuck_hep_statuses]
    types = [str(workflow_type) for workflow_type in workflow_types]

    logger.info(
        "Restarting stuck workflows: statuses=%s types=%s "
        "batch_size=%s sleep=%ss only_failed=%s",
        statuses,
        types,
        batch_size,
        sleep_between_batches,
        only_failed,
    )

    failed = []
    for workflow_type in types:
        workflows = HepWorkflow.objects.filter(
            status__in=statuses, workflow_type=workflow_type
        ).order_by("id")

        total = workflows.count()
        logger.info("Found %s stuck workflow(s) of type %s", total, workflow_type)

        for index, workflow in enumerate(workflows.iterator(), start=1):
            dag_id = WORKFLOW_DAGS[workflow.workflow_type].initialize
            logger.info("Restarting workflow %s (dag=%s)", workflow.id, dag_id)
            try:
                clear_airflow_dag_run(dag_id, str(workflow.id), only_failed=only_failed)
            except RequestException:
                logger.exception("Failed to restart workflow %s", workflow.id)
                failed.append(workflow.id)
                continue

            if index % batch_size == 0:
                logger.info(
                    "Restarted %s workflow(s), sleeping %ss",
                    index,
                    sleep_between_batches,
                )
                time.sleep(sleep_between_batches)

    if failed:
        logger.info("Failed to restart %s workflow(s): %s", len(failed), failed)
    else:
        logger.info("All stuck workflows restarted successfully.")

    return failed
