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

    @pytest.mark.vcr(match_on=["method", "path", "query", "body"])
    def test_get_cds_records_for_range_vcr(self):
        task = self.dag.get_task("get_cds_records_for_range")
        time_range_dict = {
            "since": "2025-08-25T13:00:00",
            "until": "2025-08-25T13:10:00",
        }
        result = task.python_callable(time_range_dict)
        assert isinstance(result, list)
        assert len(result) > 0

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

    def test_build_record_batch(self, datadir):
        batch_records = []
        for i in range(3):
            payload = {
                "cds_id": f"888888{i}",
                "original_record": orjson.loads(
                    (datadir / "record_1675001.json").read_text()
                ),
            }
            batch_records.append(payload)

        task = self.dag.get_task("process_cds_rdm_batch.build_record")
        task.op_args = (batch_records,)
        res = task.execute(context=Context())

        assert isinstance(res, list)
        assert len(res) == 3

        for i, built_record in enumerate(res):
            assert built_record["revision"] == 0
            assert built_record["cds_id"] == f"888888{i}"
            assert (
                built_record["updated_record"]["external_system_identifiers"][0][
                    "schema"
                ]
                == "CDSRDM"
            )
            assert (
                built_record["updated_record"]["external_system_identifiers"][0][
                    "value"
                ]
                == f"888888{i}"
            )

    def test_build_record(self, datadir):
        payload = {
            "cds_id": "8888888",
        }
        payload["original_record"] = orjson.loads(
            (datadir / "record_1675001.json").read_text()
        )
        batch_records = [payload]
        task = self.dag.get_task("process_cds_rdm_batch.build_record")
        task.op_args = (batch_records,)
        res = task.execute(context=Context())

        assert isinstance(res, list)
        assert len(res) == 1

        built_record = res[0]
        assert built_record["revision"] == 0
        assert (
            built_record["updated_record"]["external_system_identifiers"][0]["schema"]
            == "CDSRDM"
        )
        assert (
            built_record["updated_record"]["external_system_identifiers"][0]["value"]
            == "8888888"
        )

    @pytest.mark.vcr
    def test_update_record(self, datadir):
        """Test updating a single record (for backward compatibility)"""
        payload = {
            "revision": 0,
            "cds_id": "8888888",
        }
        payload["updated_record"] = orjson.loads(
            (datadir / "updated_record_1675001.json").read_text()
        )

        built_records = [payload]
        task = self.dag.get_task("process_cds_rdm_batch.update_inspire_record")
        task.op_args = (built_records,)
        res = task.execute(context=Context())

        assert isinstance(res, list)
        assert len(res) == 1

        updated_record = res[0]
        ext_ids = updated_record["metadata"]["external_system_identifiers"]
        assert ext_ids[0]["schema"] == "CDSRDM"
        assert ext_ids[0]["value"] == "8888888"

    @pytest.mark.vcr
    def test_determine_time_ranges_single_range(self):
        time_ranges_task = self.dag.get_task("determine_time_ranges")
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
        time_ranges_task = self.dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "2025-03-01T00:00:00",
                "until": "2025-06-01T00:00:00",
                "max_results": 100,
                "min_minutes": 5,
                "max_tasks": 25,
            },
        }
        time_ranges = time_ranges_task.python_callable(**context)
        assert isinstance(time_ranges, list)
        assert len(time_ranges) > 1
        assert time_ranges[0]["since"] == "2025-03-01T00:00:00"
        assert time_ranges[-1]["until"] == "2025-06-01T00:00:00"

    @pytest.mark.vcr
    def test_dag_empty_time_range(self):
        time_ranges_task = self.dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "1990-08-01T00:00:00",
                "until": "1990-08-01T00:00:01",
                "max_results": 10000,
                "min_minutes": 5,
                "max_tasks": 25,
            },
        }
        time_ranges = time_ranges_task.python_callable(**context)

        assert len(time_ranges) == 0

    @pytest.mark.vcr
    def test_dag_max_tasks_exceeded(self):
        time_ranges_task = self.dag.get_task("determine_time_ranges")
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
        time_ranges_task = self.dag.get_task("determine_time_ranges")
        context = {"ds": "2025-07-02", "params": {}}
        time_ranges = time_ranges_task.python_callable(**context)
        assert isinstance(time_ranges, list)
        assert len(time_ranges) == 1
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

    def test_create_batches_basic(self):
        create_batches_task = self.dag.get_task("create_batches")
        records = [{"cds_id": f"test_{i}"} for i in range(10)]
        context = {
            "params": {
                "batch_size": 3,
                "max_tasks": 10,
            }
        }
        result = create_batches_task.python_callable(records, **context)

        assert len(result) == 4
        assert len(result[0]) == 3
        assert len(result[1]) == 3
        assert len(result[2]) == 3
        assert len(result[3]) == 1
        flattened = [record for batch in result for record in batch]
        assert len(flattened) == 10
        assert flattened[0]["cds_id"] == "test_0"
        assert flattened[-1]["cds_id"] == "test_9"

    def test_create_batches_empty_records(self):
        create_batches_task = self.dag.get_task("create_batches")
        context = {
            "params": {
                "batch_size": 5,
                "max_tasks": 10,
            }
        }

        result = create_batches_task.python_callable([], **context)
        assert result == []

    def test_create_batches_default_params(self):
        create_batches_task = self.dag.get_task("create_batches")
        records = [{"cds_id": f"test_{i}"} for i in range(150)]
        context = {"params": {}}
        result = create_batches_task.python_callable(records, **context)
        assert len(result) == 2
        assert len(result[0]) == 75
        assert len(result[1]) == 75

    def test_create_batches_max_tasks_exceeded(self):
        create_batches_task = self.dag.get_task("create_batches")
        records = [{"cds_id": f"test_{i}"} for i in range(100)]
        context = {
            "params": {
                "batch_size": 1,
                "max_tasks": 10,
            }
        }

        with pytest.raises(ValueError, match="Too many batches generated"):
            create_batches_task.python_callable(records, **context)

    def test_create_batches_exact_batch_size(self):
        create_batches_task = self.dag.get_task("create_batches")
        records = [{"cds_id": f"test_{i}"} for i in range(15)]

        context = {
            "params": {
                "batch_size": 5,
                "max_tasks": 10,
            }
        }
        result = create_batches_task.python_callable(records, **context)
        assert len(result) == 3
        for batch in result:
            assert len(batch) == 5

    def test_batch_workflow_integration(self):
        harvest_results = [
            [{"cds_id": "1", "data": "test1"}],
            [{"cds_id": "2", "data": "test2"}, {"cds_id": "3", "data": "test3"}],
            [{"cds_id": "4", "data": "test4"}],
        ]

        flatten_task = self.dag.get_task("flatten_results")
        flattened_records = flatten_task.python_callable(harvest_results)
        assert len(flattened_records) == 4

        create_batches_task = self.dag.get_task("create_batches")
        context = {
            "params": {
                "batch_size": 2,
                "max_tasks": 10,
            }
        }
        batches = create_batches_task.python_callable(flattened_records, **context)

        assert len(batches) == 2
        assert len(batches[0]) == 2
        assert len(batches[1]) == 2

        assert batches[0][0]["cds_id"] == "1"
        assert batches[0][1]["cds_id"] == "2"
        assert batches[1][0]["cds_id"] == "3"
        assert batches[1][1]["cds_id"] == "4"

    def test_dag_with_batch_parameters(self):
        """Test that the DAG accepts and uses the new batch parameters"""
        time_ranges_task = self.dag.get_task("determine_time_ranges")
        context = {
            "ds": "2025-07-01",
            "params": {
                "since": "2025-06-01T00:00:00",
                "until": "2025-07-01T00:00:00",
                "max_results": 1000,
                "min_minutes": 5,
                "max_tasks": 50,
                "batch_size": 25,
            },
        }
        time_ranges = time_ranges_task.python_callable(**context)
        assert isinstance(time_ranges, list)
        create_batches_task = self.dag.get_task("create_batches")
        test_records = [{"cds_id": f"test_{i}"} for i in range(75)]
        batches = create_batches_task.python_callable(test_records, **context)
        assert len(batches) == 3
        assert len(batches[0]) == 25
        assert len(batches[1]) == 25
        assert len(batches[2]) == 25
