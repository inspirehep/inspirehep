import json

import pytest
from airflow.models import DagBag
from airflow.utils.context import Context
from freezegun import freeze_time

dagbag = DagBag()


@freeze_time("2024-12-11")
class TestDataHarvest:
    dag = dagbag.get_dag("data_harvest_dag")
    context = Context()

    @pytest.mark.vcr
    def test_collect_ids_param(self):
        task = self.dag.get_task("collect_ids")
        res = task.execute(context=Context({"params": {"last_updated": "2024-12-15"}}))
        assert res == [2693068, 2807749, 2809112]

    @pytest.mark.vcr
    def test_collect_ids_logical_date(self):
        task = self.dag.get_task("collect_ids")
        res = task.execute(
            context=Context({"ds": "2024-12-16", "params": {"last_updated": ""}})
        )
        assert res == [2693068, 2807749, 2809112]

    @pytest.mark.vcr
    def test_download_record_versions(self):
        id = "1906174"
        task = self.dag.get_task("process_record.download_record_versions")
        task.op_args = (id,)
        res = task.execute(context=self.context)
        assert res["base"]["record"]["inspire_id"] == id
        assert res["base"]["record"]["version"] == 3
        assert all(value in res for value in [1, 2])

    def test_build_record(self):
        payload = {}
        with open("tests/data_records/ins1906174_version1.json") as f:
            payload[1] = json.load(f)
        with open("tests/data_records/ins1906174_version2.json") as f:
            payload[2] = json.load(f)
        with open("tests/data_records/ins1906174_version3.json") as f:
            payload["base"] = json.load(f)

        task = self.dag.get_task("process_record.build_record")
        task.op_kwargs = {
            "data_schema": "data_schema",
            "inspire_url": "https://inspirehep.net",
            "payload": payload,
        }
        res = task.execute(context=self.context)
        assert res["$schema"] == "data_schema"
        assert res["_collections"] == ["Data"]

        assert res["keywords"][0]["value"] == "cmenergies: 13000.0-13000.0"
        assert res["keywords"][1]["value"] == "observables: m_MMC"
        assert res["keywords"][2]["value"] == "observables: e=mc2"

        assert (
            res["urls"][0]["value"] == payload["base"]["record"]["resources"][0]["url"]
        )
        assert (
            res["literature"][0]["record"]["$ref"]
            == "https://inspirehep.net/api/literature/1906174"
        )

        assert res["literature"][0]["doi"] == "10.1103/PhysRevD.104.112010"

        assert res["dois"][0]["value"] == "10.17182/hepdata.104458"
        assert res["dois"][0]["material"] == "data"

        # check version doi was added
        assert any(
            doi["material"] == "version"
            and doi["value"] == "10.17182/hepdata.104458.v2"
            for doi in res["dois"]
        )
        # check resource doi was added
        assert any(
            doi["material"] == "part"
            and doi["value"] == "10.17182/hepdata.104458.v1/r2"
            for doi in res["dois"]
        )
        # check data table doi was added
        assert any(
            doi["material"] == "part"
            and doi["value"] == "10.17182/hepdata.104458.v3/t50"
            for doi in res["dois"]
        )

        assert res["acquisition_source"]["source"] == "inspirehep"
        assert any(doi["source"] == "inspirehep" for doi in res["dois"])

    @pytest.mark.vcr
    def test_load_record_put(self):
        record = {
            "_collections": ["Data"],
            "$schema": "https://inspirehep.net/schemas/records/data.json",
            "dois": [{"value": "10.8756/tTM", "material": "data"}],
        }
        task = self.dag.get_task("process_record.load_record")
        task.op_args = (record,)
        json_response = task.execute(context=self.context)
        assert json_response

    @pytest.mark.vcr
    def test_normalize_collaborations(self):
        # test what is returned if collaborations are initally empty
        record = {
            "collaborations": [{"value": "ETM"}],
            "acquisition_source": {"submission_number": "123"},
        }
        task = self.dag.get_task("process_record.normalize_collaborations")
        task.op_args = (record,)
        json_response = task.execute(context=self.context)

        assert "record" in json_response["collaborations"][0]
        assert (
            json_response["accelerator_experiments"][0]["legacy_name"] == "LATTICE-ETM"
        )

    @pytest.mark.vcr
    def test_load_record_post(self):
        record = {
            "_collections": ["Data"],
            "$schema": "https://inspirehep.net/schemas/records/data.json",
            "dois": [{"value": "10.1234567/test", "material": "data"}],
        }
        task = self.dag.get_task("process_record.load_record")
        task.op_args = (record,)
        json_response = task.execute(context=self.context)
        assert json_response
