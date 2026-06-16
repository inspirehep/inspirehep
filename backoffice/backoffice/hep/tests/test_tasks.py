import uuid
from unittest.mock import patch

from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.hep.constants import (
    HepResolutions,
    HepStatusChoices,
    HepWorkflowType,
)
from backoffice.hep.models import HepWorkflow
from backoffice.hep.tasks import batch_resolve_workflows
from requests.exceptions import RequestException


class TestBatchResolveWorkflowsTask(BaseTransactionTestCase):
    def _create_workflow(self):
        return HepWorkflow.objects.create(
            data={},
            status=HepStatusChoices.APPROVAL,
            workflow_type=HepWorkflowType.HEP_CREATE,
            id=uuid.uuid4(),
        )

    @patch("backoffice.hep.utils.airflow_utils.clear_airflow_dag_tasks")
    def test_batch_resolve_workflows_resolves_all(self, mock_clear):
        mock_clear.return_value = (b"", 200)
        wfs = [self._create_workflow() for _ in range(3)]
        data = {
            "action": HepResolutions.hep_accept,
            "ids": [str(wf.id) for wf in wfs],
        }

        batch_resolve_workflows(data, self.curator.id)

        for wf in wfs:
            wf.refresh_from_db()
            self.assertEqual(wf.status, HepStatusChoices.RUNNING)
            self.assertEqual(wf.decisions.first().action, HepResolutions.hep_accept)

    @patch("backoffice.hep.utils.airflow_utils.clear_airflow_dag_tasks")
    def test_batch_resolve_workflows_marks_failures_as_error(self, mock_clear):
        ok = (b"", 200)
        mock_clear.side_effect = [ok, RequestException("Airflow clear failed"), ok]
        wfs = [self._create_workflow() for _ in range(3)]
        data = {
            "action": HepResolutions.hep_accept,
            "ids": [str(wf.id) for wf in wfs],
        }

        batch_resolve_workflows(data, self.curator.id)

        wfs[0].refresh_from_db()
        wfs[1].refresh_from_db()
        wfs[2].refresh_from_db()
        self.assertEqual(wfs[0].status, HepStatusChoices.RUNNING)
        self.assertEqual(wfs[1].status, HepStatusChoices.ERROR)
        self.assertEqual(wfs[2].status, HepStatusChoices.RUNNING)

        self.assertEqual(wfs[1].decisions.first().action, HepResolutions.hep_accept)
