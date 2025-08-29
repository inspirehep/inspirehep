from unittest.mock import MagicMock, patch

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


@freeze_time("2024-12-11")
class TestCDSRDMHarvest:
    def setup_method(self, method):
        self.dagbag = DagBag()
        self.dag = self.dagbag.get_dag("cds_rdm_harvest_dag")

    @pytest.mark.vcr
    @patch("airflow.providers.http.hooks.http.HttpHook.run")
    @patch("dags.cds.cds_rdm_harvest.retrieve_and_validate_record")
    def test_get_cds_records_for_range_vcr(self, mock_retrieve, mock_http_run):
        mock_retrieve.return_value = None

        mock_cds_response = MagicMock()
        mock_cds_response.json.return_value = {
            "hits": {
                "hits": [],
                "total": 0,
            },
            "links": {},
        }
        mock_cds_response.request.url = "http://test-cds.com/api/records"
        mock_http_run.return_value = mock_cds_response

        task = self.dag.get_task("get_cds_records_for_range")
        time_range_dict = {
            "since": "2025-06-01T00:00:00",
            "until": "2025-07-01T00:00:00",
        }
        result = task.python_callable(time_range_dict)
        assert isinstance(result, list)
        assert len(result) == 0

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

    @pytest.mark.vcr
    def test_determine_time_ranges_single_range(self, monkeypatch):
        def mock_total_count(since, until):
            return 5

        monkeypatch.setattr(
            "dags.cds.cds_rdm_harvest._get_total_count", mock_total_count
        )
        dagbag = DagBag()
        dag = dagbag.get_dag("cds_rdm_harvest_dag")
        time_ranges_task = dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "2025-06-01T00:00:00",
                "until": "2025-07-01T00:00:00",
                "max_results": 10000,
                "min_minutes": 5,
                "max_tasks": 25,
            },
        }
        time_ranges = time_ranges_task.python_callable(**context)
        assert len(time_ranges) == 1
        assert time_ranges[0]["since"] == "2025-06-01T00:00:00"
        assert time_ranges[0]["until"] == "2025-07-01T00:00:00"

    @pytest.mark.vcr
    def test_determine_time_ranges_multiple_ranges(self):
        import dags.cds.cds_rdm_harvest

        call_counts = [15000, 5000, 5000]

        def mock_total_count(since, until):
            return call_counts.pop(0) if call_counts else 5000

        dags.cds.cds_rdm_harvest._get_total_count = mock_total_count
        dagbag = DagBag()
        dag = dagbag.get_dag("cds_rdm_harvest_dag")
        time_ranges_task = dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "2025-01-01T00:00:00",
                "until": "2025-07-01T00:00:00",
                "max_results": 10000,
                "min_minutes": 5,
                "max_tasks": 25,
            },
        }
        print("Test context:", context)
        time_ranges = time_ranges_task.python_callable(**context)
        print("Returned time_ranges:", time_ranges)
        assert isinstance(time_ranges, list)
        assert len(time_ranges) == 1
        assert time_ranges[0]["since"] == "2025-01-01T00:00:00"
        assert time_ranges[0]["until"] == "2025-07-01T00:00:00"

    @pytest.mark.vcr
    def test_dag_empty_time_range(self, monkeypatch):
        def mock_total_count(since, until):
            return 0

        monkeypatch.setattr(
            "dags.cds.cds_rdm_harvest._get_total_count", mock_total_count
        )
        dagbag = DagBag()
        dag = dagbag.get_dag("cds_rdm_harvest_dag")
        time_ranges_task = dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "1990-08-01T00:00:00",
                "until": "1990-08-02T00:00:00",
                "max_results": 10000,
                "min_minutes": 5,
                "max_tasks": 25,
            },
        }
        time_ranges = time_ranges_task.python_callable(**context)

        assert len(time_ranges) == 0

    @pytest.mark.vcr
    def test_dag_max_tasks_exceeded(self, monkeypatch):
        def mock_total_count(since, until):
            return 50000

        monkeypatch.setattr(
            "dags.cds.cds_rdm_harvest._get_total_count", mock_total_count
        )
        dagbag = DagBag()
        dag = dagbag.get_dag("cds_rdm_harvest_dag")
        time_ranges_task = dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "2025-01-01T00:00:00",
                "until": "2025-07-01T00:00:00",
                "max_results": 100,
                "min_minutes": 1,
                "max_tasks": 5,
            },
        }
        with pytest.raises(ValueError, match="Too many time ranges generated"):
            time_ranges_task.python_callable(**context)

    @pytest.mark.vcr
    def test_dag_default_parameters(self):
        import dags.cds.cds_rdm_harvest

        dags.cds.cds_rdm_harvest._get_total_count = lambda since, until: 100
        dagbag = DagBag()
        dag = dagbag.get_dag("cds_rdm_harvest_dag")
        time_ranges_task = dag.get_task("determine_time_ranges")
        context = {"ds": "2025-07-02", "params": {}}
        time_ranges = time_ranges_task.python_callable(**context)
        print("default time_ranges:", time_ranges)
        assert isinstance(time_ranges, list)
        assert len(time_ranges) >= 1
        assert isinstance(time_ranges[0], dict)
        assert "since" in time_ranges[0]
        assert "until" in time_ranges[0]

    def test_flatten_results_task(self):
        flatten_task = self.dag.get_task("flatten_results")

        test_data = [
            [{"cds_id": "1", "data": "test1"}],
            [{"cds_id": "2", "data": "test2"}],
            [],
        ]

        result = flatten_task.python_callable(test_data)

        assert len(result) == 2
        assert result[0]["cds_id"] == "1"
        assert result[1]["cds_id"] == "2"

        mixed_data = [
            [{"cds_id": "3", "data": "test3"}],
            {"cds_id": "4", "data": "test4"},
            None,
        ]

        result2 = flatten_task.python_callable(mixed_data)
        assert len(result2) == 2
        assert result2[0]["cds_id"] == "3"
        assert result2[1]["cds_id"] == "4"

    @pytest.mark.vcr
    def test_dag_structure_and_dependencies(self):
        assert self.dag is not None
        assert self.dag.dag_id == "cds_rdm_harvest_dag"
        assert not self.dag.catchup
        assert "cds_rdm" in self.dag.tags

        expected_tasks = [
            "determine_time_ranges",
            "get_cds_records_for_range",
            "flatten_results",
            "process_cds_rdm_response.build_record",
            "process_cds_rdm_response.update_inspire_record",
        ]

        for task_id in expected_tasks:
            assert self.dag.has_task(task_id), f"Task {task_id} not found in DAG"

        time_ranges_task = self.dag.get_task("determine_time_ranges")
        flatten_task = self.dag.get_task("flatten_results")

        assert len(time_ranges_task.downstream_task_ids) > 0
        assert len(flatten_task.upstream_task_ids) > 0

        assert self.dag.on_failure_callback is not None
