import uuid
import pytest
from copy import deepcopy
from django.urls import reverse
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.common import airflow_utils
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

BASE = {
    "_collections": ["Literature"],
    "titles": [
        {
            "source": "submitter",
            "title": "The MAGIS-100 Experiment and a Future, Kilometer-scale Atom Interferometer",
        }
    ],
    "document_type": ["article"],
    "$schema": "https://inspirehep.net/schemas/records/hep.json",
}


def hep_data_valid():
    data = deepcopy(BASE)
    data["authors"] = [{"full_name": "Doe, John"}]
    return data


def hep_data_invalid():
    data = deepcopy(BASE)
    data["authors"] = [{"full_name": "Gooding, James, James Andrew, Jamie."}]
    return data


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
            "status": HepStatusChoices.RUNNING,
            "data": hep_data_valid(),
        }

        url = reverse("api:hep-list")
        response = self.api_client.post(url, format="json", data=data)
        json_response = response.json()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(json_response["data"], data["data"])
        self.assertEqual(json_response["workflow_type"], data["workflow_type"])
        self.assertIn("id", json_response)

    @pytest.mark.vcr
    def test_create_hep_with_invalid_data_still_creates_workflow(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": HepStatusChoices.RUNNING,
            "data": hep_data_invalid(),
        }

        url = reverse("api:hep-list")
        response = self.api_client.post(url, format="json", data=data)
        json_response = response.json()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(json_response["data"], data["data"])
        self.assertEqual(json_response["workflow_type"], data["workflow_type"])
        self.assertIn("id", json_response)

        validate_url = reverse("api:hep-validate")
        validate_response = self.api_client.post(
            validate_url, format="json", data=hep_data_invalid()
        )

        expected_response = [
            {
                "message": "'Gooding, James, James Andrew, Jamie.' does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'",
                "path": ["authors", 0, "full_name"],
            }
        ]

        self.assertEqual(validate_response.status_code, 400)
        self.assertEqual(validate_response.json(), expected_response)

    @pytest.mark.vcr
    def test_get_hep_classifier_results_filtered(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": HepStatusChoices.RUNNING,
            "data": hep_data_valid(),
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

        json_response = detail_response.json()
        self.assertEqual(json_response["data"], data["data"])
        self.assertIn("id", json_response)

        filtered = json_response["classifier_results"]["complete_output"][
            "filtered_core_keywords"
        ]
        self.assertEqual([k["keyword"] for k in filtered], ["supersymmetry"])

    def test_get_non_existent_workflow(self):
        self.api_client.force_authenticate(user=self.curator)
        detail_url = reverse("api:hep-detail", kwargs={"pk": "THISISFORSURENOTANID"})
        detail_response = self.api_client.get(detail_url)
        self.assertEqual(detail_response.status_code, 404)
        self.assertEqual(detail_response.json()["detail"], "Not found.")

    def test_get_hep_with_errors(self):
        self.api_client.force_authenticate(user=self.curator)
        data_invalid = hep_data_invalid()
        random_id = uuid.uuid4()
        HepWorkflow.objects.create(
            data=data_invalid,
            status=HepStatusChoices.APPROVAL,
            workflow_type=HepWorkflowType.HEP_CREATE,
            id=random_id,
        )

        detail_url = reverse("api:hep-detail", kwargs={"pk": random_id})
        response = self.api_client.get(detail_url)
        json_response = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json_response["data"], data_invalid)
        self.assertNotIn("validation_errors", json_response)

        response = self.api_client.get(
            detail_url, {"include_validation_errors": "true"}
        )
        json_response = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            json_response["validation_errors"],
            [
                {
                    "message": "'Gooding, James, James Andrew, Jamie.' does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'",
                    "path": ["authors", 0, "full_name"],
                }
            ],
        )

    def test_get_hep_with_callback_url(self):
        self.api_client.force_authenticate(user=self.curator)

        cases = [
            (
                HepStatusChoices.APPROVAL_MERGE,
                "api:hep-resolve",
            ),
            (
                HepStatusChoices.ERROR_VALIDATION,
                "api:hep-restart",
            ),
            (
                HepStatusChoices.APPROVAL,
                None,
            ),
        ]

        for status, expected_route in cases:
            random_id = uuid.uuid4()
            HepWorkflow.objects.create(
                data=BASE,
                status=status,
                workflow_type=HepWorkflowType.HEP_CREATE,
                id=random_id,
            )

            detail_url = reverse("api:hep-detail", kwargs={"pk": random_id})
            response = self.api_client.get(detail_url)
            json_response = response.json()

            self.assertEqual(response.status_code, 200)
            self.assertIn("callback_url", json_response)

            if expected_route is None:
                self.assertIsNone(json_response["callback_url"])
            else:
                expected_path = reverse(expected_route, kwargs={"pk": random_id})
                self.assertIn(expected_path, json_response["callback_url"])

    def test_validate_valid_record(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-validate",
        )
        response = self.api_client.post(url, format="json", data=hep_data_valid())
        self.assertContains(response, "Record is valid.", status_code=200)

    def test_validate_not_valid_record(self):
        self.api_client.force_authenticate(user=self.curator)

        url = reverse(
            "api:hep-validate",
        )
        response = self.api_client.post(url, format="json", data=hep_data_invalid())
        expected_response = [
            {
                "message": "'Gooding, James, James Andrew, Jamie.' does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'",
                "path": ["authors", 0, "full_name"],
            }
        ]
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    def test_validate_no_schema_record(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-validate",
        )
        response = self.api_client.post(url, format="json", data={})
        self.assertContains(
            response,
            'Unable to find \\"$schema\\" key in',
            status_code=400,
        )

    def test_validate_invalid_schema_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "$schema": "https://inspirehep.net/schemas/records/notajsonschema.json",
        }
        url = reverse(
            "api:hep-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        self.assertContains(
            response,
            text='Unable to find schema \\"https://inspirehep.net/schemas/records/notajsonschema.json\\"',
            status_code=400,
        )

    def test_resolve(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-resolve",
            kwargs={"pk": self.workflow.id},
        )
        data = {
            "action": HepResolutions.auto_reject,
        }
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 200)
        self.workflow.refresh_from_db()
        self.assertEqual(
            self.workflow.decisions.first().action, HepResolutions.auto_reject
        )

    def test_batch_resolve(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-batch-resolve",
        )

        wfs_ids = []
        for _ in range(3):
            wf_id = HepWorkflow.objects.create(
                data={},
                status=HepStatusChoices.APPROVAL,
                workflow_type=HepWorkflowType.HEP_CREATE,
            )
            wfs_ids.append(wf_id.id)

        data = {
            "ids": wfs_ids,
            "action": HepResolutions.auto_reject,
        }
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 200)
        for id in wfs_ids:
            workflow = HepWorkflow.objects.get(id=id)
            self.assertEqual(
                workflow.decisions.first().action, HepResolutions.auto_reject
            )

    @pytest.mark.vcr
    def test_discard(self):
        dag_id = WORKFLOW_DAGS[self.workflow.workflow_type].initialize

        self.content, self.status_code = airflow_utils.trigger_airflow_dag(
            dag_id, str(self.workflow.id)
        )

        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-discard",
            kwargs={"pk": self.workflow.id},
        )
        data = {
            "note": "Discarding this workflow for testing purposes.",
        }
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 200)
        self.workflow.refresh_from_db()
        self.assertEqual(self.workflow.status, HepStatusChoices.COMPLETED)
        self.assertEqual(self.workflow.decisions.first().action, HepResolutions.discard)

        airflow_utils.delete_workflow_dag(dag_id, self.workflow.id)

    @pytest.mark.vcr
    def test_block(self):
        dag_id = WORKFLOW_DAGS[self.workflow.workflow_type].initialize

        self.content, self.status_code = airflow_utils.trigger_airflow_dag(
            dag_id, str(self.workflow.id)
        )

        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-block",
            kwargs={"pk": self.workflow.id},
        )
        data = {
            "note": "Blocking this workflow for testing purposes.",
        }
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 200)
        self.workflow.refresh_from_db()
        self.assertEqual(self.workflow.status, HepStatusChoices.BLOCKED)

        airflow_utils.delete_workflow_dag(dag_id, self.workflow.id)

    @pytest.mark.vcr
    def test_restart(self):
        dag_id = WORKFLOW_DAGS[self.workflow.workflow_type].initialize

        self.content, self.status_code = airflow_utils.trigger_airflow_dag(
            dag_id, str(self.workflow.id)
        )

        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-restart",
            kwargs={"pk": self.workflow.id},
        )
        data = {
            "restart_current_task": True,
        }
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 200)

        airflow_utils.delete_workflow_dag(dag_id, self.workflow.id)

    def test_restart_completed_workflow(self):
        completed_workflow = HepWorkflow.objects.create(
            data={},
            status=HepStatusChoices.COMPLETED,
            workflow_type=HepWorkflowType.HEP_CREATE,
            id=uuid.UUID(int=3),
        )
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:hep-restart",
            kwargs={"pk": completed_workflow.id},
        )
        data = {
            "restart_current_task": True,
        }
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["message"], "Cannot restart a completed workflow."
        )
