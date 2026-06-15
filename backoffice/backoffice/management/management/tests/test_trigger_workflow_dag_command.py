import uuid
from io import StringIO
from unittest.mock import patch

from django.core.management import CommandError, call_command
from django.test import TransactionTestCase
from requests import RequestException

from backoffice.authors.constants import (
    AuthorStatusChoices,
    AuthorWorkflowType,
)
from backoffice.authors.models import AuthorWorkflow
from backoffice.hep.constants import HepStatusChoices, HepWorkflowType
from backoffice.hep.models import HepWorkflow


class TriggerWorkflowDagCommandTests(TransactionTestCase):
    @patch("backoffice.common.airflow_utils.trigger_airflow_dag")
    def test_triggers_author_initialize_dag_with_serialized_workflow(
        self, mock_trigger_airflow_dag
    ):
        workflow = AuthorWorkflow.objects.create(
            id=uuid.uuid4(),
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
            status=AuthorStatusChoices.RUNNING,
            data={"name": "Doe, John"},
        )
        stdout = StringIO()

        call_command("trigger_workflow_dag", str(workflow.id), stdout=stdout)

        mock_trigger_airflow_dag.assert_called_once()
        dag_id, workflow_id = mock_trigger_airflow_dag.call_args.args
        payload = mock_trigger_airflow_dag.call_args.kwargs["workflow"]

        self.assertEqual(dag_id, "author_create_initialization_dag")
        self.assertEqual(workflow_id, str(workflow.id))
        self.assertEqual(payload["id"], str(workflow.id))
        self.assertEqual(payload["workflow_type"], AuthorWorkflowType.AUTHOR_CREATE)
        self.assertEqual(payload["data"], {"name": "Doe, John"})
        self.assertIn("author_create_initialization_dag", stdout.getvalue())

    @patch("backoffice.common.airflow_utils.trigger_airflow_dag")
    def test_triggers_literature_initialize_dag_without_serialized_workflo(
        self, mock_trigger_airflow_dag
    ):
        workflow = HepWorkflow.objects.create(
            id=uuid.uuid4(),
            workflow_type=HepWorkflowType.HEP_CREATE,
            status=HepStatusChoices.RUNNING,
            data={"titles": [{"title": "Example"}]},
        )
        stdout = StringIO()

        call_command("trigger_workflow_dag", str(workflow.id), stdout=stdout)

        mock_trigger_airflow_dag.assert_called_once()
        dag_id, workflow_id = mock_trigger_airflow_dag.call_args.args
        payload = mock_trigger_airflow_dag.call_args.kwargs

        self.assertEqual(dag_id, "hep_create_dag")
        self.assertEqual(workflow_id, str(workflow.id))
        self.assertEqual(payload, {})
        self.assertIn("hep_create_dag", stdout.getvalue())

    def test_raises_command_error_when_workflow_does_not_exist(self):
        workflow_id = uuid.uuid4()

        with self.assertRaisesMessage(CommandError, "was not found in backoffice"):
            call_command("trigger_workflow_dag", str(workflow_id))

    @patch(
        "backoffice.common.airflow_utils.trigger_airflow_dag",
        side_effect=RequestException("Airflow unavailable"),
    )
    def test_raises_command_error_when_airflow_trigger_fails(
        self, mock_trigger_airflow_dag
    ):
        workflow = AuthorWorkflow.objects.create(
            id=uuid.uuid4(),
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
            status=AuthorStatusChoices.RUNNING,
            data={},
        )

        with self.assertRaisesMessage(CommandError, "Error triggering Airflow DAG"):
            call_command("trigger_workflow_dag", str(workflow.id))

        mock_trigger_airflow_dag.assert_called_once()
