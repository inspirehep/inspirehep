import json
from unittest.mock import MagicMock, patch
import uuid

import pytest
from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS

from django.urls import reverse
from requests.exceptions import RequestException
from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.authors.api.serializers import (
    AuthorWorkflowSerializer,
)
from rest_framework import status
from backoffice.authors.models import AuthorWorkflowTicket
from backoffice.authors.constants import (
    AuthorCreateDags,
    AuthorResolutionDags,
    AuthorStatusChoices,
    AuthorWorkflowType,
)
from django.apps import apps

AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")
AuthorDecision = apps.get_model(app_label="authors", model_name="AuthorDecision")


class TestAuthorWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        self.workflow = AuthorWorkflow.objects.create(
            data={"test": "test"},
            status="running",
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
            id=uuid.UUID(int=0),
        )
        airflow_utils.trigger_airflow_dag(
            WORKFLOW_DAGS[self.workflow.workflow_type].initialize,
            self.workflow.id,
            self.workflow.data,
        )

    def tearDown(self):
        super().tearDown()
        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[self.workflow.workflow_type].initialize, self.workflow.id
        )

    @pytest.mark.vcr
    def test_create_author(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": AuthorWorkflowType.AUTHOR_CREATE,
            "status": "running",
            "data": {
                "name": {
                    "value": "John, Snow",
                },
                "_collections": ["Authors"],
                "$schema": "https://inspirehep.net/schemas/records/authors.json",
            },
        }

        url = reverse("api:authors-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["data"], data["data"])
        self.assertEqual(response.json()["workflow_type"], data["workflow_type"])
        self.assertIn("id", response.json())

    @pytest.mark.vcr
    @patch("backoffice.common.airflow_utils.trigger_airflow_dag")
    def test_create_returns_503_if_airflow_fails(self, mock_trigger_airflow_dag):
        self.api_client.force_authenticate(user=self.curator)
        mock_response = MagicMock()
        mock_response.status_code = 503
        mock_response.text = "Service Unavailable"
        mock_response.json.side_effect = json.JSONDecodeError("Expecting value", "", 0)
        mock_trigger_airflow_dag.side_effect = RequestException(response=mock_response)
        data = {
            "workflow_type": AuthorWorkflowType.AUTHOR_CREATE,
            "status": "running",
            "data": {
                "name": {"value": "John, Snow"},
                "_collections": ["Authors"],
                "$schema": "https://inspirehep.net/schemas/records/authors.json",
            },
        }
        url = reverse("api:authors-list")
        response = self.api_client.post(url, format="json", data=data)

        assert response.status_code == 503
        assert response.json() == {"error": "Error triggering Airflow DAG"}

    @pytest.mark.vcr
    def test_get_author(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "workflow_type": AuthorWorkflowType.AUTHOR_CREATE,
            "status": "running",
            "data": {
                "name": {
                    "value": "John, Snow",
                },
                "_collections": ["Authors"],
                "$schema": "https://inspirehep.net/schemas/records/authors.json",
            },
        }
        url = reverse("api:authors-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 201)

        detail_url = reverse("api:authors-detail", kwargs={"pk": response.json()["id"]})
        detail_response = self.api_client.get(detail_url)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["data"], data["data"])
        self.assertEqual(detail_response.json()["validation_errors"], [])

    @pytest.mark.vcr
    def test_get_non_existent_author(self):
        self.api_client.force_authenticate(user=self.curator)
        detail_url = reverse(
            "api:authors-detail", kwargs={"pk": "THISISFORSURENOTANID"}
        )
        detail_response = self.api_client.get(detail_url)
        self.assertEqual(detail_response.status_code, 404)
        self.assertEqual(detail_response.json()["detail"], "Not found.")

    @pytest.mark.vcr
    def test_get__author_with_errors(self):
        self.api_client.force_authenticate(user=self.curator)
        author_data = {
            "name": {
                "value": "Gooding, James, James Andrew, Jamie.",
                "name_variants": ["James Andrew"],
            },
            "_collections": ["Authors"],
        }
        random_id = uuid.uuid4()
        AuthorWorkflow.objects.create(
            data=author_data,
            status="running",
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
            id=random_id,
        )

        detail_url = reverse("api:authors-detail", kwargs={"pk": random_id})
        detail_response = self.api_client.get(detail_url)

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["data"], author_data)
        self.assertEqual(
            detail_response.json()["validation_errors"],
            [
                {
                    "message": "'Gooding, James, James Andrew, Jamie.' does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'",
                    "path": ["name", "value"],
                }
            ],
        )

    @pytest.mark.vcr
    def test_accept_author(self):
        self.api_client.force_authenticate(user=self.curator)
        action = "accept"
        data = {"create_ticket": True, "value": action}

        response = self.api_client.post(
            reverse("api:authors-resolve", kwargs={"pk": self.workflow.id}),
            format="json",
            data=data,
        )
        workflow = AuthorWorkflow.objects.get(id=self.workflow.id)
        self.assertEqual(workflow.status, AuthorStatusChoices.PROCESSING)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            AuthorDecision.objects.filter(workflow=self.workflow.id)[0].action, action
        )
        response = response.json()
        self.assertEqual(response["id"], str(self.workflow.id))
        self.assertIn("decisions", response)
        self.assertEqual(response["status"], "processing")

        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[AuthorWorkflowType.AUTHOR_CREATE].approve, self.workflow.id
        )

    @pytest.mark.vcr
    def test_reject_author(self):
        self.api_client.force_authenticate(user=self.curator)
        action = "reject"
        data = {"create_ticket": True, "value": action}

        response = self.api_client.post(
            reverse("api:authors-resolve", kwargs={"pk": self.workflow.id}),
            format="json",
            data=data,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            AuthorDecision.objects.filter(workflow=self.workflow.id)[0].action, action
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())

        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[AuthorWorkflowType.AUTHOR_CREATE].reject, self.workflow.id
        )

    @pytest.mark.vcr
    def test_restart_successful_dagrun(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:authors-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["error"],
            "Workflow has already run successfully. Skipping restart.",
        )

    @pytest.mark.vcr
    def test_restart_failed_dagrun(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:authors-restart",
            kwargs={"pk": self.workflow.id},
        )

        response = self.api_client.post(url)

        self.assertEqual(response.status_code, 200)
        self.assertIn("test", response.json()["data"])

    @pytest.mark.vcr
    def test_restart_full_dagrun_without_ran_dags(self):
        self.api_client.force_authenticate(user=self.curator)

        workflow = AuthorWorkflow.objects.create(
            data={"test": "test"},
            status="running",
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
            id=uuid.UUID(int=6),
        )

        url = reverse(
            "api:authors-restart",
            kwargs={"pk": workflow.id},
        )

        response = self.api_client.post(url)
        self.assertEqual(response.status_code, 200)

    @pytest.mark.vcr
    def test_restart_a_task(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:authors-restart",
            kwargs={"pk": self.workflow.id},
        )

        response = self.api_client.post(
            url, format="json", data={"restart_current_task": True}
        )
        self.assertEqual(response.status_code, 200)

    @pytest.mark.vcr
    def test_restart_current_task_without_failed_dags(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:authors-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(
            url, format="json", data={"restart_current_task": True}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"error": "No failed tasks found to restart. Skipping restart."},
        )

    @pytest.mark.vcr
    def test_restart_with_params(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:authors-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(
            url, format="json", data={"params": {"workflow": {"id": self.workflow.id}}}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], str(self.workflow.id))

    @pytest.mark.vcr
    def test_validate_valid_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "name": {
                "value": "John, Snow",
            },
            "_collections": ["Authors"],
            "$schema": "https://inspirehep.net/schemas/records/authors.json",
        }
        url = reverse(
            "api:authors-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        self.assertContains(response, "Record is valid.", status_code=200)

    @pytest.mark.vcr
    def test_validate_not_valid_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "name": {
                "value": "Gooding, James, James Andrew, Jamie.",
                "name_variants": ["James Andrew"],
            },
            "$schema": "https://inspirehep.net/schemas/records/authors.json",
            "_collections": ["Authors"],
        }
        url = reverse(
            "api:authors-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        expected_response = [
            {
                "message": (
                    "'Gooding, James, James Andrew, Jamie.' "
                    "does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'"
                ),
                "path": ["name", "value"],
            },
        ]
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    @pytest.mark.vcr
    def test_validate_no_schema_record(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:authors-validate",
        )
        response = self.api_client.post(url, format="json", data={})
        self.assertContains(
            response,
            'Unable to find \\"$schema\\" key in',
            status_code=400,
        )

    @pytest.mark.vcr
    def test_validate_invalid_schema_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "$schema": "https://inspirehep.net/schemas/records/notajsonschema.json",
        }
        url = reverse(
            "api:authors-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        self.assertContains(
            response,
            text='Unable to find schema \\"https://inspirehep.net/schemas/records/notajsonschema.json\\"',
            status_code=400,
        )


class TestWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(
            data={},
            status=AuthorStatusChoices.APPROVAL,
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
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
        AuthorWorkflowTicket.objects.create(
            workflow=self.workflow, ticket_id="123", ticket_type="author_create_user"
        )
        workflow_data = AuthorWorkflowSerializer(self.workflow).data

        assert "tickets" in workflow_data
        assert "ticket_id" in workflow_data["tickets"][0]
        assert "ticket_type" in workflow_data["tickets"][0]

    def test_decisions(self):
        AuthorDecision.objects.create(
            workflow=self.workflow, user=self.user, action=AuthorResolutionDags.accept
        )
        workflow_data = AuthorWorkflowSerializer(self.workflow).data
        assert "decisions" in workflow_data
        assert "action" in workflow_data["decisions"][0]
        assert "user" in workflow_data["decisions"][0]

    @pytest.mark.vcr
    def test_delete(self):
        self.api_client.force_authenticate(user=self.curator)
        airflow_utils.trigger_airflow_dag(
            AuthorCreateDags.initialize, str(self.workflow.id)
        )
        assert airflow_utils.find_executed_dags(
            self.workflow.id, self.workflow.workflow_type
        )

        url = reverse("api:authors-detail", kwargs={"pk": self.workflow.id})
        response = self.api_client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        assert (
            airflow_utils.find_executed_dags(
                self.workflow.id, self.workflow.workflow_type
            )
            == {}
        )
