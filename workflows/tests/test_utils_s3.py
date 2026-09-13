import json
import uuid
from io import BytesIO

import pytest
from airflow.sdk import Variable
from botocore.exceptions import ClientError, IncompleteReadError
from botocore.response import StreamingBody
from botocore.stub import Stubber
from include.utils.s3 import S3JsonStore


@pytest.mark.usefixtures("s3_desy_env")
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

        existing_flags = {"is-update": True, "auto-approved": False}
        self.s3_store.set_flags(existing_flags, workflow_id)
        self.s3_store.set_flag(flag_name, flag_value, workflow_id)
        retrieved_flag_value = self.s3_store.get_flag(flag_name, workflow_id)

        assert retrieved_flag_value == flag_value
        assert self.s3_store.read_object(f"{workflow_id}/flags.json") == {
            **existing_flags,
            flag_name: flag_value,
        }

    @pytest.mark.parametrize(
        ("operation", "error_code"),
        [("head_object", "404"), ("get_object", "NoSuchKey")],
    )
    def test_set_flag_initializes_missing_flags(self, operation, error_code):
        workflow_id = str(uuid.uuid4())
        key = f"{workflow_id}/flags.json"
        params = {"Bucket": self.input_bucket, "Key": key}
        with Stubber(self.s3_store.hook.resource.meta.client) as stubber:
            if operation == "get_object":
                stubber.add_response("head_object", {}, params)
            stubber.add_client_error(
                operation,
                service_error_code=error_code,
                http_status_code=404,
                expected_params=params,
            )
            self.s3_store.set_flag("approved", True, workflow_id)
            stubber.assert_no_pending_responses()

        assert self.s3_store.read_object(key) == {"approved": True}

    @pytest.mark.parametrize(
        ("operation", "error_code", "status"),
        [
            ("head_object", "403", 403),
            ("head_object", "503", 503),
            ("get_object", "AccessDenied", 403),
            ("get_object", "SlowDown", 503),
            ("get_object", "NoSuchBucket", 404),
        ],
    )
    def test_set_flag_preserves_flags_on_s3_read_error(
        self, operation, error_code, status
    ):
        workflow_id = str(uuid.uuid4())
        key = f"{workflow_id}/flags.json"
        flags = {"is-update": True, "auto-approved": False}
        self.s3_store.set_flags(flags, workflow_id)
        params = {"Bucket": self.input_bucket, "Key": key}
        with Stubber(self.s3_store.hook.resource.meta.client) as stubber:
            if operation == "get_object":
                stubber.add_response("head_object", {}, params)
            stubber.add_client_error(
                operation,
                service_error_code=error_code,
                http_status_code=status,
                expected_params=params,
            )
            with pytest.raises(ClientError) as error:
                self.s3_store.set_flag("approved", True, workflow_id)
            assert error.value.response["Error"]["Code"] == error_code

        assert self.s3_store.read_object(key) == flags

    @pytest.mark.parametrize(
        ("body", "missing_bytes", "error_type"),
        [
            (b'{"is-update": true', 0, json.JSONDecodeError),
            (b"\xff", 0, UnicodeDecodeError),
            (b'{"is-update": true}', 1, IncompleteReadError),
        ],
    )
    def test_set_flag_preserves_flags_on_unreadable_response(
        self, body, missing_bytes, error_type
    ):
        workflow_id = str(uuid.uuid4())
        key = f"{workflow_id}/flags.json"
        flags = {"is-update": True, "auto-approved": False}
        self.s3_store.set_flags(flags, workflow_id)
        params = {"Bucket": self.input_bucket, "Key": key}
        with Stubber(self.s3_store.hook.resource.meta.client) as stubber:
            stubber.add_response("head_object", {}, params)
            stubber.add_response(
                "get_object",
                {"Body": StreamingBody(BytesIO(body), len(body) + missing_bytes)},
                params,
            )
            with pytest.raises(error_type):
                self.s3_store.set_flag("approved", True, workflow_id)

        assert self.s3_store.read_object(key) == flags

    def test_key_to_s3_url(self):
        bucket_name = self.s3_store.get_default_bucket_name()
        key = "test/key/path"
        url = self.s3_store.hook.conn.meta.endpoint_url
        expected_url = f"{url}/{bucket_name}/{key}"
        assert self.s3_store.key_to_s3_url(key) == expected_url

    def test_move_all_files_for_subdirectory(self):
        src_bucket = Variable.get("s3_desy_input_bucket_name")
        dest_bucket = Variable.get("s3_desy_output_bucket_name")

        s3_publisher_store = S3JsonStore("s3_publisher_conn", src_bucket)

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
