from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.apps import apps

User = get_user_model()
Workflow = apps.get_model(app_label='workflows', model_name='Workflow')

class TestWorkflowViewSet(TestCase):
    endpoint = '/api/workflows/'

    def setUp(self):
        self.curator_group = Group.objects.create(name="curator")
        self.admin_group = Group.objects.create(name="admin")

        self.curator = User.objects.create_user(email='curator@test.com', password='12345')
        self.admin = User.objects.create_user(email='admin@test.com', password='12345')
        self.user = User.objects.create_user(email='testuser@test.com', password='12345')

        self.curator.groups.add(self.curator_group)
        self.admin.groups.add(self.admin_group)

        self.api_client = APIClient()
        self.workflow = Workflow.objects.create(data={}, status='APPROVAL', core=True, is_update=False)

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
