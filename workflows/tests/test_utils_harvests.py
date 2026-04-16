from unittest.mock import Mock, patch

import pytest
from airflow.models import DagBag
from airflow.sdk.exceptions import AirflowException
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.constants import HEP_CREATE, HEP_PUBLISHER_CREATE
from include.utils.harvests import fetch_records_oaipmh, load_records
from sickle.oaiexceptions import NoRecordsMatch

from tests.test_utils import task_test2

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestUtilsHarvests:
    dag = dagbag.get_dag("arxiv_harvest_dag")
    cds_connection_id = "cds_oaipmh_connection"
    arxiv_connection_id = "arxiv_oaipmh_connection"
    workflow_management_hook = WorkflowManagementHook(HEP)

    @pytest.mark.vcr
    def test_load_records_failed(self):
        parsed_records = [
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

        failed_load_records = load_records(
            parsed_records, self.workflow_management_hook, HEP_CREATE
        )

        assert len(failed_load_records) == 1

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_load_records_multiple(self, mock_post_workflow):
        parsed_records = [
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Test Workflow Management Hook"}],
            },
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Test Workflow Management Hook"}],
            },
        ]

        failed_load_records = load_records(
            parsed_records,
            self.workflow_management_hook,
            workflow_type=HEP_CREATE,
        )
        assert mock_post_workflow.call_count == 2
        assert len(failed_load_records) == 0

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    def test_load_records_uses_custom_workflow_type(self, mock_post_workflow):
        parsed_records = [
            {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Publisher workflow"}],
            },
        ]

        failed_load_records = load_records(
            parsed_records,
            self.workflow_management_hook,
            workflow_type=HEP_PUBLISHER_CREATE,
        )

        mock_post_workflow.assert_called_once_with(
            workflow_data={
                "data": parsed_records[0],
                "workflow_type": HEP_PUBLISHER_CREATE,
            }
        )
        assert len(failed_load_records) == 0

    def test_check_failures_success(self):
        s3_key = self.s3_store.write_object(
            {"failed_build_records": [], "failed_load_records": []}
        )

        task_test2(
            self.dag,
            "check_failures",
            params={"failed_record_key": s3_key},
        )

    def test_check_failures_fail(self):
        s3_key = self.s3_store.write_object({"failed_build_records": ["record"]})

        with pytest.raises(AirflowException) as exc_info:
            task_test2(
                self.dag,
                "check_failures",
                params={"failed_record_key": s3_key},
            )
        assert "The following records failed: ['record']" in str(exc_info.value)

    def test_check_failures_no_key(self):
        s3_key = None

        task_test2(
            self.dag,
            "check_failures",
            params={"failed_record_key": s3_key},
        )

    @pytest.mark.vcr
    def test_fetch_records_oaipmh(self):
        xml_records = fetch_records_oaipmh(
            self.cds_connection_id,
            "marcxml",
            ["cerncds:atlas-pub"],
            "2026-02-24",
            "2026-04-14",
        )

        assert len(xml_records)
        assert "oai:cds.cern.ch:2956726" in xml_records[0]
        assert "oai:cds.cern.ch:2957067" in xml_records[1]

    @pytest.mark.vcr
    def test_fetch_records_logical_date(self):
        xml_records = fetch_records_oaipmh(
            self.arxiv_connection_id, "arXiv", ["physics:hep-th"], "2025-07-01"
        )

        assert len(xml_records)
        assert "oai:arXiv.org:2101.11905" in xml_records[0]
        assert "oai:arXiv.org:2207.10712" in xml_records[1]

    @pytest.mark.vcr
    def test_fetch_records_with_from_until(self):
        xml_records = fetch_records_oaipmh(
            self.arxiv_connection_id,
            "arXiv",
            ["physics:hep-th"],
            "2025-07-01",
            "2025-07-01",
        )

        assert len(xml_records)
        assert "oai:arXiv.org:2101.11905" in xml_records[0]
        assert "oai:arXiv.org:2207.10712" in xml_records[1]

    @patch("include.utils.harvests.Sickle.ListRecords", side_effect=NoRecordsMatch)
    def test_fetch_no_records(self, mock_list_records):
        fetch_records_oaipmh(
            self.arxiv_connection_id, "arXiv", ["physics:hep-th"], "2025-07-01"
        )

    @patch("include.utils.harvests.Sickle.ListRecords")
    def test_fetch_records_no_duplicates(self, mock_list_records):
        mock_record = Mock()
        mock_record.header.identifier = "oai:arXiv.org:2101.11905"
        mock_record.raw = "<record>Test Record</record>"
        mock_list_records.return_value = [mock_record, mock_record]

        xml_records = fetch_records_oaipmh(
            self.arxiv_connection_id,
            "arXiv",
            ["physics:hep-th", "physics:astro-ph"],
            "2025-07-01",
        )
        assert len(xml_records) == 1
