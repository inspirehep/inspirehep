import datetime
import logging
from io import BytesIO

from airflow.decorators import dag, task
from airflow.models.param import Param
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from hooks.backoffice.workflow_management_hook import (
    HEP,
)
from hooks.custom_fttps_hook import CustomFTPSHook
from include.utils.alerts import FailedDagNotifierSetError

logger = logging.getLogger(__name__)
s3_hook = S3Hook(aws_conn_id="s3_conn")
bucket_name = Variable.get("s3_bucket_name")


@dag(
    params={
        "from": Param(type=["null", "string"], default=None),
        "until": Param(type=["null", "string"], default=None),
        "sync_folders": Param(
            type="array",
            default=[
                "IEEEUpdates_Cern" "Deleted_Cern",
                "XML_Cern",
            ],
        ),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule="0 0 * * 1",
    catchup=False,
    on_failure_callback=FailedDagNotifierSetError(collection=HEP),
    tags=[HEP],
)
def ieee_harvest_dag():
    """
    Initialize a DAG for ieee harvest workflow.
    """

    def recur_directory(ftp_hook, parent_dir):
        files = []
        items = ftp_hook.list_directory(parent_dir)
        for item in items:
            if "." in item:
                files.append(item)
            else:
                files.extend(recur_directory(ftp_hook, item))

        return files

    @task
    def ftp_to_s3(**context):
        """
        Test task to get a file from an FTPS server.
        """
        ftp_hook = CustomFTPSHook(ftp_conn_id="ieee_ftp")
        s3_hook = S3Hook(aws_conn_id="s3_conn")

        for parent_directory in context["params"]["sync_folders"]:
            directories = ftp_hook.list_directory(parent_directory)

            for directory in directories:
                there_is_key = s3_hook.check_for_wildcard_key(
                    f"{directory}/*", bucket_name
                )

                if not there_is_key:
                    logger.info(f"Pushing directory {directory} to s3")
                    files = recur_directory(ftp_hook, directory)

                    for file in files:
                        bio = BytesIO()
                        ftp_hook.get_conn()
                        ftp_hook.retrieve_file(file, bio)
                        bio.seek(0)
                        s3_hook.conn.upload_fileobj(bio, bucket_name, file)

    ftp_to_s3()


ieee_harvest_dag()
