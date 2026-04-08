from unittest.mock import Mock, patch
from types import SimpleNamespace
import pytest
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

    @patch("requests.patch")
    def test_complete_workflow(self, mock_patch):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_patch.return_value = mock_response

        request_data = {
            "note": "completing workflow",
        }

        complete_workflow(self.workflow.id, request_data)

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
