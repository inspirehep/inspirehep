import logging

import requests
from airflow.providers.http.hooks.http import HttpHook
from hooks.tenacity_config import tenacity_retry_kwargs
from requests import Response

logger = logging.getLogger()


class GenericHttpHook(HttpHook):
    """
    Hook to interact with Inspire API
    It overrides the original `run` method in HttpHook so that
    we can pass data argument as data, not params
    """

    def __init__(self, http_conn_id, method="GET", headers=None):
        self._headers = headers
        super().__init__(method=method, http_conn_id=http_conn_id)

    @property
    def tenacity_retry_kwargs(self) -> dict:
        return tenacity_retry_kwargs()

    @property
    def headers(self) -> dict:
        return self._headers

    @headers.setter
    def headers(self, headers):
        self._headers = headers

    def run(
        self,
        endpoint: str,
        method: str = None,
        json: dict = None,
        data: dict = None,
        params: dict = None,
        headers: dict = None,
        extra_options: dict = None,
    ):
        extra_options = extra_options or {}
        method = method or self.method
        headers = headers or self.headers
        session = self.get_conn(headers)

        if not self.base_url.endswith("/") and not endpoint.startswith("/"):
            url = self.base_url + "/" + endpoint
        else:
            url = self.base_url + endpoint

        req = requests.Request(
            method, url, json=json, data=data, params=params, headers=headers
        )

        prepped_request = session.prepare_request(req)
        self.log.info("Sending '%s' to url: %s", method, url)
        return self.run_and_check(session, prepped_request, extra_options)

    def call_api(
        self,
        endpoint: str,
        method: str = None,
        data: dict = None,
        params: dict = None,
        headers: dict = None,
    ) -> Response:
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            endpoint=endpoint,
            headers=headers,
            json=data,
            params=params,
            method=method,
        )

    def get_url(self) -> str:
        self.get_conn()
        return self.base_url
