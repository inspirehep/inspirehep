from unittest.mock import patch

import pytest
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    WorkflowManagementHook,
)
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.constants import STATUS_ERROR


@pytest.mark.usefixtures("hep_env")
class TestFailedDagNotifierSetError:
    @patch("include.utils.alerts.task_failure_alert")
    @pytest.mark.vcr
    def test_dag_error_notifier_notify(self, mock_func):
        test_workflow_id = "00000000-0000-0000-0000-000000001521"
        dag_error_notifier = FailedDagNotifierSetError(collection=AUTHORS)
        context = {"run_id": test_workflow_id}

        dag_error_notifier.notify(context)

        mock_func.assert_called_once_with(context)

        assert (
            WorkflowManagementHook(AUTHORS).get_workflow(test_workflow_id)["status"]
            == STATUS_ERROR
        )
