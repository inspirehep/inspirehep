from inspire_utils.record import get_values_for_schema
import logging

from django.shortcuts import get_object_or_404
from backoffice.management.utils import get_opensearch_client
from django.conf import settings

from backoffice.authors.constants import AuthorResolutions, AuthorStatusChoices
from backoffice.authors.api.serializers import AuthorDecisionSerializer
from backoffice.authors.models import AuthorDecision, AuthorWorkflow
from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS

opensearch_client = get_opensearch_client()
logger = logging.getLogger(__name__)


def add_author_decision(workflow_id, user, action):
    existing = AuthorDecision.objects.filter(
        workflow_id=workflow_id, action=action
    ).first()
    if existing:
        logger.info(
            "Decision already exists for workflow %s with action %s, skipping",
            workflow_id,
            action,
        )
        return AuthorDecisionSerializer(existing).data

    data = {"workflow": workflow_id, "user": user, "action": action}

    serializer = AuthorDecisionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data


def resolve_workflow(workflow_id, data, user):
    action = data["value"]
    logger.info(
        "Restarting workflow DAG Run %s after choice: %s",
        workflow_id,
        action,
    )

    add_author_decision(workflow_id, user, action)
    workflow = get_object_or_404(AuthorWorkflow, pk=workflow_id)
    task_to_restart = AuthorResolutions[action].label

    if task_to_restart:
        airflow_utils.clear_airflow_dag_tasks(
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            workflow_id,
            tasks=[task_to_restart],
        )

    workflow.status = AuthorStatusChoices.RUNNING
    workflow.save()
    return workflow


def is_another_author_running(ids):
    """
    Check if there is another author workflow running.
    """

    index_name = settings.OPENSEARCH_INDEX_NAMES.get(settings.AUTHORS_DOCUMENTS)

    schema = "ORCID"

    values = get_values_for_schema(ids, schema)
    for value in values:
        response = opensearch_client.search(
            index=index_name,
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"data.ids.value.keyword": value}},
                            {"match": {"data.ids.schema": schema}},
                        ],
                        "should": [
                            {"match": {"status": "running"}},
                            {"match": {"status": "approval"}},
                            {"match": {"status": "error"}},
                        ],
                        "minimum_should_match": 1,
                    }
                }
            },
        )
        number_workflows_running = (
            response["hits"]["total"]["value"] if "hits" in response else 0
        )
        if number_workflows_running > 0:
            return True
    return False
