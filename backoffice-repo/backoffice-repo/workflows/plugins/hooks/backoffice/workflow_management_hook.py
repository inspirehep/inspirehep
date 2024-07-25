from hooks.backoffice.base import BackofficeHook
from requests import Response


class WorkflowManagementHook(BackofficeHook):
    """
    A hook to update the status of a workflow in the backoffice system.

    :param method: The HTTP method to use for the request (default: "GET").
    :type method: str
    :param http_conn_id: The ID of the HTTP connection to use
        (default: "backoffice_conn").
    :type http_conn_id: str
    """

    def set_workflow_status(self, status_name: str, workflow_id: str) -> Response:
        """
        Updates the status of a workflow in the backoffice system.

        :param status_name: The new status of the workflow.
        :type status: str
        :param workflow_id: The ID of the workflow to update.
        :type workflow_id: str
        """
        request_data = {
            "status": status_name,
        }
        return self.partial_update_workflow(
            workflow_partial_update_data=request_data, workflow_id=workflow_id
        )

    def get_workflow(self, workflow_id: str) -> dict:
        endpoint = f"api/workflows/{workflow_id}"
        response = self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs, method="GET", endpoint=endpoint
        )
        response = self.run(endpoint=endpoint, headers=self.headers)
        return response.json()

    def update_workflow(self, workflow_id: str, workflow_data: dict) -> Response:
        endpoint = f"api/workflows/{workflow_id}/"
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            method="PUT",
            data=workflow_data,
            endpoint=endpoint,
        )

    def partial_update_workflow(
        self, workflow_id: str, workflow_partial_update_data: dict
    ) -> Response:
        endpoint = f"api/workflow-update/{workflow_id}/"
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            method="PATCH",
            data=workflow_partial_update_data,
            endpoint=endpoint,
        )
