import orjson
import pytest
from airflow.models import DagBag
from airflow.utils.context import Context
from freezegun import freeze_time

dagbag = DagBag()


@freeze_time("2024-12-15")
class TestDataHarvest:
    dag = dagbag.get_dag("data_harvest_dag")

    @pytest.mark.vcr
    def test_collect_ids_param(self):
        task = self.dag.get_task("collect_ids")
        res = task.execute(
            context={
                "params": {"last_updated_from": "2024-12-15", "last_updated_to": ""}
            }
        )
        assert res == [2693068, 2807749, 2809112]

    @pytest.mark.vcr
    def test_collect_ids_param_with_to_date(self):
        task = self.dag.get_task("collect_ids")

        task.op_kwargs = {
            "params": {
                "last_updated_from": "2025-01-25",
                "last_updated_to": "2025-01-30",
            }
        }
        res = task.execute(context={"ds": ""})
        assert res == [2872501, 2872775]

    @pytest.mark.vcr
    def test_collect_ids_logical_date(self):
        task = self.dag.get_task("collect_ids")

        task.op_kwargs = {
            "params": {
                "last_updated_from": "",
                "last_updated_to": "",
            }
        }
        res = task.execute(context=Context({"ds": "2024-12-17"}))
        assert res == [2693068, 2807749, 2809112]

    @pytest.mark.vcr
    def test_download_record_versions(self):
        id = "1906174"
        task = self.dag.get_task("process_record.download_record_versions")
        task.op_args = (id,)
        res = task.execute(context=Context())
        assert res["base"]["record"]["inspire_id"] == id
        assert res["base"]["record"]["version"] == 3
        assert all(value in res for value in [1, 2])

    def test_build_record(self, datadir):
        payload = {
            "1": orjson.loads((datadir / "ins1906174_version1.json").read_text()),
            "2": orjson.loads((datadir / "ins1906174_version2.json").read_text()),
            "base": orjson.loads((datadir / "ins1906174_version3.json").read_text()),
        }

        task = self.dag.get_task("process_record.build_record")
        task.op_args = ("data_schema", "https://inspirehep.net", payload)
        res = task.execute(context=Context())
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

        result = sorted(res["literature"], key=lambda x: x["doi"]["value"])
        assert result[0]["doi"]["value"] == "10.1103/PhysRevD.104.112010"

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

        assert res["acquisition_source"]["method"] == "inspirehep"
        assert res["acquisition_source"]["source"] == "HEPData"
        assert any(doi["source"] == "HEPData" for doi in res["dois"])

        # check that the record has the correct creation date
        # from last_updated_field of first version
        assert res["creation_date"] == "2021-09-06"

    def test_creation_date_from_last_updated(self, datadir):
        payload = {
            "base": orjson.loads((datadir / "ins1906174_version3.json").read_text())
        }
        task = self.dag.get_task("process_record.build_record")
        task.op_args = ("data_schema", "https://inspirehep.net", payload)
        res = task.execute(context=Context())
        assert res["creation_date"] == "2023-11-13"  # from last_updated_field

    def test_creation_date_fallback(self, datadir):
        payload = {
            "base": orjson.loads((datadir / "ins1906174_version4.json").read_text())
        }
        task = self.dag.get_task("process_record.build_record")
        task.op_args = ("data_schema", "https://inspirehep.net", payload)
        res = task.execute(context=Context())
        assert (
            res["creation_date"] == payload["base"]["record"]["creation_date"]
        )  # from creation_date field

    @pytest.mark.vcr
    def test_load_record_put(self):
        record = {
            "_collections": ["Data"],
            "$schema": "https://inspirehep.net/schemas/records/data.json",
            "dois": [{"value": "10.8756/tTM", "material": "data"}],
            "acquisition_source": {
                "source": "inspirehep",
                "submission_number": "2829504",
                "datetime": "2025-01-09T16:14:51.647320+00:00",
                "method": "inspirehep",
            },
        }
        task = self.dag.get_task("process_record.load_record")
        task.op_args = (record,)
        json_response = task.execute(context=Context())
        assert json_response

    @pytest.mark.vcr
    def test_normalize_collaborations(self):
        # test what is returned if collaborations are initally empty
        record = {
            "collaborations": [{"value": "ETM"}],
            "acquisition_source": {"submission_number": "123"},
        }
        task = self.dag.get_task("process_record.normalize_collaborations")
        json_response = task.python_callable(record=record)

        assert "record" in json_response["collaborations"][0]
        assert (
            json_response["accelerator_experiments"][0]["legacy_name"] == "LATTICE-ETM"
        )

    @pytest.mark.vcr
    def test_load_record_post(self):
        record = {
            "_collections": ["Data"],
            "$schema": "https://inspirehep.net/schemas/records/data.json",
            "dois": [{"value": "10.1234568/test", "material": "data"}],
            "acquisition_source": {
                "source": "inspirehep",
                "submission_number": "2829504",
                "datetime": "2025-01-09T16:14:51.647320+00:00",
                "method": "inspirehep",
            },
        }
        task = self.dag.get_task("process_record.load_record")
        task.op_args = (record,)
        json_response = task.execute(context=Context())
        assert json_response
