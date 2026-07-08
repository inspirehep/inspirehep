import pytest
import uuid
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError

from backoffice.authors.api.serializers import AuthorDecisionSerializer
from backoffice.authors.constants import AuthorStatusChoices, AuthorResolutionDags
from backoffice.authors.models import AuthorDecision
from backoffice.authors.utils import is_another_author_running
from backoffice.common.utils import add_decision

User = get_user_model()
AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class TestUtils(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = AuthorWorkflow.objects.create(
            data={"ids": [{"schema": "ORCID", "value": "0019-0002-5467-525X"}]},
            status=AuthorStatusChoices.APPROVAL,
        )
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

    def test_add_decision(self):
        decision_data = add_decision(
            self.workflow.id,
            self.user,
            AuthorResolutionDags.accept,
            AuthorDecision,
            AuthorDecisionSerializer,
        )
        self.assertIsNotNone(decision_data)

    def test_add_decision_validation_errors(self):
        with pytest.raises(ValidationError):
            add_decision(
                self.workflow.id,
                self.user,
                "wrong",
                AuthorDecision,
                AuthorDecisionSerializer,
            )

        with pytest.raises(ValidationError):
            add_decision(
                uuid.UUID(int=0),
                self.user,
                AuthorResolutionDags.accept,
                AuthorDecision,
                AuthorDecisionSerializer,
            )

    def test_is_another_author_running(self):
        result = is_another_author_running(
            [{"value": "0009-0012-5467-525X", "schema": "ORCID"}]
        )
        self.assertFalse(result)

        result = is_another_author_running(
            [{"value": "0019-0002-5467-525X", "schema": "ORCID"}]
        )
        self.assertTrue(result)
