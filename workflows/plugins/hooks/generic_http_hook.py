import logging

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
        self._method = method
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
        data: dict = None,
        headers: dict = None,
        extra_options: dict = None,
        **request_kwargs,
    ):
        self.method = method or self._method
        headers = headers or self.headers

        return super().run(
            endpoint=endpoint,
            data=data,
            headers=headers,
            extra_options=extra_options,
            **request_kwargs,
        )

    def call_api(
        self,
        endpoint: str,
        method: str = None,
        json: dict = None,
        params: dict = None,
        headers: dict = None,
        extra_options: dict = None,
        **kwargs,
    ) -> Response:
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            endpoint=endpoint,
            headers=headers,
            json=json,
            data=params,
            method=method,
            extra_options=extra_options,
            **kwargs,
        )

    def get_url(self) -> str:
        self.get_conn()
        return self.base_url
