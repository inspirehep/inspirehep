import orjson
import pytest
from airflow.models import DagBag
from airflow.utils.context import Context
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

    def test_build_record(self, datadir):
        payload = {
            "cds_id": "8888888",
        }
        payload["original_record"] = orjson.loads(
            (datadir / "record_1674998.json").read_text()
        )
        task = self.dag.get_task("process_cds_response.build_record")
        task.op_args = (payload,)
        res = task.execute(context=Context())
        assert res["revision"] == 0
        assert (
            res["updated_record"]["external_system_identifiers"][0]["schema"] == "CDS"
        )
        assert (
            res["updated_record"]["external_system_identifiers"][0]["value"]
            == "8888888"
        )

    @pytest.mark.vcr
    def test_update_record(self, datadir):
        payload = {
            "revision": 0,
        }
        payload["updated_record"] = orjson.loads(
            (datadir / "updated_record_1674998.json").read_text()
        )
        task = self.dag.get_task("process_cds_response.update_inspire_record")
        task.op_args = (payload,)
        res = task.execute(context=Context())
        assert res["metadata"]["external_system_identifiers"][0]["schema"] == "CDS"
        assert res["metadata"]["external_system_identifiers"][0]["value"] == "8888888"
