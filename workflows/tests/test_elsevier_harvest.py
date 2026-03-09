import uuid
from io import BytesIO
from unittest.mock import Mock, patch
from urllib.parse import urlparse

import pytest

from tests.test_utils import task_test


@pytest.mark.usefixtures("_s3_store")
@pytest.mark.parametrize("_s3_store", ["s3_elsevier_conn"], indirect=True)
class TestElsevierHarvest:
    @patch("hooks.generic_http_hook.GenericHttpHook.call_api")
    def test_fetch_package_feed(self, mock_call_api):
        mock_response = Mock()
        mock_response.content = """
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <title> pkg-a.zip </title>
                <link href="https://example.org/pkg-a.zip" />
            </entry>
            <entry>
                <title> pkg-b.zip </title>
                <link href="https://example.org/pkg-b.zip" />
            </entry>
        </feed>
        """
        mock_call_api.return_value = mock_response

        s3_key = task_test(
            dag_id="elsevier_harvest_dag",
            task_id="fetch_package_feed",
        )
        payload = self.s3_store.read_object(s3_key)
        assert payload == {
            "feed": [
                {"name": "pkg-a.zip", "url": "https://example.org/pkg-a.zip"},
                {"name": "pkg-b.zip", "url": "https://example.org/pkg-b.zip"},
            ]
        }

    @patch("hooks.generic_http_hook.GenericHttpHook.call_api")
    def test_download_new_packages(self, mock_call_api):
        file_name = f"{str(uuid.uuid4())}_bundle.zip"

        packages_key = self.s3_store.write_object(
            {
                "feed": [
                    {"name": "notes.txt", "url": "https://api.example.org/notes.txt"},
                    {
                        "name": file_name,
                        "url": f"https://api.example.org/files/{file_name}",
                    },
                ]
            }
        )

        download_response = Mock()
        download_response.raw = BytesIO(b"dummy zip bytes")
        mock_call_api.return_value = download_response

        harvest_key = task_test(
            dag_id="elsevier_harvest_dag",
            task_id="download_new_packages",
            params={"s3_packages_key": packages_key},
        )
        assert self.s3_store.read_object(harvest_key)["downloaded"] == [
            f"packages/{file_name}"
        ]
        assert self.s3_store.hook.get_key(f"packages/{file_name}") is not None

    @patch("hooks.generic_http_hook.GenericHttpHook.call_api")
    def test_download_new_packages_skip(self, mock_call_api):
        file_name = f"{str(uuid.uuid4())}_bundle.zip"
        self.s3_store.write_object("dummy content", key=f"packages/{file_name}")
        packages_key = self.s3_store.write_object(
            {
                "feed": [
                    {"name": "notes.txt", "url": "https://api.example.org/notes.txt"},
                    {
                        "name": file_name,
                        "url": f"https://api.example.org/files/{file_name}",
                    },
                ]
            }
        )

        download_response = Mock()
        download_response.raw = BytesIO(b"dummy zip bytes")
        mock_call_api.return_value = download_response

        harvest_key = task_test(
            dag_id="elsevier_harvest_dag",
            task_id="download_new_packages",
            params={"s3_packages_key": packages_key},
        )
        assert len(self.s3_store.read_object(harvest_key)["downloaded"]) == 0

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_process_packages(self, mock_post_workflow, datadir):
        zip_file = "117653164249626153-00001-FULL-XML-VACUUM (0042-207X) 1.7.14.ZIP"

        processed_article_files = [
            "10.1016/j.vacuum.2026.115222.xml",
            "10.1016/j.vacuum.2026.115223.xml",
            "10.1016/j.vacuum.2026.115235.xml",
        ]

        package_key = f"packages/{zip_file}"
        self.s3_store.hook.load_file(
            datadir / zip_file,
            package_key,
            replace=True,
        )
        harvest_key = self.s3_store.write_object(
            {"downloaded": [package_key]},
            key=f"harvests/{str(uuid.uuid4())}.json",
        )

        failed_records_key = task_test(
            dag_id="elsevier_harvest_dag",
            task_id="process_packages",
            params={"harvest_key": harvest_key},
        )

        failures = self.s3_store.read_object(failed_records_key)

        assert len(failures["failed_records"]) == 0
        assert mock_post_workflow.call_count == 3
        for call_idx, article_file in enumerate(processed_article_files):
            assert self.s3_store.hook.get_key(f"articles/{article_file}") is not None
            assert (
                urlparse(
                    mock_post_workflow.call_args_list[call_idx].kwargs["workflow_data"][
                        "data"
                    ]["documents"][0]["url"]
                ).path
                == f"/{self.s3_store.bucket_name}/articles/{article_file}"
            )
