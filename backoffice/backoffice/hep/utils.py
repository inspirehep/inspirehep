from backoffice.hep.api.serializers import HepDecisionSerializer
from django.shortcuts import get_object_or_404
import logging

from requests.exceptions import RequestException
from backoffice.hep.models import HepWorkflow

from backoffice.hep.constants import HepResolutions, HepStatusChoices, HepWorkflowType
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.common import airflow_utils
from backoffice.common.utils import (
    handle_request_exception,
)

logger = logging.getLogger(__name__)


def add_hep_decision(workflow_id, user, action, value=None):
    data = {"workflow": workflow_id, "user": user, "action": action}

    if value is not None:
        data["value"] = value

    serializer = HepDecisionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data


def resolve_workflow(id, data, user):
    logger.info(
        "Restarting HEP DAG Run %s after choice: %s",
        id,
        data["action"],
    )
    add_hep_decision(
        id,
        user,
        data["action"],
        data.get("value"),
    )

    task_to_restart = HepResolutions[data["action"]].label
    if task_to_restart:
        try:
            airflow_utils.clear_airflow_dag_tasks(
                WORKFLOW_DAGS[HepWorkflowType.HEP_CREATE].initialize,
                id,
                tasks=[task_to_restart],
            )
        except RequestException as e:
            return handle_request_exception(
                "Error clearing Airflow DAG",
                e,
            )

    workflow = get_object_or_404(HepWorkflow, pk=id)
    workflow.status = HepStatusChoices.PROCESSING
    workflow.save()
    return workflow
