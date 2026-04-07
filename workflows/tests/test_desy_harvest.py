from unittest.mock import patch

import pytest
from airflow.sdk.exceptions import AirflowException, AirflowSkipException
from airflow.utils.cli import get_bagged_dag
from tenacity import Future, RetryError


@pytest.mark.usefixtures("s3_desy_env")
@patch("hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow")
class TestDesyHarvestDag:
    dag = get_bagged_dag(None, dag_id="desy_harvest_dag")
    process_subdirectories_task = dag.get_task(task_id="process_subdirectories")

    def test_process_subdirectories_success(self, mock_post_workflow, datadir):
        sample_dir = datadir / "sample"

        for file_path in sample_dir.rglob("*"):
            if file_path.is_file():
                self.s3_store.hook.load_file(
                    str(file_path),
                    key=file_path.relative_to(sample_dir).as_posix(),
                    bucket_name=self.input_bucket,
                    replace=True,
                )

        failure_s3_key = self.process_subdirectories_task.python_callable(
            run_id="desy_test_success"
        )

        assert mock_post_workflow.call_count == 20

        at_least_one_document_updated = False
        for call in mock_post_workflow.call_args_list:
            for _, wf in call.kwargs["workflow_data"].items():
                if "documents" in wf:
                    assert self.output_bucket in wf["documents"][0]["url"]
                    at_least_one_document_updated = True
        assert at_least_one_document_updated

        failed_records = self.s3_store.read_object(failure_s3_key, self.output_bucket)
        assert failed_records["failed_parse_records"] == []
        assert failed_records["failed_load_records"] == []

        assert (
            len(
                self.s3_store.hook.list_prefixes(
                    delimiter="/", bucket_name=self.input_bucket
                )
            )
            == 0
        )
        assert (
            len(
                self.s3_store.hook.list_prefixes(
                    delimiter="/", bucket_name=self.output_bucket
                )
            )
            == 2
        )

    def test_process_subdirectories_skip_when_empty(self, mock_post_workflow):
        with pytest.raises(AirflowSkipException):
            self.process_subdirectories_task.python_callable(run_id="desy_test_skip")

    def test_process_subdirectories_with_errors(self, mock_post_workflow, datadir):
        fut = Future(attempt_number=1)
        fut.set_exception(AirflowException("500:Internal Server Error"))

        mock_post_workflow.side_effect = RetryError(last_attempt=fut)

        sample_dir = datadir / "sample_with_errors"

        for file_path in sample_dir.rglob("*"):
            if file_path.is_file():
                self.s3_store.hook.load_file(
                    str(file_path),
                    key=file_path.relative_to(sample_dir).as_posix(),
                    bucket_name=self.input_bucket,
                    replace=True,
                )

        failure_s3_key = self.process_subdirectories_task.python_callable(
            run_id="desy_test_errors"
        )

        assert mock_post_workflow.call_count == 1

        failed_records = self.s3_store.read_object(failure_s3_key, self.output_bucket)
        assert len(failed_records["failed_parse_records"]) == 1
        assert len(failed_records["failed_load_records"]) == 1
