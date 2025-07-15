from backoffice.authors.constants import (
    AuthorStatusChoices,
)
from django.urls import reverse
from backoffice.common.tests.base import BaseTransactionTestCase
from django.apps import apps

AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class TestAuthorWorkflowPartialUpdateViewSet(BaseTransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(
            data={}, status=AuthorStatusChoices.APPROVAL
        )

    @property
    def endpoint(self):
        return reverse(
            "api:authors-detail",
            kwargs={"pk": self.workflow.id},
        )

    def test_patch_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.patch(
            self.endpoint, format="json", data={"status": "running"}
        )

        self.assertEqual(response.status_code, 200)
        workflow = AuthorWorkflow.objects.filter(id=self.workflow.id)[0]
        assert workflow.status == "running"

    def test_patch_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.patch(
            self.endpoint,
            format="json",
            data={
                "status": "approval",
                "data": {
                    "name": {
                        "value": "John, Snow",
                    },
                    "_collections": ["Authors"],
                },
            },
        )

        workflow = AuthorWorkflow.objects.filter(id=self.workflow.id)[0]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(workflow.status, "approval")
        self.assertEqual(
            workflow.data,
            {"name": {"value": "John, Snow"}, "_collections": ["Authors"]},
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())

    def test_patch_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)
