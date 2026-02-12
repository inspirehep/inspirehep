import contextlib
import opensearchpy
from unittest.mock import patch

from backoffice.hep.constants import (
    HepStatusChoices,
    HepWorkflowType,
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

    @patch("backoffice.common.airflow_utils.trigger_airflow_dag")
    def test_post_hep_workflow_adds_document_to_index(self, mock_trigger_airflow_dag):
        self.api_client.force_authenticate(user=self.curator)
        mock_trigger_airflow_dag.return_value = ({}, 200)

        arxiv_eprint = "2507.26819"

        payload = {
            "data": {
                "titles": [
                    {
                        "title": "test_post_hep_workflow_adds_document_to_index title",
                        "source": "arXiv",
                    }
                ],
                "arxiv_eprints": [{"value": arxiv_eprint}],
                "_collections": ["Literature"],
                "fuzzy": [
                    {
                        "title": "Measurement of $t$-channel production of single ",
                        "abstract": "The production of single top quarks.",
                        "public_notes": [{"value": "Preliminary results"}],
                    }
                ],
            },
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": HepStatusChoices.RUNNING,
        }

        create_response = self.api_client.post(
            reverse("api:hep-list"),
            format="json",
            data=payload,
        )
        workflow_id = create_response.json()["id"]

        response = self.api_client.get(
            self.endpoint,
            data={"search": [f"data.arxiv_eprints.value:{arxiv_eprint}"]},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            any(result["id"] == workflow_id for result in response.json()["results"])
        )
