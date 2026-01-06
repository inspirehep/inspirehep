import contextlib

import pytest
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    HEP,
    WorkflowManagementHook,
)
from tenacity import RetryError

from tests.test_utils import function_test, get_aut_workflow_task


class TestWorkflowManagementHook:
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    test_workflow_id = "00000000-0000-0000-0000-000000001521"

    def test_collection(self):
        assert self.workflow_management_hook.endpoint == f"api/workflows/{AUTHORS}"

    @pytest.mark.vcr
    def test_get_workflow_url(self):
        with pytest.raises(RetryError) as excinfo:
            function_test(
                self.workflow_management_hook.get_workflow,
                params={"workflow_id": "invalid_workflow_id"},
            )
        assert str(excinfo.value.__cause__) == "404:Not Found"

    @pytest.mark.vcr
    def test_set_workflow_status(self):
        with contextlib.suppress(TypeError):
            function_test(
                self.workflow_management_hook.set_workflow_status,
                params={
                    "status_name": "error",
                    "workflow_id": self.test_workflow_id,
                },
            )

        assert get_aut_workflow_task(self.test_workflow_id)["status"] == "error"

        with contextlib.suppress(TypeError):
            function_test(
                self.workflow_management_hook.set_workflow_status,
                params={
                    "status_name": "running",
                    "workflow_id": self.test_workflow_id,
                },
            )

        assert get_aut_workflow_task(self.test_workflow_id)["status"] == "running"

    @pytest.mark.vcr
    def test_update_workflow(self):
        workflow_data = get_aut_workflow_task(self.test_workflow_id)

        workflow_data["data"]["status"] = "deceased"
        with contextlib.suppress(TypeError):
            function_test(
                self.workflow_management_hook.update_workflow,
                params={
                    "workflow_id": self.test_workflow_id,
                    "workflow_data": workflow_data,
                },
            )

        assert (
            get_aut_workflow_task(self.test_workflow_id)["data"]["status"] == "deceased"
        )

        workflow_data["data"]["status"] = "departed"
        with contextlib.suppress(TypeError):
            function_test(
                self.workflow_management_hook.update_workflow,
                params={
                    "workflow_id": self.test_workflow_id,
                    "workflow_data": workflow_data,
                },
            )
        assert (
            get_aut_workflow_task(self.test_workflow_id)["data"]["status"] == "departed"
        )

    @pytest.mark.vcr
    def test_post_workflow(self):
        def _test_post_workflow():
            workflow_management_hook = WorkflowManagementHook(HEP)
            workflow_data = {
                "workflow_type": "HEP_CREATE",
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

        function_test(_test_post_workflow)

    @pytest.mark.vcr
    def test_filter_workflows(self):
        def _test_filter_workflows():
            response = self.workflow_management_hook.filter_workflows(
                {"status": "running"}
            )

            assert response["count"] == 1
            assert response["results"][0]["id"] == self.test_workflow_id

        function_test(_test_filter_workflows)
