import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from airflow.sdk import Variable

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
        request.cls.s3_store = S3JsonStore(
            aws_conn_id=getattr(request, "param", "s3_conn")
        )
        request.cls.s3_store.initialize()

    function_test(_setup)


@pytest.fixture(scope="class")
def s3_desy_env(request):
    test_dict = {
        "AIRFLOW_CONN_S3_ELSEVIER_CONN": "aws://airflow:airflow-inspire@/?endpoint_url=http%3A%2F%2Fs3%3A9000",
        "AIRFLOW_VAR_S3_DESY_INPUT_BUCKET_NAME": "test-desy-incoming",
        "AIRFLOW_VAR_S3_DESY_OUTPUT_BUCKET_NAME": "test-desy-processed",
    }

    override_dict = {
        key: os.environ.get(key, value)
        for key, value in test_dict.items()
        if key not in os.environ
    }

    with patch.dict(
        os.environ,
        override_dict,
    ):
        desy_input_bucket = Variable.get("s3_desy_input_bucket_name")
        request.cls.input_bucket = desy_input_bucket
        request.cls.output_bucket = Variable.get("s3_desy_output_bucket_name")
        request.cls.s3_store = S3JsonStore(
            "s3_elsevier_conn", bucket_name=desy_input_bucket
        )
        request.cls.s3_store.hook.create_bucket("test-desy-incoming")
        request.cls.s3_store.hook.create_bucket("test-desy-processed")

        yield request.cls.s3_store

        request.cls.s3_store.hook.delete_bucket("test-desy-incoming", force_delete=True)
        request.cls.s3_store.hook.delete_bucket(
            "test-desy-processed", force_delete=True
        )


@pytest.fixture(scope="class")
def _inspire_http_record_management_hook(
    request,
):
    def _setup():
        request.cls.inspire_http_record_management_hook = (
            InspireHTTPRecordManagementHook()
        )

    function_test(_setup)
