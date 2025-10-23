import json

import pytest
from airflow.models import DagBag
from freezegun import freeze_time
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.cds import retrieve_and_validate_record
from inspire_utils.record import get_values_for_schema

dagbag = DagBag()


@freeze_time("2024-12-11")
class TestCDSHarvest:
    dag = dagbag.get_dag("cds_harvest_dag")

    @pytest.mark.vcr
    def test_get_cds_data_vcr(self, vcr_cassette):
        task = self.dag.get_task("get_cds_data")
        context = {
            "ds": "2025-10-24",
            "params": {
                "since": "2025-10-24",
            },
            "task_instance": None,
        }
        res = task.execute(context=context)
        assert res is None
        idx = next(
            i for i, req in enumerate(vcr_cassette.requests) if req.method == "PUT"
        )
        hep_request = vcr_cassette.requests[idx]
        result = json.loads(hep_request.body)
        assert result["external_system_identifiers"][0]["schema"] == "CDS"
        assert result["external_system_identifiers"][0]["value"] == "2056247"

    @pytest.mark.vcr
    def test_skip_when_cds_id_already_present(self):
        hook = InspireHTTPRecordManagementHook()
        result = retrieve_and_validate_record(
            inspire_http_record_management_hook=hook,
            cds_id="2635152",
            control_numbers=["1674999"],
            arxivs=[],
            dois=["10.1093/mnras/stx1358"],
            report_numbers=["arXiv:1706.01046"],
            schema="CDS",
        )
        assert result is None

    @pytest.mark.vcr
    def test_skip_when_no_inspire_record_found(self):
        hook = InspireHTTPRecordManagementHook()
        result = retrieve_and_validate_record(
            inspire_http_record_management_hook=hook,
            cds_id="2927166",
            control_numbers=[],
            arxivs=[],
            dois=[],
            report_numbers=["ATL-COM-PHYS-2025-193"],
            schema="CDS",
        )
        assert result is None

    @pytest.mark.vcr
    def test_successful_retrieve_and_validate(self):
        hook = InspireHTTPRecordManagementHook()
        result = retrieve_and_validate_record(
            inspire_http_record_management_hook=hook,
            cds_id="8888888",
            control_numbers=["1674997"],
            arxivs=[],
            dois=["10.1093/mnras/stx1356"],
            report_numbers=["arXiv:1706.01046"],
            schema="CDS",
        )
        assert isinstance(result, dict)
        assert result["cds_id"] == "8888888"
        assert "original_record" in result

        metadata = result["original_record"]["metadata"]
        external_ids = metadata.get("external_system_identifiers", [])
        existing_cds = get_values_for_schema(external_ids, "CDS")
        assert "8888888" not in existing_cds
