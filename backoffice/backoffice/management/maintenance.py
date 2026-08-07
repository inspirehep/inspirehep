"""Ad-hoc maintenance helpers meant to be run from `python manage.py shell`.

Example:
    >>> from backoffice.management.maintenance import restart_stuck_workflows
    >>> restart_stuck_workflows()
    >>> restart_stuck_workflows(
    ...     stuck_hep_statuses=[HepStatusChoices.ERROR],
    ...     workflow_types=[HepWorkflowType.HEP_CREATE, HepWorkflowType.HEP_UPDATE],
    ... )

    >>> from backoffice.management.maintenance import restart_resolved_workflows
    >>> restart_resolved_workflows()
    >>> restart_resolved_workflows(
    ...     resolved_hep_statuses=[HepStatusChoices.RUNNING, HepStatusChoices.ERROR],
    ...     workflow_types=[HepWorkflowType.HEP_CREATE, HepWorkflowType.HEP_UPDATE],
    ... )

    >>> from backoffice.management.maintenance import remove_inspire_hep_author_ids
    >>> remove_inspire_hep_author_ids("afa741e5-fd4f-407d-ab3d-53ac0b9e4342")
"""

import logging
import time
from copy import deepcopy

from requests.exceptions import RequestException

from backoffice.common.airflow_utils import (
    clear_airflow_dag_run,
    clear_airflow_dag_tasks,
)
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.hep.constants import (
    HepResolutions,
    HepStatusChoices,
    HepWorkflowType,
)
from backoffice.hep.models import HepWorkflow

logger = logging.getLogger(__name__)

STUCK_HEP_STATUSES = [HepStatusChoices.ERROR]
RESOLVED_HEP_STATUSES = [HepStatusChoices.RUNNING]
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


def restart_resolved_workflows(
    resolved_hep_statuses=None,
    workflow_types=None,
    batch_size=30,
    sleep_between_batches=10,
):
    """Re-clear the resolution task of workflows stuck in running with a decision.

    Picks up workflows in the given statuses that already have a decision recorded
    but whose DAG was never resumed, and clears the task the decision was supposed
    to restart.

    :param resolved_hep_statuses: statuses to pick up (defaults to
        RESOLVED_HEP_STATUSES)
    :param workflow_types: workflow types to restart (defaults to WORKFLOW_TYPES)
    :param batch_size: how many workflows to restart before sleeping
    :param sleep_between_batches: seconds to sleep between batches
    """
    resolved_hep_statuses = resolved_hep_statuses or RESOLVED_HEP_STATUSES
    workflow_types = workflow_types or WORKFLOW_TYPES

    statuses = [str(status) for status in resolved_hep_statuses]
    types = [str(workflow_type) for workflow_type in workflow_types]

    logger.info(
        "Restarting resolved workflows: statuses=%s types=%s batch_size=%s sleep=%ss",
        statuses,
        types,
        batch_size,
        sleep_between_batches,
    )

    failed = []
    for workflow_type in types:
        workflows = (
            HepWorkflow.objects.filter(
                status__in=statuses,
                workflow_type=workflow_type,
                decisions__isnull=False,
            )
            .distinct()
            .order_by("id")
        )

        total = workflows.count()
        logger.info("Found %s resolved workflow(s) of type %s", total, workflow_type)

        index = 0
        for workflow in workflows.iterator():
            decision = workflow.decisions.order_by("-_created_at").first()
            task_to_restart = HepResolutions[decision.action].label
            if not task_to_restart:
                logger.info(
                    "Workflow %s has no task for action %s, skipping",
                    workflow.id,
                    decision.action,
                )
                continue

            dag_id = WORKFLOW_DAGS[workflow.workflow_type].initialize
            logger.info(
                "Restarting workflow %s (dag=%s task=%s)",
                workflow.id,
                dag_id,
                task_to_restart,
            )
            try:
                clear_airflow_dag_tasks(
                    dag_id, str(workflow.id), tasks=[task_to_restart]
                )
            except RequestException:
                logger.exception("Failed to restart workflow %s", workflow.id)
                failed.append(workflow.id)
                continue

            index += 1
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
        logger.info("All resolved workflows restarted successfully.")

    return failed


def remove_inspire_hep_author_ids(workflow_id):
    """Strip INSPIRE_HEP ids from every author of a HEP workflow's data.

    :param workflow_id: uuid of the HepWorkflow to clean up
    """
    workflow = HepWorkflow.objects.get(pk=workflow_id)

    data = deepcopy(workflow.data or {})
    for author in data.get("authors", []):
        if isinstance(author.get("ids"), list):
            author["ids"] = [
                id_info
                for id_info in author["ids"]
                if id_info.get("schema") != "INSPIRE_HEP"
            ]

    workflow.data = data
    workflow.save(update_fields=["data"])
    logger.info("Removed INSPIRE_HEP author ids from workflow %s", workflow_id)
