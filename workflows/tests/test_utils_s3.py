import pytest


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
