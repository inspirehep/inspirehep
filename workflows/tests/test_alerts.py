from unittest.mock import Mock, patch

import pytest
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
)
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.constants import STATUS_ERROR

from tests.test_utils import function_test, get_aut_workflow_task


@patch("include.utils.alerts.task_failure_alert")
@pytest.mark.vcr
def test_dag_error_notifier_notify(mock_func):
    test_workflow_id = "00000000-0000-0000-0000-000000001521"
    dag_error_notifier = FailedDagNotifierSetError(collection=AUTHORS)

    function_test(
        dag_error_notifier.notify,
        {"context": {"run_id": test_workflow_id, "dag": Mock(dag_id="test_dag")}},
    )
    mock_func.assert_called_once()

    assert get_aut_workflow_task(test_workflow_id)["status"] == STATUS_ERROR
