from unittest.mock import Mock, patch

import pytest
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    WorkflowManagementHook,
)
from include.utils.alerts import FailedDagNotifierSetError


@patch("include.utils.alerts.task_failure_alert")
@pytest.mark.vcr
def test_dag_error_notifier_notify(mock_func):
    test_workflow_id = "00000000-0000-0000-0000-000000001521"
    dag_error_notifier = FailedDagNotifierSetError(collection=AUTHORS)

    dag_error_notifier.notify(
        context={"run_id": test_workflow_id, "dag": Mock(dag_id="test_dag")}
    )
    mock_func.assert_called_once()
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    assert workflow_management_hook.get_workflow(test_workflow_id)["status"] == "error"
