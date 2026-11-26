from unittest.mock import patch

import pytest
from airflow.models import DagBag

from tests.test_utils import task_test

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestCDSLiteratureSingleHarvest:
    dag = dagbag.get_dag("cds_literature_harvest_by_identifier_dag")
    context = {
        "params": {"metadata_prefix": "marcxml"},
        "run_id": "test_run",
    }

    @pytest.mark.vcr
    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_process_records(self, mock_post_workflow):
        result = task_test(
            self.dag,
            "process_records",
            self.context,
            params={"identifiers": ["oai:cds.cern.ch:2653609"]},
        )

        assert result is None
        assert mock_post_workflow.call_count == 1
