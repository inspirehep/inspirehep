import pytest
import uuid
from django.apps import apps
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError

from backoffice.hep.constants import HepStatusChoices, HepResolutions
from backoffice.hep.utils import add_hep_decision

User = get_user_model()
HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestUtils(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = HepWorkflow.objects.create(
            data={}, status=HepStatusChoices.APPROVAL
        )
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

    def test_add_decision(self):
        decision_data = add_hep_decision(
            self.workflow.id,
            self.user,
            HepResolutions.approval,
        )
        self.assertIsNotNone(decision_data)

    def test_add_decision_validation_errors(self):
        with pytest.raises(ValidationError):
            add_hep_decision(
                self.workflow.id,
                self.user,
                "wrong",
            )

        with pytest.raises(ValidationError):
            add_hep_decision(
                uuid.UUID(int=0),
                self.user,
                HepResolutions.approval,
            )
