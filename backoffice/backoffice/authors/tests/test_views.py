import contextlib
import json
from unittest.mock import MagicMock, patch
import uuid

import dateutil
import dateutil.parser
import opensearchpy
import pytest
from backoffice.authors import airflow_utils
from backoffice.authors.api.serializers import (
    AuthorWorkflowTicketSerializer,
    AuthorWorkflowSerializer,
)
from backoffice.authors.constants import (
    WORKFLOW_DAGS,
    AuthorCreateDags,
    AuthorResolutionDags,
    StatusChoices,
    WorkflowType,
)
from backoffice.authors.models import AuthorWorkflowTicket
from django.apps import apps
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from django.urls import reverse
from django_opensearch_dsl.registries import registry
from parameterized import parameterized
from requests.exceptions import RequestException
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()
AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")
AuthorDecision = apps.get_model(app_label="authors", model_name="AuthorDecision")


class BaseTransactionTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        self.curator_group = Group.objects.get(name="curator")
        self.admin_group = Group.objects.get(name="admin")

        self.curator = User.objects.create_user(
            email="curator@test.com", password="12345"
        )
        self.admin = User.objects.create_user(email="admin@test.com", password="12345")
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

        self.curator.groups.add(self.curator_group)
        self.admin.groups.add(self.admin_group)

        self.api_client = APIClient()


class TestWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(
            data={},
            status=StatusChoices.APPROVAL,
            workflow_type=WorkflowType.AUTHOR_CREATE,
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


class TestAuthorWorkflowSearchViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        index = registry.get_indices().pop()
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        self.workflow = AuthorWorkflow.objects.create(
            data={}, status=StatusChoices.APPROVAL
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


class TestAuthorWorkflowPartialUpdateViewSet(BaseTransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(
            data={}, status=StatusChoices.APPROVAL
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


class TestAuthorWorkflowTicketViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:authors-tickets-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(data={}, status="running")
        self.workflow_ticket = AuthorWorkflowTicket.objects.create(
            workflow=self.workflow, ticket_id="123", ticket_type="author_create_user"
        )

    def test_get_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{self.endpoint}{self.workflow.id}/",
            format="json",
            data={},
        )

        assert response.status_code == 400
        assert response.data == {"error": "Both workflow and ticket_type are required."}

    def test_get_ticket_not_found(self):
        query_params = {"ticket_type": "test"}
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{self.endpoint}{self.workflow.id}/",
            format="json",
            data=query_params,
        )

        assert response.status_code == 404
        assert response.data == {"error": "Workflow ticket not found."}

    def test_get_ticket_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        query_params = {"ticket_type": self.workflow_ticket.ticket_type}
        response = self.api_client.get(
            f"{self.endpoint}{self.workflow.id}/",
            format="json",
            data=query_params,
        )

        assert response.status_code == 200
        assert (
            response.data == AuthorWorkflowTicketSerializer(self.workflow_ticket).data
        )

    def test_ticket_url(self):
        assert "ticket_url" in AuthorWorkflowTicketSerializer(self.workflow_ticket).data

    def test_create_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.post(self.endpoint, format="json", data={})

        assert response.status_code == 400
        assert response.json() == {
            "workflow": ["This field is required."],
            "ticket_id": ["This field is required."],
        }

    def test_create_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow": self.workflow.id,
            "ticket_id": "dc94caad1b4f71502d06117a3b4bcb25",
            "ticket_type": "author_create_user",
        }
        response = self.api_client.post(self.endpoint, format="json", data=data)

        assert response.status_code == 201

        assert "workflow" in response.data
        assert "ticket_id" in response.data
        assert "ticket_type" in response.data

        assert (
            response.data
            == AuthorWorkflowTicketSerializer(AuthorWorkflowTicket.objects.last()).data
        )


class TestAuthorWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        self.workflow = AuthorWorkflow.objects.create(
            data={"test": "test"},
            status="running",
            workflow_type=WorkflowType.AUTHOR_CREATE,
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
            "workflow_type": WorkflowType.AUTHOR_CREATE,
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
    @patch("backoffice.authors.airflow_utils.trigger_airflow_dag")
    def test_create_returns_503_if_airflow_fails(self, mock_trigger_airflow_dag):
        self.api_client.force_authenticate(user=self.curator)
        mock_response = MagicMock()
        mock_response.status_code = 503
        mock_response.text = "Service Unavailable"
        mock_response.json.side_effect = json.JSONDecodeError("Expecting value", "", 0)
        mock_trigger_airflow_dag.side_effect = RequestException(response=mock_response)
        data = {
            "workflow_type": WorkflowType.AUTHOR_CREATE,
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
            "workflow_type": WorkflowType.AUTHOR_CREATE,
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
            workflow_type=WorkflowType.AUTHOR_CREATE,
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
        self.assertEqual(workflow.status, StatusChoices.PROCESSING)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            AuthorDecision.objects.filter(workflow=self.workflow.id)[0].action, action
        )
        response = response.json()
        self.assertEqual(response["id"], str(self.workflow.id))
        self.assertIn("decisions", response)
        self.assertEqual(response["status"], "processing")

        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[WorkflowType.AUTHOR_CREATE].approve, self.workflow.id
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
            WORKFLOW_DAGS[WorkflowType.AUTHOR_CREATE].reject, self.workflow.id
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
            "Workflow has already ran successfully. Skipping restart.",
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
            workflow_type=WorkflowType.AUTHOR_CREATE,
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


class TestAuthorWorkflowSearchFilterViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        index = registry.get_indices().pop()
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        AuthorWorkflow.objects.update_or_create(
            data={
                "ids": [
                    {"value": "0000-0003-3302-3333", "schema": "ORCID"},
                    {"value": "CastleFrank", "schema": "INSPIRE BAI"},
                ],
                "name": {"value": "Castle, Frank", "preferred_name": "Frank Castle"},
                "email_addresses": [
                    {"value": "frank.castle@someting.ch", "current": True}
                ],
            },
            status=StatusChoices.APPROVAL,
            workflow_type=WorkflowType.AUTHOR_CREATE,
        )
        AuthorWorkflow.objects.update_or_create(
            data={
                "ids": [
                    {"value": "0000-0003-3302-2222", "schema": "ORCID"},
                    {"value": "SmithJohn", "schema": "INSPIRE BAI"},
                ],
                "name": {"value": "Smith, John", "preferred_name": "John Smith"},
                "email_addresses": [
                    {"value": "john.smith@something.ch", "current": True}
                ],
            },
            status=StatusChoices.RUNNING,
            workflow_type=WorkflowType.AUTHOR_CREATE,
        )

    def test_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)

        assert "_filter_status" in response.json()["facets"]
        assert "_filter_workflow_type" in response.json()["facets"]

    def test_search_data_name(self):
        self.api_client.force_authenticate(user=self.admin)

        url = self.endpoint + "?search=John"

        response = self.api_client.get(url)
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["name"]["value"] == "Smith, John"

    @parameterized.expand(["?search=", "?search=data.email_addresses.value:"])
    def test_search_data_email(self, query_params):
        self.api_client.force_authenticate(user=self.admin)

        email = "john.smith@something.ch"

        url = self.endpoint + f"{query_params}{email}"

        response = self.api_client.get(url)
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["email_addresses"][0]["value"] == email

    def test_filter_status(self):
        self.api_client.force_authenticate(user=self.admin)

        url = self.endpoint + f"?status={StatusChoices.RUNNING}"

        response = self.api_client.get(url)

        for item in response.json()["results"]:
            assert item["status"] == StatusChoices.RUNNING

    def test_filter_workflow_type(self):
        self.api_client.force_authenticate(user=self.admin)

        url = self.endpoint + f'?workflow_type="={WorkflowType.AUTHOR_CREATE}'

        response = self.api_client.get(url)

        for item in response.json()["results"]:
            assert item["workflow_type"] == WorkflowType.AUTHOR_CREATE

    def test_ordering_updated_at(self):
        self.api_client.force_authenticate(user=self.admin)

        urls = [self.endpoint, self.endpoint + "?ordering=-_updated_at"]

        for url in urls:
            response = self.api_client.get(url)

            previous_date = None
            for item in response.json()["results"]:
                cur_date = dateutil.parser.parse(item["_updated_at"])
                if previous_date is not None:
                    assert cur_date < previous_date
                previous_date = cur_date

    def test_ordering_score(self):
        self.api_client.force_authenticate(user=self.admin)

        search_str = "search=Frank Castle^10 OR John^6"

        url = self.endpoint + f"?ordering=_score&{search_str}"
        response = self.api_client.get(url)
        self.assertEqual(
            response.json()["results"][0]["data"]["name"]["preferred_name"],
            "John Smith",
        )

        url = self.endpoint + f"?ordering=-_score&{search_str}"
        response = self.api_client.get(url)
        self.assertEqual(
            response.json()["results"][0]["data"]["name"]["preferred_name"],
            "Frank Castle",
        )


class TestDecisionsViewSet(BaseTransactionTestCase):
    endpoint = "/api/decisions"
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
