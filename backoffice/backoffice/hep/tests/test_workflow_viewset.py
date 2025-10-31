import uuid
import pytest
from django.urls import reverse
from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.hep.api.serializers import (
    HepWorkflowSerializer,
)
from backoffice.hep.models import HepWorkflowTicket
from backoffice.hep.constants import (
    HepWorkflowType,
    HepStatusChoices,
    HepResolutions,
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
            workflow=self.workflow, user=self.user, action=HepResolutions.exact_match
        )
        workflow_data = HepWorkflowSerializer(self.workflow).data
        assert "decisions" in workflow_data
        assert "action" in workflow_data["decisions"][0]
        assert "user" in workflow_data["decisions"][0]

    @pytest.mark.vcr
    def test_create_hep(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": "running",
            "data": {
                "_collections": ["Literature"],
                "titles": [
                    {
                        "source": "submitter",
                        "title": "The MAGIS-100 Experiment and a Future, Kilometer-scale Atom Interferometer",
                    }
                ],
                "document_type": ["article"],
                "$schema": "https://inspirehep.net/schemas/records/hep.json",
            },
        }

        url = reverse("api:hep-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["data"], data["data"])
        self.assertEqual(response.json()["workflow_type"], data["workflow_type"])
        self.assertIn("id", response.json())

    @pytest.mark.vcr
    def test_get_hep_classifier_results_filtered(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": "running",
            "data": {
                "_collections": ["Literature"],
                "titles": [{"source": "submitter", "title": "Test record"}],
                "document_type": ["article"],
                "$schema": "https://inspirehep.net/schemas/records/hep.json",
            },
            "classifier_results": {
                "categories": [{"keyword": "Higgs particle", "category": "HEP"}],
                "fulltext_used": True,
                "complete_output": {
                    "acronyms": [],
                    "field_codes": [],
                    "core_keywords": [
                        {"number": 1, "keyword": "Higgs particle"},
                        {"number": 1, "keyword": "supersymmetry"},
                    ],
                    "author_keywords": [],
                    "single_keywords": [],
                    "composite_keywords": [],
                },
            },
        }
        create_url = reverse("api:hep-list")
        response = self.api_client.post(create_url, format="json", data=data)
        self.assertEqual(response.status_code, 201)
        wf_id = response.json()["id"]

        detail_url = reverse("api:hep-detail", kwargs={"pk": wf_id})
        detail_response = self.api_client.get(detail_url)
        self.assertEqual(detail_response.status_code, 200)

        payload = detail_response.json()
        self.assertEqual(payload["data"], data["data"])
        self.assertIn("id", payload)

        filtered = payload["classifier_results"]["complete_output"][
            "filtered_core_keywords"
        ]
        self.assertEqual([k["keyword"] for k in filtered], ["supersymmetry"])
