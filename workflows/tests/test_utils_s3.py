import pytest
from include.utils.s3 import (
    read_object,
    read_workflow,
    write_object,
    write_workflow,
)


@pytest.mark.usefixtures("_s3_hook")
class TestS3Hook:
    def test_read_write_s3(self):
        write_object(
            self.s3_hook,
            {"test": "data"},
            key="test_key",
            overwrite=True,
        )
        result = read_object(self.s3_hook, key="test_key")
        assert result == {"test": "data"}

    def test_read_write_workflow(self):
        workflow_data = {"id": "test_workflow_id"}

        write_workflow(self.s3_hook, workflow_data)
        workflow_result = read_workflow(self.s3_hook, workflow_id="test_workflow_id")
        assert workflow_result == workflow_data

    def test_read_write_workflow_with_custom_filename(self):
        workflow_data = {"id": "test_workflow_id"}

        write_workflow(
            self.s3_hook,
            workflow_data,
            filename="custom_workflow.json",
        )
        workflow_result = read_workflow(
            self.s3_hook,
            workflow_id="test_workflow_id",
            filename="custom_workflow.json",
        )
        assert workflow_result == workflow_data
