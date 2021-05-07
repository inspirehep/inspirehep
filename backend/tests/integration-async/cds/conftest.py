# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import os
import time

import pkg_resources
import pytest
import requests_mock


@pytest.fixture(scope="function")
def inspire_app_with_config_for_cds_sync(inspire_app, override_config):
    with override_config(
        FEATURE_FLAG_ENABLE_CDS_SYNC=True, CDS_SERVER_API="http://localhost:9876/api/"
    ):
        yield inspire_app


@pytest.fixture(scope="function")
def inspire_app_for_cds_sync(inspire_app_with_config_for_cds_sync):
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "http://localhost:9876/api/inspire2cdsids?since=2020-07-01",
            status_code=200,
            content=pkg_resources.resource_string(
                __name__, os.path.join("fixtures", "cds_response.json")
            ),
        )
        mocker.get(
            "http://localhost:9876/api/inspire2cdsids?since=2020-12-24",
            status_code=200,
            content=pkg_resources.resource_string(
                __name__, os.path.join("fixtures", "cds_single_response.json")
            ),
        )
        mocker.get(
            "http://localhost:9876/api/inspire2cdsids?since=2022-09-15",
            status_code=500,
        )
        yield inspire_app_with_config_for_cds_sync

        time.sleep(0.5)
