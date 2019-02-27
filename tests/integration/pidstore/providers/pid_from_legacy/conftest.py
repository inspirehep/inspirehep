# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


import pytest


@pytest.fixture(scope="module")
def app_config(app_config):
    app_config.update({"LEGACY_PID_PROVIDER": "http://someurl.com"})
    return app_config
