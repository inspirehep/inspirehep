import contextlib
import opensearchpy

from backoffice.hep.constants import (
    HepStatusChoices,
)
from django.urls import reverse
from django.conf import settings
from backoffice.common.utils import get_index_for_document
from backoffice.common.tests.base import BaseTransactionTestCase

from django.apps import apps

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestHepWorkflowSearchViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:hep-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        index = get_index_for_document(settings.HEP_DOCUMENTS)
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        self.workflow = HepWorkflow.objects.create(
            data={}, status=HepStatusChoices.APPROVAL
        )

    def test_list_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_list_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_list_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)

    def test_contains_decisions(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)
        self.assertIn("decisions", response.json()["results"][0])
