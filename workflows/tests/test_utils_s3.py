import uuid

import pytest
from airflow.sdk import Variable
from include.utils.s3 import S3JsonStore

from tests.test_utils import function_test


@pytest.mark.usefixtures("_s3_store")
class TestS3Hook:
    def test_read_write_s3(self):
        self.s3_store.write_object({"test": "data"}, key="test_key")
        result = self.s3_store.read_object("test_key")
        assert result == {"test": "data"}

    def test_read_write_workflow(self):
        workflow_data = {"id": "test_workflow_id"}

        self.s3_store.write_workflow(workflow_data)
        workflow_result = self.s3_store.read_workflow(workflow_id="test_workflow_id")
        assert workflow_result == workflow_data

    def test_read_write_workflow_with_custom_filename(self):
        workflow_data = {"id": "test_workflow_id"}

        self.s3_store.write_workflow(workflow_data, filename="custom_workflow.json")
        workflow_result = self.s3_store.read_workflow(
            workflow_id="test_workflow_id",
            filename="custom_workflow.json",
        )
        assert workflow_result == workflow_data

    def test_set_flag_and_get_flag_with_s3(self):
        workflow_id = "test-workflow-id"
        flag_name = "test-flag"
        flag_value = True

        self.s3_store.set_flag(flag_name, flag_value, workflow_id)
        retrieved_flag_value = self.s3_store.get_flag(flag_name, workflow_id)

        assert retrieved_flag_value == flag_value

    def test_key_to_s3_url(self):
        bucket_name = self.s3_store.get_default_bucket_name()
        key = "test/key/path"
        url = self.s3_store.hook.conn.meta.endpoint_url
        expected_url = f"{url}/{bucket_name}/{key}"
        assert self.s3_store.key_to_s3_url(key) == expected_url

    def test_move_all_files_for_subdirectory(self):
        def _test_move_all_files_for_subdirectory():
            src_bucket = Variable.get("s3_desy_input_bucket_name")
            dest_bucket = Variable.get("s3_desy_output_bucket_name")

            s3_publisher_store = S3JsonStore("s3_elsevier_conn", src_bucket)

            subdir = f"test-subdir-{str(uuid.uuid4())}/"

            nb_files = 3

            for i in range(nb_files):
                s3_publisher_store.write_object(
                    {"test": f"data{i}"},
                    key=f"{subdir}file{i}.json",
                    bucket_name=src_bucket,
                )

            s3_publisher_store.move_all_files_for_subdirectory(
                subdir, src_bucket, dest_bucket
            )

            dest_objects = s3_publisher_store.hook.list_keys(
                prefix=subdir, bucket_name=dest_bucket
            )
            assert len(dest_objects) == nb_files

            src_objects = s3_publisher_store.hook.list_keys(
                prefix=subdir, bucket_name=src_bucket
            )
            assert src_objects == []

        function_test(_test_move_all_files_for_subdirectory)
