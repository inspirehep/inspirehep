import json

import pytest
from freezegun import freeze_time
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.cds import retrieve_and_validate_record
from inspire_utils.record import get_values_for_schema

from tests.test_utils import function_test, task_test


@freeze_time("2024-12-11")
class TestCDSRDMHarvest:
    @pytest.mark.vcr
    def test_get_cds_rdm_data_vcr(self, vcr_cassette):
        context = {
            "ds": "2025-12-11T00:00:00",
            "params": {
                "since": "2025-12-10T00:00:00",
                "until": "2025-12-12T00:00:00",
            },
            "task_instance": None,
        }
        res = task_test(
            "cds_rdm_harvest_dag",
            "get_cds_rdm_data",
            dag_params=context["params"],
        )

        assert res is None
        idx = next(
            i for i, req in enumerate(vcr_cassette.requests) if req.method == "PUT"
        )
        hep_request = vcr_cassette.requests[idx]
        result = json.loads(hep_request.body)
        assert result["external_system_identifiers"][0]["schema"] == "CDSRDM"
        assert result["external_system_identifiers"][0]["value"] == "1849g-prn51"

    @pytest.mark.vcr
    def test_skip_when_cds_id_already_present(self):
        hook = InspireHTTPRecordManagementHook()
        params = {
            "inspire_http_record_management_hook": hook,
            "cds_id": "2635152",
            "control_numbers": ["1675000"],
            "arxivs": [],
            "dois": [],
            "report_numbers": [],
            "schema": "CDSRDM",
        }

        result = function_test(retrieve_and_validate_record, params=params)
        assert result is None

    @pytest.mark.vcr
    def test_skip_when_no_inspire_record_found(self):
        hook = InspireHTTPRecordManagementHook()

        params = {
            "inspire_http_record_management_hook": hook,
            "cds_id": "2635152",
            "control_numbers": ["123456"],
            "arxivs": [],
            "dois": [],
            "report_numbers": [],
            "schema": "CDSRDM",
        }

        result = function_test(retrieve_and_validate_record, params=params)
        assert result is None

    @pytest.mark.vcr
    def test_successful_retrieve_and_validate(self):
        hook = InspireHTTPRecordManagementHook()

        params = {
            "inspire_http_record_management_hook": hook,
            "cds_id": "8888888",
            "control_numbers": ["1675001"],
            "arxivs": [],
            "dois": ["10.1093/mnras/stx1360"],
            "report_numbers": [],
            "schema": "CDSRDM",
        }

        result = function_test(retrieve_and_validate_record, params=params)
        assert isinstance(result, dict)
        assert result["cds_id"] == "8888888"
        assert "original_record" in result

        metadata = result["original_record"]["metadata"]
        external_ids = metadata.get("external_system_identifiers", [])
        existing_cds = get_values_for_schema(external_ids, "CDSRDM")
        assert "8888888" not in existing_cds
