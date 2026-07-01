from unittest.mock import patch
from types import SimpleNamespace
import pytest
import requests
import uuid
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError
from backoffice.hep.utils import (
    resolve_workflow,
    complete_workflow,
    get_restored_hep_workflow_type,
)

from backoffice.hep.constants import HepStatusChoices, HepResolutions, HepWorkflowType
from backoffice.hep.models import HepDecision
from backoffice.hep.utils import add_hep_decision

User = get_user_model()
HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestUtils(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = HepWorkflow.objects.create(
            data={}, status=HepStatusChoices.APPROVAL
        )
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

    def test_add_decision(self):
        decision_data = add_hep_decision(
            self.workflow.id,
            self.user,
            HepResolutions.hep_accept,
        )
        self.assertIsNotNone(decision_data)

    def test_add_decision_is_idempotent(self):
        first = add_hep_decision(
            self.workflow.id, self.user, HepResolutions.auto_reject
        )
        second = add_hep_decision(
            self.workflow.id, self.user, HepResolutions.auto_reject
        )
        self.assertEqual(
            HepDecision.objects.filter(
                workflow=self.workflow, action=HepResolutions.auto_reject
            ).count(),
            1,
        )
        self.assertIsNotNone(second)
        self.assertEqual(first["action"], second["action"])

    def test_add_decision_validation_errors(self):
        with pytest.raises(ValidationError):
            add_hep_decision(
                self.workflow.id,
                self.user,
                "wrong",
            )

        with pytest.raises(ValidationError):
            add_hep_decision(
                uuid.UUID(int=0),
                self.user,
                HepResolutions.hep_accept,
            )

    def test_resolve_workflow(self):
        decision_data = {
            "action": HepResolutions.auto_reject,
            "value": "",
        }
        workflow = resolve_workflow(self.workflow.id, decision_data, self.user)
        self.assertEqual(workflow.status, HepStatusChoices.RUNNING)
        self.assertEqual(workflow.decisions.first().action, HepResolutions.auto_reject)

        resolve_workflow(self.workflow.id, decision_data, self.user)
        self.assertEqual(
            HepDecision.objects.filter(
                workflow=self.workflow, action=HepResolutions.auto_reject
            ).count(),
            1,
        )

    @patch("backoffice.hep.utils.airflow_utils.mark_airflow_dag_run_as_success")
    def test_complete_workflow(self, mock_mark_success):
        request_data = {
            "note": "completing workflow",
        }

        workflow = complete_workflow(self.workflow.id, request_data)

        self.assertEqual(workflow, self.workflow)
        mock_mark_success.assert_called_once_with(
            self.workflow, note="completing workflow"
        )

    @patch("backoffice.hep.utils.logger")
    @patch("backoffice.hep.utils.airflow_utils.mark_airflow_dag_run_as_success")
    def test_complete_workflow_logs_and_continues_on_airflow_404(
        self, mock_mark_success, mock_logger
    ):
        request_data = {
            "note": "completing workflow",
        }
        response = requests.Response()
        response.status_code = 404
        mock_mark_success.side_effect = requests.exceptions.HTTPError(
            "404 Client Error", response=response
        )

        workflow = complete_workflow(self.workflow.id, request_data)

        self.assertEqual(workflow, self.workflow)
        mock_mark_success.assert_called_once_with(
            self.workflow, note="completing workflow"
        )
        mock_logger.error.assert_called_once_with(
            f"Error occurred while marking DAG run as success for workflow {self.workflow.id}: 404 Client Error"
        )

    @patch("backoffice.hep.utils.logger")
    @patch("backoffice.hep.utils.airflow_utils.mark_airflow_dag_run_as_success")
    def test_complete_workflow_does_not_log_non_404_http_errors(
        self, mock_mark_success, mock_logger
    ):
        request_data = {
            "note": "completing workflow",
        }
        response = requests.Response()
        response.status_code = 500
        mock_mark_success.side_effect = requests.exceptions.HTTPError(
            "500 Server Error", response=response
        )

        with pytest.raises(requests.exceptions.HTTPError, match="500 Server Error"):
            complete_workflow(self.workflow.id, request_data)

        mock_mark_success.assert_called_once_with(
            self.workflow, note="completing workflow"
        )
        mock_logger.error.assert_not_called()

    def test_get_restored_hep_workflow_type_for_publisher(self):
        workflow = SimpleNamespace(
            workflow_type=HepWorkflowType.HEP_PUBLISHER_UPDATE,
            source_data={},
        )

        restored_type = get_restored_hep_workflow_type(workflow)

        self.assertEqual(restored_type, HepWorkflowType.HEP_PUBLISHER_CREATE)

    def test_get_restored_hep_workflow_type_for_submission(self):
        workflow = SimpleNamespace(
            workflow_type=HepWorkflowType.HEP_UPDATE,
            source_data={"acquisition_source": {"method": "submitter"}},
        )

        restored_type = get_restored_hep_workflow_type(workflow)

        self.assertEqual(restored_type, HepWorkflowType.HEP_SUBMISSION)

    def test_get_restored_hep_workflow_type_for_arxiv(self):
        workflow = SimpleNamespace(
            workflow_type=HepWorkflowType.HEP_UPDATE,
            source_data={},
        )

        restored_type = get_restored_hep_workflow_type(workflow)

        self.assertEqual(restored_type, HepWorkflowType.HEP_CREATE)
