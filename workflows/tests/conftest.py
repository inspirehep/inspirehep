import sys
from pathlib import Path

import pytest

from tests.test_utils import function_test

dags_path = Path(__file__).resolve().parents[1] / "dags"
sys.path.insert(0, str(dags_path))

plugins_path = Path(__file__).resolve().parents[1] / "plugins"
sys.path.insert(0, str(plugins_path))

from hooks.inspirehep.inspire_http_record_management_hook import (  # noqa: E402
    InspireHTTPRecordManagementHook,
)
from include.utils.s3 import S3JsonStore  # noqa: E402


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
def _s3_store(request):
    def _setup():
        request.cls.s3_store = S3JsonStore(aws_conn_id="s3_conn")
        request.cls.s3_store.initialize()

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
