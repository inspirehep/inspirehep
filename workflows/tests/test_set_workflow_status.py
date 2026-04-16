import pytest
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    WorkflowManagementHook,
)
from include.utils.constants import STATUS_ERROR, STATUS_RUNNING
from include.utils.set_workflow_status import set_workflow_status_to_error


@pytest.mark.usefixtures("hep_env")
class TestSetWorkflowStatus:
    context = {"run_id": "00000000-0000-0000-0000-000000001521"}

    @pytest.mark.vcr
    def test_set_workflow_status_to_error(self):
        wf_hook = WorkflowManagementHook(AUTHORS)

        wf_hook.set_workflow_status(STATUS_RUNNING, self.context["run_id"])

        set_workflow_status_to_error(collection=AUTHORS, context=self.context)

        assert wf_hook.get_workflow(self.context["run_id"])["status"] == STATUS_ERROR
