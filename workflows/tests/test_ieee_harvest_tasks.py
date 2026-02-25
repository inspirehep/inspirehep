from unittest.mock import patch

import pytest
from airflow.exceptions import AirflowException
from airflow.models.variable import Variable

from tests.test_utils import task_test

ieee_bucket_name = Variable.get("s3_ieee_bucket_name")


class TestIEEEHarvest:
    @pytest.mark.usefixtures("_s3_store")
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
        ds = "2025-01-01"
        dag_params = {"sync_folders": ["IEEEUpdates_Cern"]}

        task_test(
            dag_id="ieee_harvest_dag",
            task_id="get_sync_folders",
            dag_params=dag_params,
            ds=ds,
        )
        task_test(
            dag_id="ieee_harvest_dag",
            task_id="ftp_to_s3",
            dag_params=dag_params,
            map_index=0,
            ds=ds,
            xcom_key="skipmixin_key",
        )

        assert self.s3_store.hook.get_key("a/1.xml", ieee_bucket_name) is not None

    def test_check_new_directories(self):
        with pytest.raises(AirflowException):
            task_test(
                dag_id="ieee_harvest_dag",
                task_id="check_new_directories",
                params={"has_new_directories": [False, False, False]},
            )

    def test_check_new_directories_with_new_directory(self):
        task_test(
            dag_id="ieee_harvest_dag",
            task_id="check_new_directories",
            params={"has_new_directories": [False, True, False]},
        )
