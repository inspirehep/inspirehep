from backoffice.hep.api.serializers import (
    HepChangeStatusSerializer,
    HepDecisionSerializer,
)
from django.shortcuts import get_object_or_404
import logging

from backoffice.hep.models import HepDecision, HepWorkflow

from backoffice.hep.constants import (
    HepResolutions,
    HepStatusChoices,
    HepWorkflowType,
)
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.common import airflow_utils
from inspire_utils.record import get_value

from backoffice.management.utils import get_opensearch_client


from django.conf import settings

opensearch_client = get_opensearch_client()

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
    existing = HepDecision.objects.filter(
        workflow_id=workflow_id, action=action
    ).first()
    if existing:
        logger.info(
            "Decision already exists for workflow %s with action %s, skipping",
            workflow_id,
            action,
        )
        return HepDecisionSerializer(existing).data

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
    workflow = get_object_or_404(HepWorkflow, pk=id)
    task_to_restart = HepResolutions[data["action"]].label
    if task_to_restart:
        _, status = airflow_utils.clear_airflow_dag_tasks(
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


def is_another_hep_running(workflow):
    """Check whether a matching HEP workflow has not completed."""

    index_name = settings.OPENSEARCH_INDEX_NAMES.get(settings.HEP_DOCUMENTS)
    arxiv_eprints_values = get_value(workflow, "data.arxiv_eprints.value", [])
    dois_values = get_value(workflow, "data.dois.value", [])

    if not arxiv_eprints_values and not dois_values:
        logger.info("No arXiv eprints or DOIs in workflow, skipping matching.")
        return False

    should_clauses = []
    if arxiv_eprints_values:
        should_clauses.append(
            {"terms": {"data.arxiv_eprints.value": arxiv_eprints_values}}
        )
    if dois_values:
        should_clauses.append({"terms": {"data.dois.value": dois_values}})

    query = {
        "query": {
            "bool": {
                "must_not": [{"match": {"status": HepStatusChoices.COMPLETED}}],
                "should": should_clauses,
                "minimum_should_match": 1,
            }
        }
    }
    response = opensearch_client.search(index=index_name, body=query)
    number_workflows_running = response.get("hits", {}).get("total", {}).get("value", 0)
    logger.info("Found %s matching active workflows", number_workflows_running)
    return number_workflows_running > 0
