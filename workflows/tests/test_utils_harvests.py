from unittest.mock import patch

import pytest
from airflow.sdk.exceptions import AirflowException
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.constants import HEP_CREATE, HEP_PUBLISHER_CREATE
from include.utils.harvests import load_records

from tests.test_utils import function_test, task_test


@pytest.mark.usefixtures("_s3_store")
class TestUtilsHarvests:
    connection_id = "arxiv_oaipmh_connection"
    workflow_management_hook = WorkflowManagementHook(HEP)

    @pytest.mark.vcr
    def test_load_records_failed(self):
        parsed_records = [
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Test Workflow Management Hook"}],
            },
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
            },
        ]

        params = {
            "parsed_records": parsed_records,
            "workflow_management_hook": self.workflow_management_hook,
            "workflow_type": HEP_CREATE,
        }
        failed_load_records = function_test(load_records, params=params)

        assert len(failed_load_records) == 1

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_load_records_multiple(self, mock_post_workflow):
        parsed_records = [
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Test Workflow Management Hook"}],
            },
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Test Workflow Management Hook"}],
            },
        ]

        failed_load_records = load_records(
            parsed_records,
            self.workflow_management_hook,
            workflow_type=HEP_CREATE,
        )
        assert mock_post_workflow.call_count == 2
        assert len(failed_load_records) == 0

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_load_records_uses_custom_workflow_type(self, mock_post_workflow):
        parsed_records = [
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Publisher workflow"}],
            },
        ]

        failed_load_records = load_records(
            parsed_records,
            self.workflow_management_hook,
            workflow_type=HEP_PUBLISHER_CREATE,
        )

        mock_post_workflow.assert_called_once_with(
            workflow_data={
                "data": parsed_records[0],
                "workflow_type": HEP_PUBLISHER_CREATE,
            }
        )
        assert len(failed_load_records) == 0

    def test_check_failures_success(self):
        s3_key = self.s3_store.write_object(
            {"failed_build_records": [], "failed_load_records": []}
        )

        task_test(
            dag_id="arxiv_harvest_dag",
            task_id="check_failures",
            params={"failed_record_keys": s3_key},
        )

    def test_check_failures_fail(self):
        s3_key = self.s3_store.write_object({"failed_build_records": ["record"]})

        with pytest.raises(AirflowException) as exc_info:
            task_test(
                dag_id="arxiv_harvest_dag",
                task_id="check_failures",
                params={"failed_record_keys": s3_key},
            )
        assert "The following records failed: ['record']" in str(exc_info.value)

    def test_check_failures_no_key(self):
        s3_key = None

        task_test(
            dag_id="arxiv_harvest_dag",
            task_id="check_failures",
            params={"failed_record_keys": s3_key},
        )
