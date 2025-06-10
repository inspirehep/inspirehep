import orjson
import pytest
from airflow.exceptions import AirflowSkipException
from airflow.models import DagBag
from airflow.utils.context import Context
from freezegun import freeze_time

dagbag = DagBag()


@freeze_time("2024-12-11")
class TestCDSRDMHarvest:
    dag = dagbag.get_dag("cds_rdm_harvest_dag")

    @pytest.mark.vcr
    def test_get_cds_rdm_data_vcr(self):
        task = self.dag.get_task("get_cds_rdm_data")
        context = {
            "ds": "2025-06-01",
            "params": {"since": "2025-06-01"},
            "task_instance": None,
        }
        task.render_template_fields(context)
        res = task.execute(
            context=context,
        )
        assert len(res)

    @pytest.mark.vcr
    def test_process_record_cds_rdm_already_in_record(self):
        cds_record = {
            "id": "2635152",
            "metadata": {
                "identifiers": [
                    {"scheme": "inspire", "identifier": "1675000"},
                ]
            },
        }

        task = self.dag.get_task("process_cds_rdm_response.process_record")
        task.op_args = (cds_record,)
        with pytest.raises(AirflowSkipException) as excinfo:
            task.execute(context=Context())

        msg = str(excinfo.value)
        assert "Correct CDS identifier is already present in the record." in msg

    @pytest.mark.vcr
    def test_process_record_cds_rdm_no_record_found_in_inspire(self):
        cds_record = {
            "id": "2635152",
            "metadata": {
                "identifiers": [
                    {"scheme": "inspire", "identifier": "123456"},
                ]
            },
        }
        task = self.dag.get_task("process_cds_rdm_response.process_record")
        task.op_args = (cds_record,)
        with pytest.raises(AirflowSkipException) as excinfo:
            task.execute(context=Context())

        msg = str(excinfo.value)
        assert "Skipping CDS hit 2635152 (no record found in Inspire)" in msg

    @pytest.mark.vcr
    def test_process_record_cds_not_in_record(self):
        cds_record = {
            "id": "8888888",
            "pids": {"doi": {"identifier": "10.1093/mnras/stx1360"}},
            "metadata": {
                "identifiers": [
                    {"scheme": "inspire", "identifier": "1675001"},
                ]
            },
        }
        task = self.dag.get_task("process_cds_rdm_response.process_record")
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
