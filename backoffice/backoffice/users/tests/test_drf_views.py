import pytest
from django.contrib.auth import SESSION_KEY
from django.contrib.sessions.middleware import SessionMiddleware
from rest_framework.test import APIRequestFactory

from backoffice.users.api.views import LocalLoginView, UserViewSet
from backoffice.users.models import User
from backoffice.users.tests.factories import UserFactory


class TestUserViewSet:
    @pytest.fixture()
    def api_rf(self) -> APIRequestFactory:
        return APIRequestFactory()

    def test_get_queryset(self, user: User, api_rf: APIRequestFactory):
        view = UserViewSet()
        request = api_rf.get("/fake-url/")
        request.user = user

        view.request = request

        assert user in view.get_queryset()

    def test_me(self, user: User, api_rf: APIRequestFactory):
        view = UserViewSet()
        request = api_rf.get("/fake-url/")
        request.user = user

        view.request = request

        response = view.me(request)  # type: ignore

        assert response.data == {
            "url": f"http://testserver/api/users/{user.pk}/",
            "name": user.name,
        }


class TestLocalLoginView:
    @pytest.fixture()
    def api_rf(self) -> APIRequestFactory:
        return APIRequestFactory()

    def _post(self, api_rf: APIRequestFactory, data: dict):
        request = api_rf.post("/fake-url/", data, format="json")
        SessionMiddleware(lambda r: None).process_request(request)
        return request, LocalLoginView.as_view()(request)

    def test_login_creates_session(self, db, api_rf: APIRequestFactory):
        user = UserFactory(password="secret")

        request, response = self._post(
            api_rf, {"email": user.email, "password": "secret"}
        )

        assert response.status_code == 200
        assert request.session[SESSION_KEY] == str(user.pk)

    def test_login_with_wrong_password(self, db, api_rf: APIRequestFactory):
        user = UserFactory(password="secret")

        request, response = self._post(
            api_rf, {"email": user.email, "password": "wrong"}
        )

        assert response.status_code == 401
        assert SESSION_KEY not in request.session
