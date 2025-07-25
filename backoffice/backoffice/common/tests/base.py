from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from rest_framework.test import APIClient

User = get_user_model()


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
