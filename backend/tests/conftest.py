# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
import vcr


@pytest.fixture(scope="session")
def vcr_config():
    return {
        "decode_compressed_response": True,
        "filter_headers": ("Authorization", "User-Agent"),
        "ignore_hosts": (
            "cache",
            "db",
            "elasticsearch",
            "flower",
            "indexer",
            "localhost",
            "mq",
            "postgres",
            "redis",
            "ui",
            "web-next",
            "web-worker",
            "web",
            "worker",
        ),
        "record_mode": "once",
    }
