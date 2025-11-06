import datetime
import logging
import os
import shutil

from airflow.sdk import Param, dag, task
from include.utils.alerts import FailedDagNotifier

logger = logging.getLogger(__name__)


@dag(
    schedule="0 * * * *",
    catchup=False,
    tags=["service", "log_cleanup"],
    params={
        "retention_hours": Param(
            48, type="integer", description="Log retention period in hours"
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def cleanup_logs():
    @task
    def find_and_cleanup_logs(**context):
        airflow_home = os.getenv("AIRFLOW_HOME", "/opt/airflow")
        logs_dir = os.path.join(airflow_home, "logs")
        retention_hours = context["params"].get("retention_hours")
        logger.info(
            f"Cleaning up logs older than {retention_hours} hours in {logs_dir}"
        )
        cutoff_time = datetime.datetime.now(datetime.UTC) - datetime.timedelta(
            hours=retention_hours
        )

        if not os.path.exists(logs_dir):
            logger.warning(f"Logs directory {logs_dir} does not exist.")
            return

        for dag_id in os.listdir(logs_dir):
            dag_path = os.path.join(logs_dir, dag_id)
            if os.path.isdir(dag_path):
                for run in os.listdir(dag_path):
                    run_path = os.path.join(dag_path, run)
                    if os.path.isdir(run_path) and not os.path.islink(run_path):
                        file_mod_time = datetime.datetime.fromtimestamp(
                            os.path.getmtime(run_path), datetime.UTC
                        )
                        if file_mod_time < cutoff_time:
                            logger.info(f"Deleting log file: {run_path}")
                            try:
                                shutil.rmtree(run_path)
                            except Exception as e:
                                logger.error(f"Failed to delete {run_path}: {e}")

    find_and_cleanup_logs()


cleanup_logs()
