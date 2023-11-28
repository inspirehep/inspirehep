from django.apps import apps
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from rest_framework.test import APIClient

User = get_user_model()
Workflow = apps.get_model(app_label="workflows", model_name="Workflow")


class TestWorkflowViewSet(TransactionTestCase):
    endpoint = "/api/workflows/"
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
        self.workflow = Workflow.objects.create(data={}, status="APPROVAL", core=True, is_update=False)

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


class WorkflowPartialUpdateViewSet(TransactionTestCase):
    endpoint_base_url = "/api/workflow-update"
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
        self.workflow = Workflow.objects.create(data={}, status="APPROVAL", core=True, is_update=False)

    @property
    def endpoint(self):
        return f"{self.endpoint_base_url}/{self.workflow.id}/"

    def test_patch_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.patch(self.endpoint, format="json", data={"status": "POSTPROCESSING"})

        self.assertEqual(response.status_code, 200)
        workflow = Workflow.objects.filter(id=str(self.workflow.id))[0]
        assert workflow.status == "POSTPROCESSING"

    def test_patch_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.patch(
            self.endpoint, format="json", data={"status": "PREPROCESSING", "data": {"test": "test"}}
        )

        workflow = Workflow.objects.filter(id=str(self.workflow.id))[0]
        self.assertEqual(response.status_code, 200)
        self.assertEquals(workflow.status, "PREPROCESSING")
        self.assertEquals(workflow.data, {"test": "test"})

    def test_patch_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)
