import contextlib
import uuid

import dateutil
import dateutil.parser
import opensearchpy
import pytest
from django.apps import apps
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from django.urls import reverse
from django_opensearch_dsl.registries import registry
from rest_framework import status
from rest_framework.test import APIClient

from backoffice.workflows import airflow_utils
from backoffice.workflows.api.serializers import (
    WorkflowSerializer,
    WorkflowTicketSerializer,
)
from backoffice.workflows.constants import (
    WORKFLOW_DAGS,
    AuthorCreateDags,
    ResolutionDags,
    StatusChoices,
    WorkflowType,
)
from backoffice.workflows.models import WorkflowTicket

User = get_user_model()
Workflow = apps.get_model(app_label="workflows", model_name="Workflow")
Decision = apps.get_model(app_label="workflows", model_name="Decision")


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
    endpoint = "/api/workflows/"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = Workflow.objects.create(
            data={},
            status=StatusChoices.APPROVAL,
            core=True,
            is_update=False,
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
        WorkflowTicket.objects.create(
            workflow=self.workflow, ticket_id="123", ticket_type="author_create_user"
        )
        workflow_data = WorkflowSerializer(self.workflow).data

        assert "tickets" in workflow_data
        assert "ticket_id" in workflow_data["tickets"][0]
        assert "ticket_type" in workflow_data["tickets"][0]

    def test_decisions(self):
        Decision.objects.create(
            workflow=self.workflow, user=self.user, action=ResolutionDags.accept
        )
        workflow_data = WorkflowSerializer(self.workflow).data
        assert "decisions" in workflow_data
        assert "action" in workflow_data["decisions"][0]
        assert "user" in workflow_data["decisions"][0]

    @pytest.mark.vcr()
    def test_delete(self):
        self.api_client.force_authenticate(user=self.curator)
        airflow_utils.trigger_airflow_dag(
            AuthorCreateDags.initialize, str(self.workflow.id)
        )
        assert airflow_utils.find_executed_dags(
            self.workflow.id, self.workflow.workflow_type
        )

        url = reverse("api:workflows-detail", kwargs={"pk": self.workflow.id})
        response = self.api_client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        assert (
            airflow_utils.find_executed_dags(
                self.workflow.id, self.workflow.workflow_type
            )
            == {}
        )


class TestWorkflowSearchViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:workflow-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        index = registry.get_indices().pop()
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        self.workflow = Workflow.objects.create(
            data={}, status=StatusChoices.APPROVAL, core=True, is_update=False
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
    endpoint_base_url = "/api/workflow-update"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = Workflow.objects.create(
            data={}, status=StatusChoices.APPROVAL, core=True, is_update=False
        )

    @property
    def endpoint(self):
        return reverse(
            "api:workflows-authors-detail",
            kwargs={"pk": self.workflow.id},
        )

    def test_patch_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.patch(
            self.endpoint, format="json", data={"status": "running"}
        )

        self.assertEqual(response.status_code, 200)
        workflow = Workflow.objects.filter(id=self.workflow.id)[0]
        assert workflow.status == "running"

    def test_patch_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.patch(
            self.endpoint,
            format="json",
            data={"status": "approval", "data": {"test": "test"}},
        )

        workflow = Workflow.objects.filter(id=self.workflow.id)[0]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(workflow.status, "approval")
        self.assertEqual(
            workflow.data,
            {
                "test": "test",
            },
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())

    def test_patch_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)


class TestWorkflowTicketViewSet(BaseTransactionTestCase):
    endpoint = "/api/workflow-ticket"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = Workflow.objects.create(
            data={}, status="running", core=True, is_update=False
        )
        self.workflow_ticket = WorkflowTicket.objects.create(
            workflow=self.workflow, ticket_id="123", ticket_type="author_create_user"
        )

    def test_get_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{TestWorkflowTicketViewSet.endpoint}/{self.workflow.id}/",
            format="json",
            data={},
        )

        assert response.status_code == 400
        assert response.data == {"error": "Both workflow and ticket_type are required."}

    def test_get_ticket_not_found(self):
        query_params = {"ticket_type": "test"}
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{TestWorkflowTicketViewSet.endpoint}/{self.workflow.id}/",
            format="json",
            data=query_params,
        )

        assert response.status_code == 404
        assert response.data == {"error": "Workflow ticket not found."}

    def test_get_ticket_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        query_params = {"ticket_type": self.workflow_ticket.ticket_type}
        response = self.api_client.get(
            f"{TestWorkflowTicketViewSet.endpoint}/{self.workflow.id}/",
            format="json",
            data=query_params,
        )

        assert response.status_code == 200
        assert response.data == WorkflowTicketSerializer(self.workflow_ticket).data

    def test_ticket_url(self):
        assert "ticket_url" in WorkflowTicketSerializer(self.workflow_ticket).data

    def test_create_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.post(
            f"{TestWorkflowTicketViewSet.endpoint}/", format="json", data={}
        )

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
        response = self.api_client.post(
            f"{TestWorkflowTicketViewSet.endpoint}/", format="json", data=data
        )

        assert response.status_code == 201

        assert "workflow" in response.data
        assert "ticket_id" in response.data
        assert "ticket_type" in response.data

        assert (
            response.data
            == WorkflowTicketSerializer(WorkflowTicket.objects.last()).data
        )


