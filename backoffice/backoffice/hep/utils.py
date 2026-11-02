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
from backoffice.hep.models import HepDecision
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


def add_hep_decision_batch(workflow_id, user, action, value=None):
    data = {"workflow": workflow_id, "user": user, "action": action}

    if value is not None:
        data["value"] = value

    serializer = HepDecisionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data


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


def is_another_hep_submission_running(workflow, statuses=None):
    """Check whether a matching HEP submission has not completed.

    :param workflow: workflow data, its own id is excluded from the matches
    :param statuses: if given, only submissions in one of these statuses match
    """

    index_name = settings.OPENSEARCH_INDEX_NAMES.get(settings.HEP_DOCUMENTS)
    arxiv_eprints_values = [
        value
        for value in get_value(workflow, "data.arxiv_eprints.value", []) or []
        if value
    ]
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

    must_clauses = [{"term": {"data.acquisition_source.method": "submitter"}}]
    if statuses:
        must_clauses.append({"terms": {"status": statuses}})

    must_not_clauses = [{"match": {"status": HepStatusChoices.COMPLETED}}]
    if workflow.get("id"):
        must_not_clauses.append({"ids": {"values": [str(workflow["id"])]}})

    query = {
        "query": {
            "bool": {
                "must": must_clauses,
                "must_not": must_not_clauses,
                "should": should_clauses,
                "minimum_should_match": 1,
            }
        }
    }
    try:
        response = opensearch_client.search(index=index_name, body=query)
    except Exception as e:
        logger.error(
            "Ignoring check for active submission running. "
            "OpenSearch failed with error: %s",
            str(e),
        )
        return False
    number_workflows_running = response.get("hits", {}).get("total", {}).get("value", 0)
    logger.info("Found %s matching active HEP submissions", number_workflows_running)
    return number_workflows_running > 0


def is_matching_submission_processing(workflow):
    """Check whether a matching HEP submission is being processed by Airflow.

    Resolving a workflow while such a submission is processed would make both
    run at the same time, the submission must take priority.
    """
    return is_another_hep_submission_running(
        {"id": workflow.id, "data": workflow.data},
        statuses=[HepStatusChoices.RUNNING, HepStatusChoices.PROCESSING],
    )
