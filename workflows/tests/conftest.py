import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from airflow.sdk import Variable

from tests.test_utils import function_test

dags_path = Path(__file__).resolve().parents[1] / "dags"
sys.path.insert(0, str(dags_path))

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
        "AIRFLOW_CONN_S3_ELSEVIER_CONN": "aws://airflow:airflow-inspire@/?endpoint_url=http://s3%3A9000",
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
def hep_env(request):
    test_dict = {
        "AIRFLOW_CONN_S3_CONN": "aws://airflow:airflow-inspire@s3:9000/"
        "?__extra__=%7B%22endpoint_url%22%3A+%22"
        "http%3A%2F%2Fs3%3A9000%22%2C+%22"
        "service_config%22%3A+%7B%22s3%22%3A+%7B%22"
        "bucket_name%22%3A+%22data-store%22%7D%7D%7D",
        "AIRFLOW_VAR_HEP_ONTOLOGY_FILE": "plugins/include/taxonomies/HEPont.rdf",
        "AIRFLOW_VAR_HEP_SCHEMA": "https://inspirehep.net/schemas/records/hep.json",
        "AIRFLOW_VAR_HEPWORKFLOW_OPEN_SEARCH_INDEX": (
            "backoffice-backend-local-hep-workflows"
        ),
        "AIRFLOW_CONN_BACKOFFICE_CONN": "http://host.docker.internal:8001?Authorization="
        "Token+2e04111a61e8f5ba6ecec52af21bbb9e81732085&"
        "Accept=application%2Fjson&"
        "Content-Type=application%2Fjson",
        "AIRFLOW_CONN_INSPIRE_CONNECTION": "http://host.docker.internal:8080"
        "?Authorization=Bearer+CHANGE_ME&"
        "Accept=application%2Fvnd%2B"
        "inspire.record.raw%2Bjson",
        "AIRFLOW_CONN_ARXIV_CONNECTION": "http://arxiv.org/https",
        "AIRFLOW_CONN_GROBID_CONNECTION": "http://grobid.inspirebeta.net/https",
        "AIRFLOW_CONN_OPENSEARCH_CONNECTION": "opensearch://es:9200",
        "AIRFLOW_CONN_S3_ELSEVIER_CONN": "aws://airflow:airflow-inspire@s3:9000/"
        "?__extra__=%7B%22endpoint_url%22%3A+%22"
        "http%3A%2F%2Fs3%3A9000%22%2C+%22"
        "service_config%22%3A+%7B%22s3%22%3A+%7B%22"
        "bucket_name%22%3A+%22elsevier-store"
        "%22%7D%7D%7D",
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
        request.cls.s3_store = S3JsonStore("s3_conn", bucket_name="data-store")

        yield request.cls.s3_store
