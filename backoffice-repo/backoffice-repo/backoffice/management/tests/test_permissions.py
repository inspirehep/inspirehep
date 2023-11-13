from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView

from backoffice.management.permissions import IsAdminOrCuratorUser

User = get_user_model()


class MockView(APIView):
    permission_classes = [IsAdminOrCuratorUser]

    def get(self, request):
        return Response("Test Response")


class PermissionCheckTests(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        self.user = User.objects.create_user(email="testuser@test.com", password="testpassword")

        self.admin_group = Group.objects.get(name="admin")
        self.curator_group = Group.objects.get(name="curator")

    def test_user_in_required_group(self):
        self.user.groups.add(self.admin_group)

        factory = APIRequestFactory()
        request = factory.get("/mock/")
        force_authenticate(request, user=self.user)

        view = MockView.as_view()
        response = view(request)
        self.assertEqual(response.status_code, 200)

    def test_user_not_in_required_group(self):
        factory = APIRequestFactory()
        request = factory.get("/mock/")
        force_authenticate(request, user=self.user)

        view = MockView.as_view()
        response = view(request)
        self.assertEqual(response.status_code, 403)
