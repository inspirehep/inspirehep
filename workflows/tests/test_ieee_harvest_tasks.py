from unittest.mock import patch

import pytest
from airflow.exceptions import AirflowException
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook

dagbag = DagBag()
s3_hook = S3Hook(aws_conn_id="s3_conn")
ieee_bucket_name = Variable.get("s3_ieee_bucket_name")


class TestIEEEHarvest:
    dag = dagbag.get_dag("ieee_harvest_dag")

    @pytest.mark.skip(reason="Reason fails locally but not in CI, needs investigation")
    @patch("include.utils.ftp.list_ftp_files", return_value=["a/1.xml"])
    @patch("hooks.custom_fttps_hook.CustomFTPSHook.list_directory", return_value=["a"])
    @patch(
        "hooks.custom_fttps_hook.CustomFTPSHook.retrieve_file",
        return_value=["file content"],
    )
    @patch("hooks.custom_fttps_hook.CustomFTPSHook.get_conn", return_value=True)
    def test_ftp_to_s3(
        self,
        mock_get_conn,
        mock_retrieve_file,
        mock_list_directory,
        mock_list_ftp_files,
    ):
        task = self.dag.get_task("ftp_to_s3")
        task.python_callable("")
        assert s3_hook.get_key("a/1.xml", ieee_bucket_name) is not None

    def test_check_new_directories(self):
        task = self.dag.get_task("check_new_directories")
        with pytest.raises(AirflowException):
            task.python_callable([False, False, False])
