import contextlib
import opensearchpy

from backoffice.authors.constants import (
    AuthorStatusChoices,
)

from django.urls import reverse
from django.conf import settings
from backoffice.common.utils import get_index_for_document
from backoffice.common.tests.base import BaseTransactionTestCase

from django.apps import apps

AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class TestAuthorWorkflowSearchViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        index = get_index_for_document(settings.AUTHORS_DOCUMENTS)
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        self.workflow = AuthorWorkflow.objects.create(
            data={}, status=AuthorStatusChoices.APPROVAL
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
