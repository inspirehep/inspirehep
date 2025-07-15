from backoffice.hep.api.serializers import (
    HepWorkflowTicketSerializer,
)
from backoffice.hep.models import HepWorkflowTicket

from django.urls import reverse
from backoffice.common.tests.base import BaseTransactionTestCase


from django.apps import apps

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestHepWorkflowTicketViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:hep-tickets-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = HepWorkflow.objects.create(data={}, status="running")
        self.workflow_ticket = HepWorkflowTicket.objects.create(
            workflow=self.workflow, ticket_id="123", ticket_type="hep_create_curation"
        )

    def test_get_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{self.endpoint}{self.workflow.id}/",
            format="json",
            data={},
        )

        assert response.status_code == 400
        assert response.data == {"error": "Both workflow and ticket_type are required."}

    def test_get_ticket_not_found(self):
        query_params = {"ticket_type": "test"}
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{self.endpoint}{self.workflow.id}/",
            format="json",
            data=query_params,
        )

        assert response.status_code == 404
        assert response.data == {"error": "Workflow ticket not found."}

    def test_get_ticket_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        query_params = {"ticket_type": self.workflow_ticket.ticket_type}
        response = self.api_client.get(
            f"{self.endpoint}{self.workflow.id}/",
            format="json",
            data=query_params,
        )

        assert response.status_code == 200
        assert response.data == HepWorkflowTicketSerializer(self.workflow_ticket).data

    def test_ticket_url(self):
        assert "ticket_url" in HepWorkflowTicketSerializer(self.workflow_ticket).data

    def test_create_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.post(self.endpoint, format="json", data={})

        assert response.status_code == 400
        assert response.json() == {
            "workflow": ["This field is required."],
            "ticket_id": ["This field is required."],
        }

    def test_create_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow": self.workflow.id,
            "ticket_id": "dc94caad1b4f71502d06117a3b4bcb25",
            "ticket_type": "hep_create_curation",
        }
        response = self.api_client.post(self.endpoint, format="json", data=data)

        assert response.status_code == 201

        assert "workflow" in response.data
        assert "ticket_id" in response.data
        assert "ticket_type" in response.data

        assert (
            response.data
            == HepWorkflowTicketSerializer(HepWorkflowTicket.objects.last()).data
        )
