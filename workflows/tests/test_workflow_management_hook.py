import contextlib
from unittest.mock import patch

import pytest
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    HEP,
    WorkflowManagementHook,
)
from include.utils.constants import HEP_CREATE, STATUS_ERROR, STATUS_RUNNING
from tenacity import RetryError


@pytest.mark.usefixtures("hep_env")
class TestWorkflowManagementHook:
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    test_workflow_id = "00000000-0000-0000-0000-000000001521"

    def test_collection(self):
        assert self.workflow_management_hook.endpoint == f"api/workflows/{AUTHORS}"

    @pytest.mark.vcr
    def test_get_workflow_url(self):
        with pytest.raises(RetryError) as excinfo:
            self.workflow_management_hook.get_workflow("invalid_workflow_id")
        assert str(excinfo.value.__cause__) == "404:Not Found"

    @pytest.mark.vcr
    def test_set_workflow_status(self):
        with contextlib.suppress(TypeError):
            self.workflow_management_hook.set_workflow_status(
                STATUS_ERROR,
                self.test_workflow_id,
            )

        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["status"]
            == STATUS_ERROR
        )

        with contextlib.suppress(TypeError):
            self.workflow_management_hook.set_workflow_status(
                STATUS_RUNNING, self.test_workflow_id
            )

        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["status"]
            == STATUS_RUNNING
        )

    @pytest.mark.vcr
    def test_update_workflow(self):
        workflow_data = self.workflow_management_hook.get_workflow(
            self.test_workflow_id
        )

        workflow_data["data"]["status"] = "deceased"
        with contextlib.suppress(TypeError):
            self.workflow_management_hook.update_workflow(
                self.test_workflow_id, workflow_data
            )

        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["data"][
                "status"
            ]
            == "deceased"
        )

        workflow_data["data"]["status"] = "departed"
        with contextlib.suppress(TypeError):
            self.workflow_management_hook.update_workflow(
                self.test_workflow_id, workflow_data
            )
        assert (
            self.workflow_management_hook.get_workflow(self.test_workflow_id)["data"][
                "status"
            ]
            == "departed"
        )

    @pytest.mark.vcr
    def test_post_workflow(self):
        workflow_management_hook = WorkflowManagementHook(HEP)
        workflow_data = {
            "workflow_type": HEP_CREATE,
            "data": {
                "document_type": ["article"],
                "_collections": ["Literature"],
                "titles": [{"title": "Test Workflow Management Hook"}],
            },
        }
        response = workflow_management_hook.post_workflow(workflow_data)
        assert response.status_code == 201
        response_data = response.json()
        assert response_data["data"]["document_type"] == ["article"]
        assert response_data["status"] == "processing"

    @pytest.mark.vcr
    def test_filter_workflows(self):
        response = self.workflow_management_hook.filter_workflows({"status": "running"})

        assert response["count"] == 1
        assert response["results"][0]["id"] == self.test_workflow_id

    @patch.object(WorkflowManagementHook, "call_api")
    @patch.object(WorkflowManagementHook, "get_workflow")
    def test_add_decision_skips_if_decision_exists(
        self, mock_get_workflow, mock_call_api
    ):
        workflow_management_hook = WorkflowManagementHook(HEP)
        mock_get_workflow.return_value = {
            "decisions": [{"action": "fuzzy_match", "value": "123"}]
        }

        response = workflow_management_hook.add_decision(
            self.test_workflow_id, {"action": "fuzzy_match", "value": "456"}
        )

        assert response is None
        mock_get_workflow.assert_called_once_with(self.test_workflow_id)
        mock_call_api.assert_not_called()

    @pytest.mark.parametrize(
        "workflow", [{}, {"decisions": [{"action": "auto_reject"}]}]
    )
    @patch.object(WorkflowManagementHook, "call_api")
    @patch.object(WorkflowManagementHook, "get_workflow")
    def test_add_decision_posts_if_decision_missing(
        self, mock_get_workflow, mock_call_api, workflow
    ):
        mock_get_workflow.return_value = workflow

        WorkflowManagementHook(HEP).add_decision(
            self.test_workflow_id, {"action": "fuzzy_match"}
        )

        mock_call_api.assert_called_once()
