from unittest.mock import patch

import pytest

from tests.test_utils import task_test


@pytest.mark.usefixtures("_s3_store")
class TestCDSLiteratureHarvest:
    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_process_records(self, mock_post_workflow):
        result = task_test(
            dag_id="cds_literature_harvest_dag",
            task_id="process_records",
            params={"sets": ["cerncds:atlas-pub"]},
            dag_params={
                "from": "2026-02-24",
                "until": "2026-04-14",
                "metadata_prefix": "marcxml",
            },
        )

        failed_records = self.s3_store.read_object(result)
        assert mock_post_workflow.call_count == 2
        assert len(failed_records["failed_build_records"]) == 0
        assert len(failed_records["failed_load_records"]) == 0
