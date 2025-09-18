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
class TestCDSRDMHarvest:
    dag = dagbag.get_dag("cds_rdm_harvest_dag")

    @pytest.mark.vcr
    def test_get_cds_rdm_data_vcr(self):
        task = self.dag.get_task("get_cds_rdm_data")
        context = {
            "ds": "2025-07-01T00:00:00",
            "params": {
                "since": "2025-06-01T00:00:00",
                "until": "2025-07-01T00:00:00",
            },
            "task_instance": None,
        }
        task.render_template_fields(context)
        q = task.data["q"]
        assert q == "updated:[2025-06-01T00:00:00 TO 2025-07-01T00:00:00]"

    @pytest.mark.vcr
    def test_skip_when_cds_id_already_present(self):
        hook = InspireHTTPRecordManagementHook()
        result = retrieve_and_validate_record(
            inspire_http_record_management_hook=hook,
            cds_id="2635152",
            control_numbers=["1675000"],
            arxivs=[],
            dois=[],
            report_numbers=[],
            schema="CDSRDM",
        )
        assert result is None

    @pytest.mark.vcr
    def test_skip_when_no_inspire_record_found(self):
        hook = InspireHTTPRecordManagementHook()
        result = retrieve_and_validate_record(
            inspire_http_record_management_hook=hook,
            cds_id="2635152",
            control_numbers=["123456"],
            arxivs=[],
            dois=[],
            report_numbers=[],
            schema="CDSRDM",
        )
        assert result is None

    @pytest.mark.vcr
    def test_successful_retrieve_and_validate(self):
        hook = InspireHTTPRecordManagementHook()
        result = retrieve_and_validate_record(
            inspire_http_record_management_hook=hook,
            cds_id="8888888",
            control_numbers=["1675001"],
            arxivs=[],
            dois=["10.1093/mnras/stx1360"],
            report_numbers=[],
            schema="CDSRDM",
        )
        assert isinstance(result, dict)
        assert result["cds_id"] == "8888888"
        assert "original_record" in result

        metadata = result["original_record"]["metadata"]
        external_ids = metadata.get("external_system_identifiers", [])
        existing_cds = get_values_for_schema(external_ids, "CDSRDM")
        assert "8888888" not in existing_cds

    def test_build_record(self, datadir):
        payload = {
            "cds_id": "8888888",
        }
        payload["original_record"] = orjson.loads(
            (datadir / "record_1675001.json").read_text()
        )
        task = self.dag.get_task("process_cds_rdm_response.build_record")
        task.op_args = (payload,)
        res = task.execute(context=Context())
        assert res["revision"] == 0
        assert (
            res["updated_record"]["external_system_identifiers"][0]["schema"]
            == "CDSRDM"
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
            (datadir / "updated_record_1675001.json").read_text()
        )
        task = self.dag.get_task("process_cds_rdm_response.update_inspire_record")
        task.op_args = (payload,)
        res = task.execute(context=Context())
        assert res["metadata"]["external_system_identifiers"][0]["schema"] == "CDSRDM"
        assert res["metadata"]["external_system_identifiers"][0]["value"] == "8888888"
