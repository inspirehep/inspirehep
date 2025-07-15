from backoffice.common.tests.base import BaseTransactionTestCase
from django.urls import reverse
from rest_framework import status

from django.apps import apps

AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class TestDecisionsViewSet(BaseTransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(data={}, status="running")

    def test_create_decision(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "workflow_id": self.workflow.id,
            "action": "accept",
        }

        url = reverse("api:authors-decisions-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
