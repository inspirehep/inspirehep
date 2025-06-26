import pytest
from json import JSONDecodeError
from unittest.mock import MagicMock
import logging
import uuid
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError
from jsonschema.exceptions import ValidationError as JSONValidationError

from backoffice.authors import constants
from backoffice.authors.api import utils
from backoffice.authors.constants import AuthorStatusChoices

User = get_user_model()
AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class TestUtils(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(
            data={}, status=AuthorStatusChoices.APPROVAL
        )
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

    def test_add_decision(self):
        decision_data = utils.add_decision(
            self.workflow.id, self.user, constants.AuthorResolutionDags.accept
        )
        self.assertIsNotNone(decision_data)

    def test_add_decision_validation_errors(self):
        with pytest.raises(ValidationError):
            utils.add_decision(self.workflow.id, self.user, "wrong")

        with pytest.raises(ValidationError):
            utils.add_decision(
                uuid.UUID(int=0), self.user, constants.AuthorResolutionDags.accept
            )

    def test_render_validation_error_response(self):
        validation_errors = [
            JSONValidationError(message="error1", path=[]),
            JSONValidationError(message="error2", path=[]),
        ]
        response = utils.render_validation_error_response(validation_errors)
        self.assertEqual(
            response,
            [{"message": "error1", "path": []}, {"message": "error2", "path": []}],
        )


class DummyResponse:
    def __init__(self, json_data=None, text=None, status_code=502, json_raises=False):
        self._json_data = json_data
        self.text = text
        self.status_code = status_code
        self._json_raises = json_raises

    def json(self):
        if self._json_raises:
            raise JSONDecodeError("Expecting value", "", 0)
        return self._json_data


@pytest.fixture(autouse=True)
def set_error_log_level(caplog):
    caplog.set_level(logging.ERROR)


def test_valid_json_with_args(caplog):
    response = DummyResponse(
        json_data={"detail": "Service unavailable"}, status_code=503
    )
    exc = MagicMock(response=response)

    result = utils.handle_request_exception("Error for workflow %s", exc, "1234")

    assert result.status_code == 503
    assert result.data["error"] == "Error for workflow 1234"
    assert "Error for workflow 1234: {'detail': 'Service unavailable'}" in caplog.text


def test_valid_json_with_args_with_response(caplog):
    response = DummyResponse(
        json_data={"detail": "Service unavailable"}, status_code=503
    )
    exc = MagicMock(response=response)

    result = utils.handle_request_exception(
        "Error for workflow %s", exc, "1234", response_text="User sees this %s"
    )

    assert result.status_code == 503
    assert result.data["error"] == "User sees this 1234"
    assert "Error for workflow 1234: {'detail': 'Service unavailable'}" in caplog.text


def test_json_decode_error_with_response_text(caplog):
    response = DummyResponse(
        text="Service Unavailable", status_code=503, json_raises=True
    )
    exc = MagicMock(response=response)

    result = utils.handle_request_exception(
        "Error occurred", exc, response_text="Custom error"
    )

    assert result.status_code == 503
    assert result.data["error"] == "Custom error"
    assert "Error occurred: Service Unavailable" in caplog.text


def test_no_response(caplog):
    exc = MagicMock(response=None)

    result = utils.handle_request_exception("Error no response", exc)

    assert result.status_code == 502
    assert result.data["error"] == "Error no response"
    assert "Error no response: <MagicMock" in caplog.text


def test_no_args_no_response_text(caplog):
    response = DummyResponse(json_data={"error": "fail"}, status_code=500)
    exc = MagicMock(response=response)

    result = utils.handle_request_exception("Simple error", exc)

    assert result.status_code == 500
    assert result.data["error"] == "Simple error"
    assert "Simple error: {'error': 'fail'}" in caplog.text
