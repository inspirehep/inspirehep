import sys
from pathlib import Path

import pytest

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
        "ignore_hosts": ("s3",),
    }
