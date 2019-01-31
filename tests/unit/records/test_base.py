#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.providers.faker import faker
from mock import MagicMock, patch

from inspirehep.records.api import InspireRecord


def test_strip_empty_values():
    empty_fields = {"empty_string": "", "empty_array": [], "empty_dict": {}}
    data = faker.record()
    data.update(empty_fields)
    data_stripped = InspireRecord.strip_empty_values(data)

    assert "empty_string" not in data_stripped
    assert "empty_array" not in data_stripped
    assert "empty_dict" not in data_stripped
