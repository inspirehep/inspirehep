# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest


@pytest.fixture(scope="module")
def app_config(app_config):
    app_config.update(
        {
            "RT_URL": "https://rt.inspirehep.net/REST/1.0/",
            "RT_VERIFY_SSL": False,
            # To record new cassets update your ``inspirehep.cfg`` with the
            # real ``USER`` and ``PWD```
            "RT_USER": "CHANGE_ME",
            "RT_PASSWORD": "CHANGE_ME",
            "RT_OVERRIDE_QUEUE": "Test",
        }
    )
    return app_config
