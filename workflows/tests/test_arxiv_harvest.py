from unittest.mock import patch

import pytest
from airflow.exceptions import AirflowException
from airflow.models import DagBag
from airflow.utils.context import Context
from sickle.oaiexceptions import NoRecordsMatch

dagbag = DagBag()


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
        assert len(res)
        assert "oai:arXiv.org:2101.11905" in res[0]
        assert "oai:arXiv.org:2207.10712" in res[1]

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
        assert len(res)
        assert "oai:arXiv.org:2101.11905" in res[0]
        assert "oai:arXiv.org:2207.10712" in res[1]

    @patch("sickle.Sickle.ListRecords", side_effect=NoRecordsMatch)
    def test_fetch_no_records(self, mock_list_records):
        task = self.dag.get_task("process_records.fetch_records")
        task.op_kwargs = {
            "params": {"from": "", "until": "", "metadata_prefix": "arXiv"}
        }
        task.op_args = ("physics:hep-th",)

        res = task.execute(context=Context({"ds": "2025-07-02"}))

        assert len(res) == 0

    def test_build_records(self, datadir):
        xml_files = ["arxiv1608.06937.xml", "arxiv2007.03037.xml"]

        records = []
        for xml_file in xml_files:
            xml_string = (datadir / xml_file).read_text(encoding="utf-8")
            records.append(xml_string)

        task = self.dag.get_task("process_records.build_records")
        task.op_args = (records,)

        res = task.execute(context=Context())
        assert len(res["parsed_records"]) == 2
        assert len(res["failed_records"]) == 0

    def test_build_records_bad(self, datadir):
        xml_files = ["arxiv1608.06937.xml", "arxiv2007.03037-bad.xml"]

        records = []
        for xml_file in xml_files:
            xml_string = (datadir / xml_file).read_text(encoding="utf-8")
            records.append(xml_string)

        task = self.dag.get_task("process_records.build_records")
        task.op_args = (records,)

        res = task.execute(context=Context())
        assert len(res["parsed_records"]) == 1
        assert len(res["failed_records"]) == 1

    def test_load_record(self):
        pass

    def test_check_failures_success(self):
        task = self.dag.get_task("summarize_failures")
        task.op_args = ([[], [], []],)
        task.execute(context=Context())

    def test_check_failures_fail(self):
        task = self.dag.get_task("summarize_failures")
        task.op_args = ([[], [], ["record"]],)

        with pytest.raises(AirflowException) as exc_info:
            task.execute(context=Context())
        assert "The following records failed: ['record']" in str(exc_info.value)
