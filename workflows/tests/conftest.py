import sys
from pathlib import Path

import pytest
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)

from tests.test_utils import function_test

dags_path = Path(__file__).resolve().parents[1] / "dags"
sys.path.insert(0, str(dags_path))

plugins_path = Path(__file__).resolve().parents[1] / "plugins"
sys.path.insert(0, str(plugins_path))


@pytest.fixture(scope="session")
def vcr_config():
    return {
        "ignore_localhost": True,
        "decode_compressed_response": True,
        "filter_headers": ("Authorization", "User-Agent"),
        "record_mode": "once",
        "match_on": ["method", "scheme", "host", "port", "path", "query", "body"],
        "ignore_hosts": ("s3", "in-process.invalid."),
    }


@pytest.fixture(scope="class")
def _s3_hook(request):
    def _setup():
        request.cls.s3_hook = S3Hook(aws_conn_id="s3_conn")
        request.cls.bucket_name = request.cls.s3_hook.service_config.get("bucket_name")

    function_test(_setup)


@pytest.fixture(scope="class")
def _inspire_http_record_management_hook(
    request,
):
    def _setup():
        request.cls.inspire_http_record_management_hook = (
            InspireHTTPRecordManagementHook()
        )

    function_test(_setup)
