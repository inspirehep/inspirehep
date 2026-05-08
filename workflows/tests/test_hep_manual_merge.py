from unittest.mock import Mock, call, patch
from urllib.parse import urlparse

import pytest
from airflow.models import DagBag
from airflow.sdk.exceptions import AirflowException
from include.utils.constants import STATUS_COMPLETED

from tests.test_utils import task_test

dagbag = DagBag()


def fake_record(title, rec_id):
    return {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": title}],
        "_collections": ["Literature"],
        "document_type": ["article"],
        "acquisition_source": {"source": "arxiv"},
        "arxiv_eprints": [{"value": "1701.01431", "categories": ["cs"]}],
        "control_number": rec_id,
    }


@pytest.mark.usefixtures("hep_env")
class TestHEPManualMergeDAG:
    dag = dagbag.get_dag("hep_manual_merge_dag")
    context = {
        "dag_run": {"run_id": "test_run"},
        "ti": Mock(xcom_push=Mock(), xcom_pull=None),
        "params": {
            "workflow_id": "00000000-0000-0000-0000-000000001112",
            "head_control_number": 10000,
            "update_control_number": 44707,
        },
    }

    workflow_id = context["params"]["workflow_id"]

    @pytest.mark.vcr
    def test_get_records(self):
        task_test(self.dag, "get_records", self.context)
        assert self.s3_store.read_workflow(
            self.workflow_id, filename="head_record.json"
        )["id"] == str(self.context["params"]["head_control_number"])
        assert self.s3_store.read_workflow(
            self.workflow_id, filename="update_record.json"
        )["id"] == str(self.context["params"]["update_control_number"])

    @patch(
        "literature.hep_manual_merge.WorkflowManagementHook.partial_update_workflow",
    )
    def test_merge_records(self, mock_partial_update_workflow):
        self.s3_store.write_workflow({"id": self.workflow_id, "data": {}})
        head_record = {
            "metadata": fake_record("Head title", 10000),
            "uuid": "head-uuid",
            "revision_id": 4,
        }
        self.s3_store.write_object(
            head_record,
            key=f"{self.workflow_id}/head_record.json",
        )

        update_record = {
            "metadata": fake_record("Update title", 44707),
            "uuid": "update-uuid",
            "revision_id": 5,
        }
        self.s3_store.write_object(
            update_record,
            key=f"{self.workflow_id}/update_record.json",
        )

        task_test(self.dag, "merge_records", self.context)

        workflow_result = self.s3_store.read_workflow(self.workflow_id)
        assert "conflicts" not in workflow_result["merge_details"]

        assert workflow_result["data"]["control_number"] == 10000
        assert (
            urlparse(workflow_result["data"]["deleted_records"][0]["$ref"]).path
            == urlparse("https://inspirehep.net/api/literature/44707").path
        )
        assert workflow_result["merge_details"]["head_uuid"] == "head-uuid"
        assert workflow_result["merge_details"]["update_uuid"] == "update-uuid"
        assert workflow_result["merge_details"]["head_version_id"] == 5
        mock_partial_update_workflow.assert_called_once()

    @patch("literature.hep_manual_merge.WorkflowManagementHook.set_workflow_status")
    @patch("literature.hep_manual_merge.WorkflowManagementHook.get_workflow")
    def test_await_merge_conflicts_resolved_waits_for_decision(
        self,
        mock_get_workflow,
        mock_set_workflow_status,
    ):
        mock_get_workflow.return_value = {
            "merge_details": {"conflicts": [{"path": "/authors/0"}]},
            "decisions": [],
        }

        result = task_test(self.dag, "await_merge_conflicts_resolved", self.context)

        assert result is False
        mock_set_workflow_status.assert_called_once()

    @patch("literature.hep_manual_merge.workflows.delete_wf_record_source")
    @patch("literature.hep_manual_merge.workflows.add_wf_record_source")
    @patch("literature.hep_manual_merge.workflows.get_all_wf_record_sources")
    def test_save_roots(
        self,
        mock_get_all_wf_record_sources,
        mock_add_wf_record_source,
        mock_delete_wf_record_source,
    ):
        self.s3_store.write_workflow(
            {
                "id": self.workflow_id,
                "merge_details": {
                    "head_uuid": "head-uuid",
                    "update_uuid": "update-uuid",
                },
            }
        )

        mock_get_all_wf_record_sources.side_effect = [
            [
                {
                    "source": "legacy",
                    "updated": "2024-01-01T00:00:00",
                    "json": {"version": "head"},
                },
                {
                    "source": "keep-newer-head",
                    "updated": "2024-03-01T00:00:00",
                    "json": {"version": "head-newer"},
                },
            ],
            [
                {
                    "source": "legacy",
                    "updated": "2024-02-01T00:00:00",
                    "json": {"version": "update-newer"},
                },
                {
                    "source": "new-source",
                    "updated": "2024-02-15T00:00:00",
                    "json": {"version": "new"},
                },
                {
                    "source": "keep-newer-head",
                    "updated": "2024-02-01T00:00:00",
                    "json": {"version": "update-older"},
                },
            ],
        ]

        task_test(self.dag, "save_roots", self.context)

        mock_add_wf_record_source.assert_has_calls(
            [
                call(
                    record_uuid="head-uuid",
                    source="legacy",
                    json={"version": "update-newer"},
                ),
                call(
                    record_uuid="head-uuid",
                    source="new-source",
                    json={"version": "new"},
                ),
            ],
            any_order=True,
        )
        assert mock_add_wf_record_source.call_count == 2
        mock_delete_wf_record_source.assert_has_calls(
            [
                call(record_uuid="update-uuid", source="legacy"),
                call(record_uuid="update-uuid", source="new-source"),
                call(record_uuid="update-uuid", source="keep-newer-head"),
            ],
            any_order=True,
        )
        assert mock_delete_wf_record_source.call_count == 3

    @patch("literature.hep_manual_merge.workflows.store_record_inspirehep_api")
    def test_store_record(self, mock_store_record_inspirehep_api):
        original_workflow = {
            "id": self.workflow_id,
            "data": {"titles": [{"title": "Merged title"}]},
        }
        updated_workflow = {
            **original_workflow,
            "data": {
                **original_workflow["data"],
                "control_number": 10000,
            },
        }
        self.s3_store.write_workflow(original_workflow)
        mock_store_record_inspirehep_api.return_value = updated_workflow

        task_test(self.dag, "store_record", self.context)

        mock_store_record_inspirehep_api.assert_called_once_with(
            original_workflow, True
        )
        assert self.s3_store.read_workflow(self.workflow_id) == updated_workflow

    @patch("literature.hep_manual_merge.WorkflowManagementHook.update_workflow")
    def test_save_and_complete_workflow(self, mock_update_workflow):
        workflow_data = {
            "id": self.workflow_id,
            "data": {"titles": [{"title": "Merged title"}]},
            "status": "running",
        }
        self.s3_store.write_workflow(workflow_data)

        task_test(self.dag, "save_and_complete_workflow", self.context)

        mock_update_workflow.assert_called_once_with(
            self.workflow_id,
            {
                **workflow_data,
                "status": STATUS_COMPLETED,
            },
        )

    @patch(
        "literature.hep_manual_merge.WorkflowManagementHook.partial_update_workflow",
    )
    def test_merge_records_with_conflicts(self, mock_partial_update_workflow):
        head_record = {
            "metadata": fake_record("Head title", 10000),
            "uuid": "head-uuid",
            "revision_id": 4,
        }
        update_record = {
            "metadata": fake_record("Update title", 44707),
            "uuid": "update-uuid",
            "revision_id": 5,
        }

        head_record["metadata"]["core"] = True
        update_record["metadata"]["core"] = False
        self.s3_store.write_object(
            update_record, key=f"{self.workflow_id}/update_record.json"
        )
        self.s3_store.write_object(
            head_record, key=f"{self.workflow_id}/head_record.json"
        )

        task_test(self.dag, "merge_records", self.context)

        workflow_data = self.s3_store.read_workflow(self.workflow_id)

        assert "conflicts" in workflow_data["merge_details"]
        assert workflow_data["merge_details"]["conflicts"] == [
            {"path": "/core", "op": "replace", "value": False, "$type": "SET_FIELD"}
        ]

    @pytest.mark.vcr
    def test_get_records_none_record(self):
        json_head = fake_record("This is the HEAD", 1)
        self.s3_store.write_object(
            json_head, key=f"{self.workflow_id}/head_record.json"
        )

        with pytest.raises(AirflowException):
            task_test(
                self.dag,
                "get_records",
                self.context,
                context_params={"update_control_number": -1},
            )
