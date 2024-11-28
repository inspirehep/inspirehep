import json

import pytest
from airflow.models import DagBag

dagbag = DagBag()


class TestDataHarvest:
    dag = dagbag.get_dag("data_harvest_dag")

    @pytest.mark.vcr
    def test_collect_ids(self):
        task = self.dag.get_task("collect_ids")
        res = task.execute(context={})
        assert res == [2851948, 2724476, 2851464, 2829504, 2854935]

    @pytest.mark.vcr
    def test_download_record(self):
        task = self.dag.get_task("download_record")
        id = "2851948"
        res = task.python_callable(id=id)
        assert res["record"]["inspire_id"] == id

    def test_transform_record(self):
        with open("tests/data_records/2851848.json") as f:
            record = json.load(f)
        task = self.dag.get_task("transform_record")
        res = task.python_callable(data_schema="data_schema", record=record)
        assert res["$schema"] == "data_schema"
        assert res["_collections"] == ["Data"]

    def test_load_record(self):
        record = {"_collections": ["Data"], "curated": False, "$schema": "data_schema"}
        task = self.dag.get_task("load_record")
        res = task.python_callable(record=record)
        assert res.status_code == 200
