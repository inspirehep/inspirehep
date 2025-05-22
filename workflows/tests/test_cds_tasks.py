import orjson
import pytest
from airflow.exceptions import AirflowSkipException
from airflow.models import DagBag
from airflow.utils.context import Context
from freezegun import freeze_time

dagbag = DagBag()


@freeze_time("2024-12-11")
class TestCDSHarvest:
    dag = dagbag.get_dag("cds_harvest_dag")

    @pytest.mark.vcr
    def test_get_cds_data_vcr(self):
        task = self.dag.get_task("get_cds_data")
        res = task.execute(
            context={"ds": "2025-05-23", "params": {"since": "2025-05-23"}}
        )
        assert len(res)

    @pytest.mark.vcr
    def test_process_record_cds_already_in_record(self):
        cds_record = {
            "id": "2635152",
            "metadata": {
                "other_ids": ["1674999"],
                "report_numbers": [{"value": "arXiv:1706.01046"}],
                "dois": [{"value": "10.1093/mnras/stx1358"}],
                "control_number": "2635152",
            },
        }
        task = self.dag.get_task("process_cds_response.process_record")
        task.op_args = (cds_record,)
        with pytest.raises(AirflowSkipException) as excinfo:
            task.execute(context=Context())

        msg = str(excinfo.value)
        assert "Correct CDS identifier is already present in the record." in msg

    @pytest.mark.vcr
    def test_process_record_no_record_found_in_inspire(self):
        cds_record = {
            "id": "2927166",
            "metadata": {
                "report_numbers": [{"value": "ATL-COM-PHYS-2025-193"}],
                "control_number": "2927166",
            },
        }
        task = self.dag.get_task("process_cds_response.process_record")
        task.op_args = (cds_record,)
        with pytest.raises(AirflowSkipException) as excinfo:
            task.execute(context=Context())

        msg = str(excinfo.value)
        assert "Skipping CDS hit 2927166 (no record found in Inspire)" in msg

    @pytest.mark.vcr
    def test_process_record_cds_not_in_record(self):
        cds_record = {
            "id": "8888888",
            "metadata": {
                "other_ids": ["1674997"],
                "report_numbers": [{"value": "arXiv:1706.01046"}],
                "dois": [{"value": "10.1093/mnras/stx1356"}],
                "control_number": "8888888",
            },
        }
        task = self.dag.get_task("process_cds_response.process_record")
        task.op_args = (cds_record,)
        res = task.execute(context=Context())

        assert isinstance(res, dict)
        assert res["cds_id"] == "8888888"
        assert "original_record" in res
        assert "external_system_identifiers" not in res["original_record"]["metadata"]

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
