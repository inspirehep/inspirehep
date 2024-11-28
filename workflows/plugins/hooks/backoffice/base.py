from airflow.models import Variable
from hooks.generic_http_hook import GenericHttpHook


class BackofficeHook(GenericHttpHook):
    """
    A hook to update the status of a workflow in the backoffice system.

    :param method: The HTTP method to use for the request (default: "GET").
    :type method: str
    :param http_conn_id: The ID of the HTTP connection to use
        (default: "backoffice_conn").
    :type http_conn_id: str
    """

    def __init__(
        self,
        method: str = "GET",
        http_conn_id: str = "backoffice_conn",
        headers: dict = None,
    ) -> None:
        super().__init__(method=method, http_conn_id=http_conn_id)
        self.headers = headers or {
            "Authorization": f'Token {Variable.get("backoffice_token")}',
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
