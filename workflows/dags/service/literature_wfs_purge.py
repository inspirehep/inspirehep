import logging

from airflow.sdk import Param, dag, task
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.opensearch import find_completed_unpurged_workflows_past_retention
from include.utils.s3 import S3JsonStore

logger = logging.getLogger(__name__)


@dag(
    schedule="0 1 * * 6",
    catchup=False,
    tags=["service", "cleanup", HEP],
    params={
        "retention_days": Param(
            180, type="integer", description="retention period in days"
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def literature_wfs_purge():
    @task
    def find_and_purge_old_hep_wfs(**context):
        retention_days = context["params"]["retention_days"]

        workflow_ids = find_completed_unpurged_workflows_past_retention(
            retention_days, -1
        )

        s3_store = S3JsonStore()
        workflow_management_hook = WorkflowManagementHook(HEP)
        for workflow_id in workflow_ids:
            logger.info("Purging workflow %s", workflow_id)
            s3_store.cleanup_prefixes(f"{workflow_id}/")
            workflow_management_hook.purge_workflow(workflow_id)

    find_and_purge_old_hep_wfs()


literature_wfs_purge()
