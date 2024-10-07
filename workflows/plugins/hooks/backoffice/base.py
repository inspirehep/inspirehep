import requests
from airflow.models import Variable
from airflow.providers.http.hooks.http import HttpHook
from hooks.tenacity_config import tenacity_retry_kwargs
from requests import Response


class BackofficeHook(HttpHook):
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

    @property
    def tenacity_retry_kwargs(self) -> dict:
        return tenacity_retry_kwargs()

    def run(
        self,
        endpoint: str,
        method: str = None,
        data: dict = None,
        headers: dict = None,
        params: dict = None,
        extra_options: dict = None,
    ) -> Response:
        extra_options = extra_options or {}
        headers = headers or self.headers
        method = method or self.method

        session = self.get_conn(headers)

        if not self.base_url.endswith("/") and not endpoint.startswith("/"):
            url = self.base_url + "/" + endpoint
        else:
            url = self.base_url + endpoint

        req = requests.Request(method, url, json=data, headers=headers, params=params)

        prepped_request = session.prepare_request(req)
        self.log.info("Sending '%s' to url: %s", method, url)
        return self.run_and_check(session, prepped_request, extra_options)
