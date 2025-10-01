from unittest.mock import patch

import pytest
from airflow.exceptions import AirflowException, AirflowSkipException
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.utils.context import Context
from include.utils.s3 import read_object, write_object
from sickle.oaiexceptions import NoRecordsMatch

from tests.test_utils import task_test

dagbag = DagBag()
s3_hook = S3Hook(aws_conn_id="s3_conn")
s3_conn = s3_hook.get_connection("s3_conn")
s3_creds = {
    "user": s3_conn.login,
    "secret": s3_conn.password,
    "host": s3_conn.extra_dejson.get("endpoint_url"),
}
bucket_name = Variable.get("s3_bucket_name")


class TestArxivHarvest:
    dag = dagbag.get_dag("arxiv_harvest_dag")

    @pytest.mark.vcr
    def test_fetch_records_logical_date(self):
        task = self.dag.get_task("process_records.fetch_records")
        task.op_kwargs = {
            "params": {"from": "", "until": "", "metadata_prefix": "arXiv"}
        }
        task.op_args = ("physics:hep-th",)
        res = task.execute(context=Context({"ds": "2025-07-02"}))
        result = read_object(s3_hook, bucket_name, res)
        assert len(result["records"])
        assert "oai:arXiv.org:2101.11905" in result["records"][0]
        assert "oai:arXiv.org:2207.10712" in result["records"][1]

    @pytest.mark.vcr
    def test_fetch_records_with_from_until(self):
        task = self.dag.get_task("process_records.fetch_records")
        task.op_kwargs = {
            "params": {
                "from": "2025-07-01",
                "until": "2025-07-01",
                "metadata_prefix": "arXiv",
            }
        }
        task.op_args = ("physics:hep-th",)
        res = task.execute(context=Context({"ds": "2025-07-03"}))
        result = read_object(s3_hook, bucket_name, res)

        assert len(result["records"])
        assert "oai:arXiv.org:2101.11905" in result["records"][0]
        assert "oai:arXiv.org:2207.10712" in result["records"][1]

    @patch("sickle.Sickle.ListRecords", side_effect=NoRecordsMatch)
    def test_fetch_no_records(self, mock_list_records):
        task = self.dag.get_task("process_records.fetch_records")
        task.op_kwargs = {
            "params": {"from": "", "until": "", "metadata_prefix": "arXiv"}
        }
        task.op_args = ("physics:hep-th",)

        with pytest.raises(AirflowSkipException):
            task.execute(context=Context({"ds": "2025-07-02"}))

    def test_build_records(self, datadir):
        xml_files = ["arxiv1608.06937.xml", "arxiv2007.03037.xml"]

        records = []
        for xml_file in xml_files:
            xml_string = (datadir / xml_file).read_text(encoding="utf-8")
            records.append(xml_string)
        s3_key = write_object(s3_hook, {"records": records}, bucket_name)

        res = task_test(
            dag_id="arxiv_harvest_dag",
            task_id="process_records.build_records",
            params={
                "s3_key": s3_key,
                "s3_creds": s3_creds,
                "bucket_name": bucket_name,
            },
            map_index=0,
        )

        result = read_object(s3_hook, bucket_name, res)

        assert len(result["parsed_records"]) == 2
        assert "acquisition_source" in result["parsed_records"][0]
        for parsed_record in result["parsed_records"]:
            assert parsed_record["acquisition_source"]["source"] == "arXiv"
            assert parsed_record["acquisition_source"]["method"] == "arxiv_harvest_dag"
            assert {"datetime", "submission_number"}.issubset(
                parsed_record["acquisition_source"]
            )
        assert len(result["failed_records"]) == 0

    def test_build_records_bad(self, datadir):
        xml_files = ["arxiv1608.06937.xml", "arxiv2007.03037-bad.xml"]

        records = []
        for xml_file in xml_files:
            xml_string = (datadir / xml_file).read_text(encoding="utf-8")
            records.append(xml_string)
        s3_key = write_object(s3_hook, {"records": records}, bucket_name)

        res = task_test(
            dag_id="arxiv_harvest_dag",
            task_id="process_records.build_records",
            params={
                "s3_key": s3_key,
                "s3_creds": s3_creds,
                "bucket_name": bucket_name,
            },
            map_index=0,
        )
        result = read_object(s3_hook, bucket_name, res)
        assert len(result["parsed_records"]) == 1
        assert len(result["failed_records"]) == 1

    @pytest.mark.vcr
    def test_load_records_failed(self):
        parsed_records = {
            "parsed_records": [
                {
                    "document_type": ["article"],
                    "_collections": ["Literature"],
                    "titles": [{"title": "Test Workflow Management Hook"}],
                },
                {
                    "document_type": ["article"],
                    "_collections": ["Literature"],
                },
            ]
        }
        task = self.dag.get_task("process_records.load_records")
        s3_key = write_object(s3_hook, parsed_records, bucket_name)
        task.op_args = (s3_key,)
        res = task.execute(context=Context())
        result = read_object(s3_hook, bucket_name, res)
        assert len(result["failed_records"]) == 1

    @pytest.mark.vcr
    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_load_records_multiple(self, mock_post_workflow):
        parsed_records = {
            "parsed_records": [
                {
                    "workflow_type": "HEP_CREATE",
                    "data": {
                        "document_type": ["article"],
                        "_collections": ["Literature"],
                        "titles": [{"title": "Test Workflow Management Hook"}],
                    },
                },
                {
                    "workflow_type": "HEP_CREATE",
                    "data": {
                        "document_type": ["article"],
                        "_collections": ["Literature"],
                        "titles": [{"title": "Test Workflow Management Hook"}],
                    },
                },
            ]
        }
        task = self.dag.get_task("process_records.load_records")
        s3_key = write_object(s3_hook, parsed_records, bucket_name)
        task.op_args = (s3_key,)
        task.execute(context=Context())
        assert mock_post_workflow.call_count == 2

    def test_check_failures_success(self):
        s3_keys = [
            write_object(s3_hook, {"failed_records": []}, bucket_name) for _ in range(2)
        ]

        task = self.dag.get_task("check_failures")
        task.op_args = (s3_keys, s3_keys)
        task.execute(context=Context())

    def test_check_failures_fail(self):
        task = self.dag.get_task("check_failures")

        s3_keys = [
            write_object(s3_hook, {"failed_records": []}, bucket_name) for _ in range(2)
        ]
        s3_keys.append(
            write_object(s3_hook, {"failed_records": ["record"]}, bucket_name)
        )
        task.op_args = (s3_keys, [])

        with pytest.raises(AirflowException) as exc_info:
            task.execute(context=Context())
        assert "The following records failed: ['record']" in str(exc_info.value)
