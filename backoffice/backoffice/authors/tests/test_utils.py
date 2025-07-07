import pytest
import uuid
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError

from backoffice.authors import constants
from backoffice.authors.constants import AuthorStatusChoices
from backoffice.authors.utils import add_author_decision

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
        decision_data = add_author_decision(
            self.workflow.id,
            self.user,
            constants.AuthorResolutionDags.accept,
        )
        self.assertIsNotNone(decision_data)

    def test_add_decision_validation_errors(self):
        with pytest.raises(ValidationError):
            add_author_decision(
                self.workflow.id,
                self.user,
                "wrong",
            )

        with pytest.raises(ValidationError):
            add_author_decision(
                uuid.UUID(int=0),
                self.user,
                constants.AuthorResolutionDags.accept,
            )
