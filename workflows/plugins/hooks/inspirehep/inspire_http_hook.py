import logging

import requests
from airflow.models import Variable
from airflow.providers.http.hooks.http import HttpHook
from hooks.tenacity_config import tenacity_retry_kwargs
from requests import Response

logger = logging.getLogger()


class InspireHttpHook(HttpHook):
    """
    Hook to interact with Inspire API
    It overrides the original `run` method in HttpHook so that
    we can pass data argument as data, not params
    """

    def __init__(self, method="GET", http_conn_id="inspire_connection"):
        super().__init__(method=method, http_conn_id=http_conn_id)

    @property
    def tenacity_retry_kwargs(self) -> dict:
        return tenacity_retry_kwargs()

    @property
    def headers(self) -> dict:
        return {
            "Authorization": f'Bearer {Variable.get("inspire_token")}',
            "Accept": "application/vnd+inspire.record.raw+json",
        }

    def run(
        self,
        endpoint: str,
        method: str = None,
        json: dict = None,
        data: dict = None,
        headers: dict = None,
        extra_options: dict = None,
    ):
        extra_options = extra_options or {}
        method = method or self.method
        session = self.get_conn(headers)

        if not self.base_url.endswith("/") and not endpoint.startswith("/"):
            url = self.base_url + "/" + endpoint
        else:
            url = self.base_url + endpoint

        req = requests.Request(method, url, json=json, data=data, headers=headers)

        prepped_request = session.prepare_request(req)
        self.log.info("Sending '%s' to url: %s", method, url)
        return self.run_and_check(session, prepped_request, extra_options)

    def call_api(self, method: str, endpoint: str, data: dict) -> Response:
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            endpoint=endpoint,
            headers=self.headers,
            data=data,
            method=method,
        )
