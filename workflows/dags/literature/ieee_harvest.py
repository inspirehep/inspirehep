import datetime
import logging
from io import BytesIO

from airflow.exceptions import AirflowException
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Param, dag, task
from hooks.backoffice.workflow_management_hook import (
    HEP,
)
from hooks.custom_fttps_hook import CustomFTPSHook
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.ftp import list_ftp_files

logger = logging.getLogger(__name__)
s3_hook = S3Hook(aws_conn_id="s3_conn")
ieee_bucket_name = Variable.get("s3_ieee_bucket_name")


@dag(
    params={
        "from": Param(type=["null", "string"], default=None),
        "until": Param(type=["null", "string"], default=None),
        "sync_folders": Param(
            type="array",
            default=[
                "IEEEUpdates_Cern",
                "Deleted_Cern",
                "XML_Cern",
            ],
        ),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule="0 0 * * 1",
    catchup=False,
    on_failure_callback=FailedDagNotifierSetError(),
    tags=[HEP],
)
def ieee_harvest_dag():
    """
    Initialize a DAG for ieee harvest workflow.
    """

    @task
    def get_sync_folders(**context):
        """Get the list of folders to sync from the DAG parameters.

        Returns: list of sets
        """
        return context["params"]["sync_folders"]

    @task
    def ftp_to_s3(sync_folder, **context):
        """
        Download files from IEEE FTP and upload them to S3
        """
        ftp_hook = CustomFTPSHook(ftp_conn_id="ieee_ftp")
        s3_hook = S3Hook(aws_conn_id="s3_conn")

        directories = ftp_hook.list_directory(sync_folder)

        has_new_directory = False

        for directory in directories:
            there_is_key = s3_hook.check_for_wildcard_key(
                f"{directory}/*", ieee_bucket_name
            )

            if not there_is_key:
                logger.info(f"Pushing directory {directory} to s3")
                has_new_directory = True
                files = list_ftp_files(ftp_hook, directory)

                for file in files:
                    bio = BytesIO()
                    ftp_hook.get_conn()
                    ftp_hook.retrieve_file(file, bio)
                    bio.seek(0)
                    s3_hook.conn.upload_fileobj(bio, ieee_bucket_name, file)

        return has_new_directory

    @task
    def check_new_directories(has_new_directories):
        """
        Check if there are new files in the directory
        """

        if not any(has_new_directories) > 0:
            raise AirflowException("There are no new directories in the IEEE harvest")

    sync_folders = get_sync_folders()
    has_new_directories = ftp_to_s3.expand(sync_folder=sync_folders)
    check_new_directories(has_new_directories=has_new_directories)


ieee_harvest_dag()
