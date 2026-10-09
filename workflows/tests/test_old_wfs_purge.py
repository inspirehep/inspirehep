from unittest.mock import Mock, patch

from dags.service.literature_wfs_purge import literature_wfs_purge


@patch("dags.service.literature_wfs_purge.WorkflowManagementHook")
@patch("dags.service.literature_wfs_purge.S3JsonStore")
@patch(
    "dags.service.literature_wfs_purge.find_completed_unpurged_workflows_past_retention"
)
def test_purge_removes_s3_data_before_deleting_workflow(
    mock_find_workflows, mock_s3_store, mock_workflow_hook
):
    mock_find_workflows.return_value = ["workflow-1"]
    s3_store = Mock()
    workflow_hook = Mock()
    mock_s3_store.return_value = s3_store
    mock_workflow_hook.return_value = workflow_hook

    task = literature_wfs_purge().get_task("find_and_purge_old_hep_wfs")
    task.python_callable(params={"retention_days": 180})

    s3_store.cleanup_prefixes.assert_called_once_with("workflow-1/")
    workflow_hook.purge_workflow.assert_called_once_with("workflow-1")
