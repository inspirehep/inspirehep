import datetime
from unittest.mock import patch

import pytest
from airflow.models import DagBag
from airflow.sdk import Variable
from airflow.sdk.exceptions import AirflowException

from tests.test_utils import task_test

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestIEEEHarvest:
    dag = dagbag.get_dag("ieee_harvest_dag")

    def clear_s3_prefix(self, prefix):
        bucket_name = Variable.get("s3_ieee_bucket_name")
        keys = self.s3_store.hook.list_keys(bucket_name, prefix=prefix)
        if keys:
            self.s3_store.hook.delete_objects(bucket_name, keys)

    @patch(
        "include.utils.ftp.list_ftp_files",
        return_value=["IEEEUpdates_Cern/week01a/1.xml"],
    )
    @patch(
        "hooks.custom_fttps_hook.CustomFTPSHook.list_directory",
        return_value=["IEEEUpdates_Cern/week01a"],
    )
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
            self.dag,
            task_id="get_sync_folders",
            context={"ds": ds, "params": dag_params},
        )
        ieee_bucket_name = Variable.get("s3_ieee_bucket_name")
        s3_key = "IEEEUpdates_Cern/2025-week01a/1.xml"
        self.clear_s3_prefix("IEEEUpdates_Cern/2025-week01a/")

        has_new_directory = task_test(
            self.dag,
            task_id="ftp_to_s3",
            context={"logical_date": datetime.datetime(2025, 1, 8)},
            params={"sync_folder": "IEEEUpdates_Cern"},
        )

        assert has_new_directory is True
        assert self.s3_store.hook.get_key(s3_key, ieee_bucket_name) is not None
        mock_list_ftp_files.assert_called_once()
        assert mock_list_ftp_files.call_args.args[1] == "IEEEUpdates_Cern/week01a"

    @patch(
        "include.utils.ftp.list_ftp_files",
        return_value=["IEEEUpdates_Cern/week52a/1.xml"],
    )
    @patch(
        "hooks.custom_fttps_hook.CustomFTPSHook.list_directory",
        return_value=["IEEEUpdates_Cern/README", "IEEEUpdates_Cern/week52a"],
    )
    @patch(
        "hooks.custom_fttps_hook.CustomFTPSHook.retrieve_file",
        return_value=["file content"],
    )
    @patch("hooks.custom_fttps_hook.CustomFTPSHook.get_conn", return_value=True)
    def test_ftp_to_s3_skips_non_week_directory_and_uses_previous_year(
        self,
        mock_get_conn,
        mock_retrieve_file,
        mock_list_directory,
        mock_list_ftp_files,
    ):
        ieee_bucket_name = Variable.get("s3_ieee_bucket_name")
        s3_key = "IEEEUpdates_Cern/2024-week52a/1.xml"
        self.clear_s3_prefix("IEEEUpdates_Cern/2024-week52a/")

        has_new_directory = task_test(
            self.dag,
            task_id="ftp_to_s3",
            context={"logical_date": datetime.datetime(2025, 1, 8)},
            params={"sync_folder": "IEEEUpdates_Cern"},
        )

        assert has_new_directory is True
        assert self.s3_store.hook.get_key(s3_key, ieee_bucket_name) is not None
        mock_list_ftp_files.assert_called_once()
        assert mock_list_ftp_files.call_args.args[1] == "IEEEUpdates_Cern/week52a"

    @patch("include.utils.ftp.list_ftp_files")
    @patch(
        "hooks.custom_fttps_hook.CustomFTPSHook.list_directory",
        return_value=["IEEEUpdates_Cern/week01a"],
    )
    def test_ftp_to_s3_skips_existing_year_prefixed_directory(
        self,
        mock_list_directory,
        mock_list_ftp_files,
    ):
        ieee_bucket_name = Variable.get("s3_ieee_bucket_name")
        existing_key = "IEEEUpdates_Cern/2025-week01a/existing.xml"
        self.clear_s3_prefix("IEEEUpdates_Cern/2025-week01a/")
        self.s3_store.hook.load_string(
            "existing content",
            existing_key,
            bucket_name=ieee_bucket_name,
        )

        has_new_directory = task_test(
            self.dag,
            task_id="ftp_to_s3",
            context={"logical_date": datetime.datetime(2025, 1, 8)},
            params={"sync_folder": "IEEEUpdates_Cern"},
        )

        assert has_new_directory is False
        mock_list_ftp_files.assert_not_called()

    def test_check_new_directories(self):
        with pytest.raises(AirflowException):
            task_test(
                self.dag,
                "check_new_directories",
                params={"has_new_directories": [False, False, False]},
            )

    def test_check_new_directories_with_new_directory(self):
        task_test(
            self.dag,
            "check_new_directories",
            params={"has_new_directories": [False, True, False]},
        )
