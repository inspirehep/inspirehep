from backoffice.hep.api.serializers import (
    HepChangeStatusSerializer,
    HepDecisionSerializer,
)
from django.shortcuts import get_object_or_404
import logging

from backoffice.hep.models import HepWorkflow

from backoffice.hep.constants import (
    HepResolutions,
    HepStatusChoices,
    HepWorkflowType,
)
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.common import airflow_utils
from inspire_utils.record import get_value


logger = logging.getLogger(__name__)


def get_restored_hep_workflow_type(workflow):
    """Return the workflow type to restore based on current type and source data."""
    method = get_value(workflow.source_data, "acquisition_source.method", "")

    if method == "submitter":
        return HepWorkflowType.HEP_SUBMISSION

    if workflow.workflow_type in (
        HepWorkflowType.HEP_PUBLISHER_CREATE,
        HepWorkflowType.HEP_PUBLISHER_UPDATE,
    ):
        return HepWorkflowType.HEP_PUBLISHER_CREATE

    return HepWorkflowType.HEP_CREATE


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
    logger.info("Decision has been added to the workflow %s", id)
    workflow = get_object_or_404(HepWorkflow, pk=id)
    task_to_restart = HepResolutions[data["action"]].label
    if task_to_restart:
        _, status = airflow_utils.clear_airflow_dag_tasks(
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            id,
            tasks=[task_to_restart],
        )
        logger.info(
            "Airflow response status code when clearing tasks of workflow %s: %s",
            id,
            status,
        )
    workflow.status = HepStatusChoices.RUNNING
    workflow.save()
    logger.info("Workflow %s has been set to running status", id)
    return workflow


def complete_workflow(id, data):
    serializer = HepChangeStatusSerializer(data=data)
    serializer.is_valid(raise_exception=True)

    note = serializer.validated_data.get("note", "")

    workflow = get_object_or_404(HepWorkflow, pk=id)
    airflow_utils.mark_airflow_dag_run_as_success(workflow, note=note)
    return workflow
