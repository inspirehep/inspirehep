import json

import pytest
from airflow.models import DagBag
from airflow.utils.context import Context

dagbag = DagBag()


class TestDataHarvest:
    dag = dagbag.get_dag("data_harvest_dag")
    context = Context()

    @pytest.mark.vcr
    def test_collect_ids(self):
        task = self.dag.get_task("collect_ids")
        res = task.execute(context=self.context)
        assert res == [2851948, 2724476, 2851464, 2829504, 2854935]

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
        task.op_kwargs = {"data_schema": "data_schema", "payload": payload}
        res = task.execute(context=self.context)
        assert res["$schema"] == "data_schema"
        assert res["_collections"] == ["Data"]

        assert res["keywords"][0]["value"] == "cmenergies: 13000.0-13000.0"
        assert res["keywords"][1]["value"] == "observables: m_MMC"

        assert (
            res["urls"][0]["value"] == payload["base"]["record"]["resources"][0]["url"]
        )
        assert (
            res["literature"][0]["record"]["$ref"]
            == "https://inspirehep.net/literature/1906174"
        )

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

    def test_load_record(self):
        record = {"_collections": ["Data"], "curated": False, "$schema": "data_schema"}
        task = self.dag.get_task("load_record")
        res = task.python_callable(record=record)
        assert res.status_code == 200
