import pytest
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from tenacity import RetryError


class TestWorkflowManagementHook:
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    test_workflow_id = "00000000-0000-0000-0000-000000001521"

    def test_collection(self):
        assert self.workflow_management_hook.endpoint == f"api/workflows/{AUTHORS}"

    @pytest.mark.vcr
    def test_get_workflow_url(self):
        with pytest.raises(RetryError) as excinfo:
            self.workflow_management_hook.get_workflow("invalid_workflow_id")
        assert str(excinfo.value.__cause__) == "404:Not Found"

    @pytest.mark.vcr
    def test_set_workflow_status(self):
        self.workflow_management_hook.set_workflow_status(
            status_name="error", workflow_id=self.test_workflow_id
        )
        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["status"]
            == "error"
        )

        self.workflow_management_hook.set_workflow_status(
            status_name="running", workflow_id=self.test_workflow_id
        )
        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["status"]
            == "running"
        )

    @pytest.mark.vcr
    def test_update_workflow(self):
        workflow_data = self.workflow_management_hook.get_workflow(
            self.test_workflow_id
        )

        workflow_data["data"]["status"] = "deceased"
        self.workflow_management_hook.update_workflow(
            self.test_workflow_id, workflow_data
        )
        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["data"][
                "status"
            ]
            == "deceased"
        )

        workflow_data["data"]["status"] = "departed"
        self.workflow_management_hook.update_workflow(
            self.test_workflow_id, workflow_data
        )
        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["data"][
                "status"
            ]
            == "departed"
        )
