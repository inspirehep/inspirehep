import logging

from airflow.sdk import Param, dag, task
from include.utils.alerts import FailedDagNotifier
from include.utils.opensearch import find_completed_workflows_past_retention
from include.utils.s3 import S3JsonStore

logger = logging.getLogger(__name__)


@dag(
    schedule="0 1 * * *",
    catchup=False,
    tags=["service", "cleanup", "s3"],
    params={
        "retention_days": Param(
            14, type="integer", description="S3 retention period in days"
        ),
        "prefixes_to_cleanup": Param(
            ["plots/"], type="array", description="S3 prefixes to clean up"
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def literature_s3_cleanup():
    @task
    def find_wfs_and_cleanup_s3(**context):
        retention_days = context["params"]["retention_days"]
        prefixes_to_cleanup = context["params"]["prefixes_to_cleanup"]

        workflow_ids = find_completed_workflows_past_retention(retention_days)

        s3_store = S3JsonStore()
        for workflow_id in workflow_ids:
            prefixes = [f"{workflow_id}/{prefix}" for prefix in prefixes_to_cleanup]
            s3_store.cleanup_prefix(prefixes)

    find_wfs_and_cleanup_s3()


literature_s3_cleanup()
