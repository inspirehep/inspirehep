import os
from unittest.mock import patch

import pytest
from airflow.exceptions import AirflowException, AirflowSkipException
from airflow.sdk import Variable
from airflow.utils.cli import get_bagged_dag
from include.utils.s3 import S3JsonStore
from tenacity import Future, RetryError


@pytest.fixture(scope="class")
def _desy_env():
    test_dict = {
        "AIRFLOW_CONN_S3_ELSEVIER_CONN": "aws://airflow:airflow-inspire@/?endpoint_url=http%3A%2F%2Fs3%3A9000",
        "AIRFLOW_VAR_S3_DESY_INPUT_BUCKET_NAME": "test-desy-incoming",
        "AIRFLOW_VAR_S3_DESY_OUTPUT_BUCKET_NAME": "test-desy-processed",
    }

    override_dict = {
        key: os.environ.get(key, value)
        for key, value in test_dict.items()
        if key not in os.environ
    }

    with patch.dict(
        os.environ,
        override_dict,
    ):
        yield


@pytest.fixture(scope="class")
def s3_create_desy_test_buckets(request):
    desy_input_bucket = Variable.get("s3_desy_input_bucket_name")
    request.cls.input_bucket = desy_input_bucket
    request.cls.output_bucket = Variable.get("s3_desy_output_bucket_name")
    request.cls.s3_store = S3JsonStore(
        "s3_elsevier_conn", bucket_name=desy_input_bucket
    )
    request.cls.s3_store.hook.create_bucket("test-desy-incoming")
    request.cls.s3_store.hook.create_bucket("test-desy-processed")

    yield request.cls.s3_store

    request.cls.s3_store.hook.delete_bucket("test-desy-incoming", force_delete=True)
    request.cls.s3_store.hook.delete_bucket("test-desy-processed", force_delete=True)


@pytest.mark.usefixtures("_desy_env", "s3_create_desy_test_buckets")
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
