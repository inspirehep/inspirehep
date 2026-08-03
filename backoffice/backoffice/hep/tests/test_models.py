from django.db import IntegrityError

from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.hep.constants import HepResolutions, HepStatusChoices
from backoffice.hep.models import HepDecision, HepWorkflow


class TestHepDecision(BaseTransactionTestCase):
    def test_only_one_hep_resolution_is_allowed_per_workflow(self):
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
