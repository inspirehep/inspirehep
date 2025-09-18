import datetime
import logging

from airflow.decorators import dag
from airflow.models.param import Param
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from hooks.backoffice.workflow_management_hook import (
    HEP,
)
from include.utils.alerts import FailedDagNotifierSetError
from operators.ftps_file_transmit_operator import FTPOperation, FTPSFileTransmitOperator

logger = logging.getLogger(__name__)
s3_hook = S3Hook(aws_conn_id="s3_conn")
bucket_name = Variable.get("s3_bucket_name")


@dag(
    params={
        "workflow_id": Param(type="string"),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=FailedDagNotifierSetError(collection=HEP),
    tags=[HEP],
)
def ieee_harvest_dag():
    """
    Initialize a DAG for ieee harvest workflow.
    """

    ftps_get = FTPSFileTransmitOperator(
        task_id="test_ftps_get",
        ftp_conn_id="ieee_ftps",
        local_filepath="/tmp/filepath",
        remote_filepath="/remote_tmp/filepath",
        operation=FTPOperation.GET,
        create_intermediate_dirs=True,
    )
    ftps_get()


ieee_harvest_dag()
