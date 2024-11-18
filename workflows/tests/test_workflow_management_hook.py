import pytest
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from tenacity import RetryError


class TestWorkflowManagementHook:
    workflow_management_hook = WorkflowManagementHook(AUTHORS)

    def test_collection(self):
        assert self.workflow_management_hook.endpoint == f"api/workflows/{AUTHORS}"

    @pytest.mark.vcr
    def test_get_workflow_url(self):
        with pytest.raises(RetryError) as excinfo:
            self.workflow_management_hook.get_workflow("invalid_workflow_id")
        assert str(excinfo.value.__cause__) == "404:Not Found"
