from unittest.mock import patch

from django.db import IntegrityError

from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.hep.constants import HepResolutions, HepStatusChoices
from backoffice.hep.models import HepDecision, HepWorkflow


class TestHepDecision(BaseTransactionTestCase):
    @patch("backoffice.common.signals.update_registry_after_commit")
    def test_duplicate_decision_is_not_allowed_per_workflow(self, _mock_update):
        workflow = HepWorkflow.objects.create(data={}, status=HepStatusChoices.RUNNING)
        HepDecision.objects.create(
            workflow=workflow,
            user=self.curator,
            action=HepResolutions.exact_match,
        )

        with self.assertRaises(IntegrityError):
            HepDecision.objects.create(
                workflow=workflow,
                user=self.curator,
                action=HepResolutions.exact_match,
            )

    @patch("backoffice.common.signals.update_registry_after_commit")
    def test_only_one_hep_resolution_is_allowed_per_workflow(self, _mock_update):
        workflow = HepWorkflow.objects.create(data={}, status=HepStatusChoices.RUNNING)
        HepDecision.objects.create(
            workflow=workflow,
            user=self.curator,
            action=HepResolutions.hep_accept,
        )

        with self.assertRaises(IntegrityError):
            HepDecision.objects.create(
                workflow=workflow,
                user=self.curator,
                action=HepResolutions.core_selection_accept_core,
            )
