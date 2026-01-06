import pytest
from hooks.backoffice.workflow_management_hook import AUTHORS
from include.utils.constants import STATUS_ERROR, STATUS_RUNNING
from include.utils.set_workflow_status import set_workflow_status_to_error

from tests.test_utils import function_test, get_aut_workflow_task, set_aut_workflow_task


class TestSetWorkflowStatus:
    context = {"run_id": "00000000-0000-0000-0000-000000001521"}

    @pytest.mark.vcr
    def test_set_workflow_status_to_error(self):
        set_aut_workflow_task(
            status_name=STATUS_RUNNING, workflow_id=self.context["run_id"]
        )

        function_test(
            set_workflow_status_to_error,
            params={"collection": AUTHORS, "context": self.context},
        )

        assert get_aut_workflow_task(self.context["run_id"])["status"] == STATUS_ERROR
