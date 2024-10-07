import pytest


@pytest.fixture(scope="session")
def vcr_config():
    return {
        "ignore_localhost": True,
        "decode_compressed_response": True,
        "filter_headers": ("Authorization", "User-Agent"),
        "ignore_hosts": (
            "opensearch",
            "flower",
            "mq",
            "postgres-backoffice",
            "redis",
        ),
        "record_mode": "once",
    }
