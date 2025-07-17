import uuid

from django.urls import reverse
from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.hep.api.serializers import (
    HepWorkflowSerializer,
)
from backoffice.hep.models import HepWorkflowTicket
from backoffice.hep.constants import (
    HepWorkflowType,
    HepStatusChoices,
    HepResolutionDags,
)
from django.apps import apps

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")
HepDecision = apps.get_model(app_label="hep", model_name="HepDecision")


class TestWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:hep-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = HepWorkflow.objects.create(
            data={},
            status=HepStatusChoices.APPROVAL,
            workflow_type=HepWorkflowType.HEP_CREATE,
            id=uuid.UUID(int=2),
        )

    def test_list_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_list_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_list_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)

    def test_tickets(self):
        HepWorkflowTicket.objects.create(
            workflow=self.workflow, ticket_id="123", ticket_type="hep_create_curation"
        )
        workflow_data = HepWorkflowSerializer(self.workflow).data

        assert "tickets" in workflow_data
        assert "ticket_id" in workflow_data["tickets"][0]
        assert "ticket_type" in workflow_data["tickets"][0]

    def test_decisions(self):
        HepDecision.objects.create(
            workflow=self.workflow, user=self.user, action=HepResolutionDags.accept
        )
        workflow_data = HepWorkflowSerializer(self.workflow).data
        assert "decisions" in workflow_data
        assert "action" in workflow_data["decisions"][0]
        assert "user" in workflow_data["decisions"][0]
