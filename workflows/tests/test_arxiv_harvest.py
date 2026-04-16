import pytest
from airflow.models import DagBag
from airflow.sdk.exceptions import AirflowException
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.arxiv import build_records

from tests.test_utils import task_test2

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestArxivHarvest:
    dag = dagbag.get_dag("arxiv_harvest_dag")
    connection_id = "arxiv_oaipmh_connection"
    workflow_management_hook = WorkflowManagementHook(HEP)

    def test_build_records(self, datadir):
        xml_files = ["arxiv1608.06937.xml", "arxiv2007.03037.xml"]

        xml_records = []
        for xml_file in xml_files:
            xml_string = (datadir / xml_file).read_text(encoding="utf-8")
            xml_records.append(xml_string)

        parsed_records, failed_build_records = build_records(xml_records, "12345")

        assert len(parsed_records) == 2
        assert "acquisition_source" in parsed_records[0]
        for parsed_record in parsed_records:
            assert parsed_record["acquisition_source"]["source"] == "arXiv"
            assert parsed_record["acquisition_source"]["method"] == "hepcrawl"
            assert {"datetime", "submission_number"}.issubset(
                parsed_record["acquisition_source"]
            )
        assert len(failed_build_records) == 0

    def test_build_records_bad(self, datadir):
        xml_files = ["arxiv1608.06937.xml", "arxiv2007.03037-bad.xml"]

        xml_records = []
        for xml_file in xml_files:
            xml_string = (datadir / xml_file).read_text(encoding="utf-8")
            xml_records.append(xml_string)

        parsed_records, failed_build_records = build_records(xml_records, "12345")
        assert len(parsed_records) == 1
        assert len(failed_build_records) == 1

    def test_check_failures_success(self):
        s3_key = self.s3_store.write_object(
            {"failed_build_records": [], "failed_load_records": []}
        )

        task_test2(self.dag, "check_failures", params={"failed_record_key": s3_key})

    def test_check_failures_fail(self):
        s3_key = self.s3_store.write_object({"failed_build_records": ["record"]})

        with pytest.raises(AirflowException) as exc_info:
            task_test2(
                self.dag,
                "check_failures",
                params={"failed_record_key": s3_key},
            )
        assert "The following records failed: ['record']" in str(exc_info.value)
