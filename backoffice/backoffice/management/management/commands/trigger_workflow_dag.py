import uuid

from django.core.management.base import BaseCommand, CommandError
from requests import RequestException

from backoffice.authors.api.serializers import AuthorWorkflowSerializer
from backoffice.authors.models import AuthorWorkflow
from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.hep.api.serializers import HepWorkflowSerializer
from backoffice.hep.models import HepWorkflow


class Command(BaseCommand):
    help = (
        "Trigger the initialization Airflow DAG for a backoffice workflow UUID. "
        "The workflow type is inferred from the database."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "workflow_id",
            type=uuid.UUID,
            help="Workflow UUID of the dag_run.",
        )

    def handle(self, *args, **options):
        workflow_id = options["workflow_id"]
        workflow, serializer_class = self.get_workflow_and_serializer(workflow_id)
        dag_id = WORKFLOW_DAGS[workflow.workflow_type].initialize
        trigger_kwargs = {}

        if isinstance(workflow, AuthorWorkflow):
            trigger_kwargs["workflow"] = serializer_class(workflow).data

        try:
            airflow_utils.trigger_airflow_dag(
                dag_id,
                str(workflow.id),
                **trigger_kwargs,
            )
        except RequestException as exc:
            raise CommandError(
                f"Error triggering Airflow DAG `{dag_id}` for workflow `{workflow.id}`: {exc}"
            ) from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"Triggered Airflow DAG `{dag_id}` for workflow `{workflow.id}`."
            )
        )

    def get_workflow_and_serializer(self, workflow_id):
        for model, serializer_class in (
            (AuthorWorkflow, AuthorWorkflowSerializer),
            (HepWorkflow, HepWorkflowSerializer),
        ):
            workflow = model.objects.filter(id=workflow_id).first()
            if workflow:
                return workflow, serializer_class

        raise CommandError(f"Workflow `{workflow_id}` was not found in backoffice.")
