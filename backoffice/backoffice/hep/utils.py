from backoffice.hep.api.serializers import (
    HepChangeStatusSerializer,
    HepDecisionSerializer,
)
from django.db import transaction
from django.shortcuts import get_object_or_404
import logging

from backoffice.hep.models import HepWorkflow

from backoffice.hep.constants import HepResolutions, HepStatusChoices
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.common import airflow_utils


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
    with transaction.atomic():
        add_hep_decision(
            id,
            user,
            data["action"],
            data.get("value"),
        )
    workflow = get_object_or_404(HepWorkflow, pk=id)
    task_to_restart = HepResolutions[data["action"]].label
    if task_to_restart:
        airflow_utils.clear_airflow_dag_tasks(
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            id,
            tasks=[task_to_restart],
        )
    workflow.status = HepStatusChoices.RUNNING
    workflow.save()
    return workflow


def complete_workflow(id, data):
    serializer = HepChangeStatusSerializer(data=data)
    serializer.is_valid(raise_exception=True)

    note = serializer.validated_data.get("note", "")

    workflow = get_object_or_404(HepWorkflow, pk=id)
    airflow_utils.mark_airflow_dag_run_as_success(workflow, note=note)
    return workflow
