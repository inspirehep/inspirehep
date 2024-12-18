import pytest
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from include.utils.set_workflow_status import set_workflow_status_to_error


class TestSetWorkflowStatus:
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    context = {
        "params": {
            "collection": "authors",
            "workflow_id": "00000000-0000-0000-0000-000000001521",
        }
    }

    @pytest.mark.vcr
    def test_set_workflow_status_to_error(self):
        self.workflow_management_hook.set_workflow_status(
            status_name="running", workflow_id=self.context["params"]["workflow_id"]
        )
        set_workflow_status_to_error(context=self.context)
        assert (
            self.workflow_management_hook.get_workflow(
                self.context["params"]["workflow_id"]
            )["status"]
            == "error"
        )
