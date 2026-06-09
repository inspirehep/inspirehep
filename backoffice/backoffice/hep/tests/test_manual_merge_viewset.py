from unittest.mock import Mock, patch

from django.apps import apps
from django.urls import reverse
from requests.exceptions import RequestException

from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.hep.constants import HepWorkflowType

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")

MANUAL_MERGE_URL = reverse("api:hep-manual-merge")
HEAD_RECORD_METADATA = {
    "_collections": ["Literature"],
    "titles": [
        {
            "source": "submitter",
            "title": "The MAGIS-100 Experiment and a Future, Kilometer-scale Atom Interferometer",
        }
    ],
    "document_type": ["article"],
    "$schema": "https://inspirehep.net/schemas/records/hep.json",
    "control_number": 111,
    "authors": [{"full_name": "Doe, John"}],
}


class TestManualMergeViewSet(BaseTransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def _mock_inspirehep_response(self, metadata):
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.json.return_value = {"metadata": metadata}
        return mock_response

    @patch("backoffice.hep.api.views.requests.get")
    @patch("backoffice.common.airflow_utils.trigger_airflow_dag")
    def test_manual_merge_creates_workflow_with_head_data(
        self, mock_trigger_dag, mock_get
    ):
        mock_get.return_value = self._mock_inspirehep_response(HEAD_RECORD_METADATA)
        mock_trigger_dag.return_value = ({}, 200)
        self.api_client.force_authenticate(user=self.curator)

        response = self.api_client.post(
            MANUAL_MERGE_URL,
            format="json",
            data={"head_control_number": 111, "update_control_number": 222},
        )

        self.assertEqual(response.status_code, 200)
        json_response = response.json()
        self.assertEqual(
            json_response["workflow_type"], HepWorkflowType.HEP_MANUAL_MERGE
        )
        self.assertEqual(json_response["data"], HEAD_RECORD_METADATA)
        self.assertIn("id", json_response)
        self.assertTrue(HepWorkflow.objects.filter(id=json_response["id"]).exists())

    @patch("backoffice.hep.api.views.requests.get")
    @patch("backoffice.common.airflow_utils.trigger_airflow_dag")
    def test_manual_merge_triggers_dag_with_correct_params(
        self, mock_trigger_dag, mock_get
    ):
        mock_get.return_value = self._mock_inspirehep_response(HEAD_RECORD_METADATA)
        mock_trigger_dag.return_value = ({}, 200)
        self.api_client.force_authenticate(user=self.curator)

        response = self.api_client.post(
            MANUAL_MERGE_URL,
            format="json",
            data={"head_control_number": 111, "update_control_number": 222},
        )

        self.assertEqual(response.status_code, 200)
        workflow_id = response.json()["id"]
        mock_trigger_dag.assert_called_once_with(
            "hep_manual_merge_dag",
            str(workflow_id),
            head_control_number=111,
            update_control_number=222,
        )

    @patch("backoffice.hep.api.views.requests.get")
    def test_manual_merge_returns_error_when_head_fetch_fails(self, mock_get):
        mock_get.side_effect = RequestException("inspirehep unreachable")
        self.api_client.force_authenticate(user=self.curator)

        response = self.api_client.post(
            MANUAL_MERGE_URL,
            format="json",
            data={"head_control_number": 111, "update_control_number": 222},
        )

        self.assertEqual(response.status_code, 502)
        self.assertFalse(
            HepWorkflow.objects.filter(
                workflow_type=HepWorkflowType.HEP_MANUAL_MERGE
            ).exists()
        )

    @patch("backoffice.hep.api.views.requests.get")
    @patch(
        "backoffice.common.airflow_utils.trigger_airflow_dag",
        side_effect=RequestException("Airflow unavailable"),
    )
    def test_manual_merge_returns_error_when_dag_trigger_fails(
        self, mock_trigger_dag, mock_get
    ):
        mock_get.return_value = self._mock_inspirehep_response(HEAD_RECORD_METADATA)
        self.api_client.force_authenticate(user=self.curator)

        response = self.api_client.post(
            MANUAL_MERGE_URL,
            format="json",
            data={"head_control_number": 111, "update_control_number": 222},
        )

        self.assertEqual(response.status_code, 502)

    def test_manual_merge_returns_400_for_missing_fields(self):
        self.api_client.force_authenticate(user=self.curator)

        response = self.api_client.post(
            MANUAL_MERGE_URL,
            format="json",
            data={"head_control_number": 111},
        )

        self.assertEqual(response.status_code, 400)

    def test_manual_merge_returns_400_for_same_control_numbers(self):
        self.api_client.force_authenticate(user=self.curator)

        response = self.api_client.post(
            MANUAL_MERGE_URL,
            format="json",
            data={"head_control_number": 111, "update_control_number": 111},
        )

        self.assertEqual(response.status_code, 400)
