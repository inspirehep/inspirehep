# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

from __future__ import absolute_import, division, print_function

import pytest

from inspirehep.pidstore.api import PidStoreBase


def test_get_config_for_endpoints(appctx):
    pids_to_endpoints = PidStoreBase._get_config_pid_types_to_endpoints()

    assert pids_to_endpoints is not None


def test_get_config_for_schema(appctx):
    pids_to_endpoints = PidStoreBase._get_config_pid_types_to_schema()

    assert pids_to_endpoints is not None
