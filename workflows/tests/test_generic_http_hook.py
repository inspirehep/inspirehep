import json
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import pytest
from airflow.sdk.exceptions import AirflowException
from hooks.generic_http_hook import (
    GenericHttpHook,
)
from requests import Response


@pytest.mark.usefixtures("hep_env")
class TestGenericHttpHook:
    generic_http_hook = GenericHttpHook(http_conn_id="cds_connection")

    def test_check_response_keeps_error_response(self):
        response = Response()
        response.status_code = 404
        response.reason = "Not Found"
        response._content = b"<html>Not found</html>"

        with pytest.raises(AirflowException):
            self.generic_http_hook.check_response(response)

        assert self.generic_http_hook.last_response is response

    @patch("hooks.generic_http_hook.HttpHook.run_and_check")
    def test_call_api_with_params(self, mock_run_and_check):
        mock_run_and_check.return_value = "response"

        params = {"since": "2023-01-01"}

        self.generic_http_hook.call_api(
            endpoint="/api/inspire2cdsids", method="GET", params=params
        )

        request = mock_run_and_check.call_args.args[1]

        parsed_url = urlparse(request.url)
        query_params = parse_qs(parsed_url.query)
        assert query_params["since"][0] == params["since"]

    @patch("hooks.generic_http_hook.HttpHook.run_and_check")
    def test_call_api_with_json(self, mock_run_and_check):
        mock_run_and_check.return_value = "response"

        params = {"since": "2023-01-01"}

        self.generic_http_hook.call_api(
            endpoint="/api/inspire2cdsids", method="GET", json=params
        )

        request = mock_run_and_check.call_args.args[1]

        assert json.loads(request.body) == params
