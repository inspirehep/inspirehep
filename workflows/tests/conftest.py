import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from airflow.sdk import Variable
from airflow.secrets.local_filesystem import load_connections_dict, load_variables

from tests.test_utils import function_test

dags_path = Path(__file__).resolve().parents[1] / "dags"
sys.path.insert(0, str(dags_path))

from include.utils.s3 import S3JsonStore  # noqa: E402

VARIABLES_FILE = (
    Path(__file__).resolve().parent.parent / "scripts" / "configs" / "variables.json"
)
CONNECTIONS_FILE = (
    Path(__file__).resolve().parent.parent / "scripts" / "configs" / "connections.json"
)


def variables_dict_to_env_dict(variables_file, variables_to_import=None):
    variables_dict = load_variables(str(variables_file))
    env_dict = {}
    for key, value in variables_dict.items():
        if variables_to_import is None or key in variables_to_import:
            env_key = f"AIRFLOW_VAR_{key.upper()}"
            env_dict[env_key] = str(value)
    return env_dict


def connections_dict_to_env_dict(connections_file, connections_to_import=None):
    connections_dict = load_connections_dict(str(connections_file))
    env_dict = {}
    for key, value in connections_dict.items():
        if connections_to_import is None or key in connections_to_import:
            env_key = f"AIRFLOW_CONN_{key.upper()}"
            env_dict[env_key] = value.get_uri()
    return env_dict


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
    env_dict = {
        "AIRFLOW_VAR_S3_DESY_INPUT_BUCKET_NAME": "test-desy-incoming",
        "AIRFLOW_VAR_S3_DESY_OUTPUT_BUCKET_NAME": "test-desy-processed",
    }
    env_dict.update(
        connections_dict_to_env_dict(
            CONNECTIONS_FILE, connections_to_import=["s3_elsevier_conn"]
        )
    )

    with patch.dict(
        os.environ,
        env_dict,
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
def hep_env(request):
    env_dict = variables_dict_to_env_dict(VARIABLES_FILE)
    env_dict.update(connections_dict_to_env_dict(CONNECTIONS_FILE))

    with patch.dict(
        os.environ,
        env_dict,
    ):
        request.cls.s3_store = S3JsonStore("s3_conn", bucket_name="data-store")

        yield request.cls.s3_store
