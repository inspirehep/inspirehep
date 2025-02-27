from hooks.backoffice.base import BackofficeHook
from requests import Response


class AuthorWorkflowTicketManagementHook(BackofficeHook):
    """
    A hook to update the status of a workflow in the backoffice system.

    :param method: The HTTP method to use for the request (default: "GET").
    :type method: str
    :param http_conn_id: The ID of the HTTP connection to use (
        default: "backoffice_conn").
    :type http_conn_id: str
    """

    def __init__(
        self,
        method: str = "GET",
        http_conn_id: str = "backoffice_conn",
        headers: dict = None,
    ) -> None:
        super().__init__(method, http_conn_id, headers)
        self.endpoint = "api/workflows/authors/tickets/"

    def get_ticket(self, workflow_id: str, ticket_type: str) -> dict:
        endpoint = f"{self.endpoint}{workflow_id}/"
        params = {"ticket_type": ticket_type}
        response = self.call_api(
            method="GET",
            endpoint=endpoint,
            params=params,
        )
        return response.json()

    def create_ticket_entry(
        self, workflow_id: str, ticket_id: str, ticket_type: str
    ) -> Response:
        data = {
            "ticket_type": ticket_type,
            "ticket_id": ticket_id,
            "workflow": workflow_id,
        }
        return self.call_api(
            method="POST",
            data=data,
            endpoint=self.endpoint,
        )