class TestAuthorWorkflowViewSet(BaseTransactionTestCase):
    endpoint = "/api/authors/"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        self.workflow = Workflow.objects.create(
            data={},
            status="running",
            core=True,
            is_update=False,
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

    @pytest.mark.vcr()
    def test_create_author(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": WorkflowType.AUTHOR_CREATE,
            "status": "running",
            "data": {
                "native_name": "NATIVE_NAME",
                "alternate_name": "NAME",
                "display_name": "FIRST_NAME",
                "family_name": "LAST_NAME",
                "given_name": "GIVEN_NAME",
            },
        }

        url = reverse("api:workflows-authors-list")
        response = self.api_client.post(url, format="json", data=data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), data)

    @pytest.mark.vcr()
    def test_accept_author(self):
        self.api_client.force_authenticate(user=self.curator)
        action = "accept"
        data = {"create_ticket": True, "value": action}

        response = self.api_client.post(
            reverse("api:workflows-authors-resolve", kwargs={"pk": self.workflow.id}),
            format="json",
            data=data,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Decision.objects.filter(workflow=self.workflow.id)[0].action, action
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())
        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[WorkflowType.AUTHOR_CREATE].approve, self.workflow.id
        )

    @pytest.mark.vcr()
    def test_reject_author(self):
        self.api_client.force_authenticate(user=self.curator)
        action = "reject"
        data = {"create_ticket": True, "value": action}

        response = self.api_client.post(
            reverse("api:workflows-authors-resolve", kwargs={"pk": self.workflow.id}),
            format="json",
            data=data,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            Decision.objects.filter(workflow=self.workflow.id)[0].action, action
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())

        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[WorkflowType.AUTHOR_CREATE].reject, self.workflow.id
        )

    @pytest.mark.vcr()
    def test_restart_full_dagrun(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:workflows-authors-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(url)

        self.assertEqual(response.status_code, 200)

    @pytest.mark.vcr()
    def test_restart_a_task(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:workflows-authors-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(
            url, json={"task_ids": ["set_workflow_status_to_running"]}
        )
        self.assertEqual(response.status_code, 200)

    @pytest.mark.vcr()
    def test_restart_with_params(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:workflows-authors-restart",
            kwargs={"pk": self.workflow.id},
        )

        response = self.api_client.post(
            url, json={"params": {"workflow_id": self.workflow.id}}
        )
        self.assertEqual(response.status_code, 200)


class TestWorkflowSearchFilterViewSet(BaseTransactionTestCase):
    endpoint = "/api/workflows/search/"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        index = registry.get_indices().pop()
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        Workflow.objects.update_or_create(
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
            core=True,
            is_update=False,
            workflow_type=WorkflowType.AUTHOR_CREATE,
        )
        Workflow.objects.update_or_create(
            data={
                "ids": [
                    {"value": "0000-0003-3302-2222", "schema": "ORCID"},
                    {"value": "SmithJohn", "schema": "INSPIRE BAI"},
                ],
                "name": {"value": "Smith, John", "preferred_name": "John Smith"},
                "email_addresses": [
                    {"value": "john.smith@someting.ch", "current": True}
                ],
            },
            status=StatusChoices.RUNNING,
            core=True,
            is_update=False,
            workflow_type=WorkflowType.AUTHOR_CREATE,
        )

    def test_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(reverse("search:workflow-list"))

        assert "_filter_status" in response.json()["facets"]
        assert "_filter_workflow_type" in response.json()["facets"]

    def test_search_data_name(self):
        self.api_client.force_authenticate(user=self.admin)

        url = reverse("search:workflow-list") + "?search=John"

        response = self.api_client.get(url)
        results = response.json()["results"]

        assert len(results) == 1
        assert results[0]["data"]["name"]["value"] == "Smith, John"

    def test_filter_status(self):
        self.api_client.force_authenticate(user=self.admin)

        url = reverse("search:workflow-list") + f"?status={StatusChoices.RUNNING}"

        response = self.api_client.get(url)

        for item in response.json()["results"]:
            assert item["status"] == StatusChoices.RUNNING

    def test_filter_workflow_type(self):
        self.api_client.force_authenticate(user=self.admin)

        url = (
            reverse("search:workflow-list")
            + f'?workflow_type="={WorkflowType.AUTHOR_CREATE}'
        )

        response = self.api_client.get(url)

        for item in response.json()["results"]:
            assert item["workflow_type"] == WorkflowType.AUTHOR_CREATE

    def test_ordering_updated_at(self):
        self.api_client.force_authenticate(user=self.admin)

        base_url = reverse("search:workflow-list")

        urls = [base_url, base_url + "?ordering=-_updated_at"]

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

        url = reverse("search:workflow-list") + f"?ordering=_score&{search_str}"
        response = self.api_client.get(url)
        self.assertEqual(
            response.json()["results"][0]["data"]["name"]["preferred_name"],
            "John Smith",
        )

        url = reverse("search:workflow-list") + f"?ordering=-_score&{search_str}"
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
        self.workflow = Workflow.objects.create(
            data={}, status="running", core=True, is_update=False
        )

    def test_create_decision(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "workflow_id": self.workflow.id,
            "action": "accept",
        }

        url = reverse("api:decisions-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
