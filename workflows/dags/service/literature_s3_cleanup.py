import logging

from airflow.sdk import Param, Variable, dag, task
from include.utils.alerts import FailedDagNotifier
from include.utils.opensearch import find_completed_workflows_past_retention
from include.utils.s3 import S3JsonStore

logger = logging.getLogger(__name__)

SOFT_RETENTION_DAYS_VARIABLE = "LITERATURE_S3_SOFT_RETENTION_DAYS"
HARD_RETENTION_DAYS_VARIABLE = "LITERATURE_S3_HARD_RETENTION_DAYS"


@dag(
    schedule="0 1 * * *",
    catchup=False,
    tags=["service", "cleanup", "s3"],
    params={
        "soft_retention_days": Param(
            None,
            type=["null", "integer"],
            description="Retention period in days after which the prefixes are "
            f"deleted from S3. Defaults to the {SOFT_RETENTION_DAYS_VARIABLE} "
            "variable",
        ),
        "prefixes_to_cleanup": Param(
            ["plots/"], type="array", description="S3 prefixes to clean up"
        ),
        "hard_retention_days": Param(
            None,
            type=["null", "integer"],
            description="Retention period in days after which the whole workflow "
            "folder is deleted from S3. Defaults to the "
            f"{HARD_RETENTION_DAYS_VARIABLE} variable",
        ),
        "search_window_days": Param(
            14,
            type="integer",
            description="How many days past retention to search for workflows",
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def literature_s3_cleanup():
    @task
    def find_wfs_and_cleanup_s3(
        retention_days_param, retention_days_variable, prefixes_param, **context
    ):
        """Delete S3 data of completed workflows past retention.

        prefixes_param is the name of the DAG param holding the prefixes to
        delete inside each workflow folder. If None, the whole workflow folder
        is deleted. If the prefixes list is empty, nothing is deleted.
        The retention days param, if not set, falls back to the
        retention_days_variable Airflow Variable.
        """
        params = context["params"]
        retention_days = params[retention_days_param]
        if retention_days is None:
            retention_days = int(Variable.get(retention_days_variable))
        search_window_days = params["search_window_days"]

        prefixes_to_cleanup = [""] if prefixes_param is None else params[prefixes_param]

        workflow_ids = find_completed_workflows_past_retention(
            retention_days, search_window_days
        )

        s3_store = S3JsonStore()
        for workflow_id in workflow_ids:
            prefixes = [f"{workflow_id}/{prefix}" for prefix in prefixes_to_cleanup]
            s3_store.cleanup_prefix(prefixes)

    find_wfs_and_cleanup_s3.override(task_id="find_wfs_and_soft_cleanup_s3")(
        retention_days_param="soft_retention_days",
        retention_days_variable=SOFT_RETENTION_DAYS_VARIABLE,
        prefixes_param="prefixes_to_cleanup",
    )
    find_wfs_and_cleanup_s3.override(task_id="find_wfs_and_hard_cleanup_s3")(
        retention_days_param="hard_retention_days",
        retention_days_variable=HARD_RETENTION_DAYS_VARIABLE,
        prefixes_param=None,
    )


literature_s3_cleanup()
