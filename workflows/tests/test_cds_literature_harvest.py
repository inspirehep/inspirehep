from unittest.mock import patch

import pytest
from airflow.models import DagBag

from tests.test_utils import task_test

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestCDSLiteratureHarvest:
    dag = dagbag.get_dag("cds_literature_harvest_dag")

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    @pytest.mark.vcr
    def test_process_records(self, mock_post_workflow):
        result = task_test(
            self.dag,
            "process_records",
            context={
                "run_id": "test_run_id",
                "params": {
                    "from": "2026-02-24",
                    "until": "2026-04-14",
                    "metadata_prefix": "marcxml",
                },
            },
            params={"sets": ["cerncds:atlas-pub"]},
        )

        failed_records = self.s3_store.read_object(result)
        assert mock_post_workflow.call_count == 2
        assert len(failed_records["failed_build_records"]) == 0
        assert len(failed_records["failed_load_records"]) == 0
