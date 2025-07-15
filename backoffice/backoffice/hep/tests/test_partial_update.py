from backoffice.hep.constants import HepStatusChoices
from django.urls import reverse
from backoffice.common.tests.base import BaseTransactionTestCase
from django.apps import apps

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestHepWorkflowPartialUpdateViewSet(BaseTransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = HepWorkflow.objects.create(
            data={}, status=HepStatusChoices.APPROVAL
        )

    @property
    def endpoint(self):
        return reverse(
            "api:hep-detail",
            kwargs={"pk": self.workflow.id},
        )

    def test_patch_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.patch(
            self.endpoint, format="json", data={"status": "running"}
        )

        self.assertEqual(response.status_code, 200)
        workflow = HepWorkflow.objects.filter(id=self.workflow.id)[0]
        assert workflow.status == "running"

    def test_patch_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.patch(
            self.endpoint,
            format="json",
            data={
                "status": "approval",
                "data": {
                    "titles": [
                        {
                            "title": "test title",
                        }
                    ],
                    "_collections": ["Literature"],
                    "document_type": ["article"],
                },
            },
        )

        workflow = HepWorkflow.objects.filter(id=self.workflow.id)[0]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(workflow.status, "approval")
        self.assertEqual(
            workflow.data,
            {
                "titles": [{"title": "test title"}],
                "_collections": ["Literature"],
                "document_type": ["article"],
            },
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())

    def test_patch_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)
