import uuid

import pytest
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError

from backoffice.workflows import constants
from backoffice.workflows.api import utils
from backoffice.workflows.constants import StatusChoices

User = get_user_model()
Workflow = apps.get_model(app_label="workflows", model_name="Workflow")


class TestUtils(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = Workflow.objects.create(
            data={}, status=StatusChoices.APPROVAL, core=True, is_update=False
        )
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

    def test_add_decision(self):
        decision_data = utils.add_decision(
            self.workflow.id, self.user, constants.ResolutionDags.accept
        )

        self.assertIsNotNone(decision_data)

    def test_add_decision_validation_errors(self):
        with pytest.raises(ValidationError):
            utils.add_decision(self.workflow.id, self.user, "wrong")

        with pytest.raises(ValidationError):
            utils.add_decision(
                uuid.UUID(int=0), self.user, constants.ResolutionDags.accept
            )
