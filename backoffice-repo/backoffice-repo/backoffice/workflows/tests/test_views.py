from unittest.mock import patch

from django.apps import apps
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from django.urls import reverse
from opensearch_dsl import Index
from rest_framework import status
from rest_framework.test import APIClient

from backoffice.workflows.api.serializers import WorkflowTicketSerializer
from backoffice.workflows.constants import StatusChoices
from backoffice.workflows.models import WorkflowTicket

User = get_user_model()
Workflow = apps.get_model(app_label="workflows", model_name="Workflow")


class BaseTransactionTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        self.curator_group = Group.objects.get(name="curator")
        self.admin_group = Group.objects.get(name="admin")

        self.curator = User.objects.create_user(email="curator@test.com", password="12345")
        self.admin = User.objects.create_user(email="admin@test.com", password="12345")
        self.user = User.objects.create_user(email="testuser@test.com", password="12345")

        self.curator.groups.add(self.curator_group)
        self.admin.groups.add(self.admin_group)

        self.api_client = APIClient()


class TestWorkflowViewSet(BaseTransactionTestCase):
    endpoint = "/api/workflows/"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = Workflow.objects.create(data={}, status=StatusChoices.APPROVAL, core=True, is_update=False)

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


# @pytest.mark.usefixtures("rebuild_opensearch_index")
class TestWorkflowSearchViewSet(BaseTransactionTestCase):
    endpoint = "/api/workflows/search/"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        index = Index("backoffice-backend-test-workflows")
        index.delete(ignore=[400, 404])
        self.workflow = Workflow.objects.create(data={}, status=StatusChoices.APPROVAL, core=True, is_update=False)

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


class TestWorkflowPartialUpdateViewSet(BaseTransactionTestCase):
    endpoint_base_url = "/api/workflow-update"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = Workflow.objects.create(data={}, status=StatusChoices.APPROVAL, core=True, is_update=False)

    @property
    def endpoint(self):
        return f"{self.endpoint_base_url}/{self.workflow.id}/"

    def test_patch_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.patch(self.endpoint, format="json", data={"status": "running"})

        self.assertEqual(response.status_code, 200)
        workflow = Workflow.objects.filter(id=str(self.workflow.id))[0]
        assert workflow.status == "running"

    def test_patch_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.patch(
            self.endpoint, format="json", data={"status": "approval", "data": {"test": "test"}}
        )

        workflow = Workflow.objects.filter(id=str(self.workflow.id))[0]
        self.assertEqual(response.status_code, 200)
        self.assertEquals(workflow.status, "approval")
        self.assertEquals(workflow.data, {"test": "test"})

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
        self.workflow = Workflow.objects.create(data={}, status="running", core=True, is_update=False)
        self.workflow_ticket = WorkflowTicket.objects.create(
            workflow_id=self.workflow, ticket_id="123", ticket_type="author_create_user"
        )

    def test_get_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{TestWorkflowTicketViewSet.endpoint}/{self.workflow.id}/", format="json", data={}
        )

        assert response.status_code == 400
        assert response.data == {"error": "Both workflow_id and ticket_type are required."}

    def test_get_ticket_not_found(self):
        query_params = {"ticket_type": "test"}
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(
            f"{TestWorkflowTicketViewSet.endpoint}/{self.workflow.id}/", format="json", data=query_params
        )

        assert response.status_code == 404
        assert response.data == {"error": "Workflow ticket not found."}

    def test_get_ticket_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        query_params = {"ticket_type": self.workflow_ticket.ticket_type}
        response = self.api_client.get(
            f"{TestWorkflowTicketViewSet.endpoint}/{self.workflow.id}/", format="json", data=query_params
        )

        assert response.status_code == 200
        assert response.data == WorkflowTicketSerializer(self.workflow_ticket).data

    def test_create_missing_params(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.post(f"{TestWorkflowTicketViewSet.endpoint}/", format="json", data={})

        assert response.status_code == 400
        assert response.data == {"error": "Workflow_id, ticket_id and ticket_type are required."}

    def test_create_happy_flow(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_id": self.workflow.id,
            "ticket_id": "dc94caad1b4f71502d06117a3b4bcb25",
            "ticket_type": "author_create_user",
        }
        response = self.api_client.post(f"{TestWorkflowTicketViewSet.endpoint}/", format="json", data=data)

        assert response.status_code == 201

        assert "workflow_id" in response.data
        assert "ticket_id" in response.data
        assert "ticket_type" in response.data

        assert response.data == WorkflowTicketSerializer(WorkflowTicket.objects.last()).data


class TestAuthorWorkflowViewSet(BaseTransactionTestCase):
    endpoint = "/api/authors/"
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    @patch("backoffice.workflows.airflow_utils.requests.post")
    def test_create_author(self, mock_post):
        self.api_client.force_authenticate(user=self.curator)

        mock_response = mock_post.return_value
        mock_response.status_code = status.HTTP_200_OK
        mock_response.json.return_value = {"key": "value"}

        data = {
            "workflow_type": "AUTHOR_CREATE",
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

        self.assertEqual(response.status_code, 200)

    @patch("backoffice.workflows.airflow_utils.requests.post")
    def test_accept_author(self, mock_post):
        self.api_client.force_authenticate(user=self.curator)

        mock_response = mock_post.return_value
        mock_response.status_code = status.HTTP_200_OK
        mock_response.json.return_value = {"key": "value"}

        data = {"create_ticket": True, "value": "accept"}

        response = self.api_client.post(
            reverse("api:workflows-authors-resolve", kwargs={"pk": "WORKFLOW_ID"}), format="json", data=data
        )

        self.assertEqual(response.status_code, 200)

    @patch("backoffice.workflows.airflow_utils.requests.post")
    def test_reject_author(self, mock_post):
        self.api_client.force_authenticate(user=self.curator)

        mock_response = mock_post.return_value
        mock_response.status_code = status.HTTP_200_OK
        mock_response.json.return_value = {"key": "value"}

        data = {"create_ticket": True, "value": "reject"}

        response = self.api_client.post(
            reverse("api:workflows-authors-resolve", kwargs={"pk": "WORKFLOW_ID"}), format="json", data=data
        )

        self.assertEqual(response.status_code, 200)
