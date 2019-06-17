# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import uuid

import pytest

from inspirehep.pidstore.minters.base import Minter


def test_pid_value_with_duplicates():
    id_ = uuid.uuid4()
    value_jessica_jones = "Jessica Jones"
    value_luke_cage = "Luke Cage"
    data = {
        "defenders": [
            {"value": value_jessica_jones},
            {"value": value_jessica_jones},
            {"value": value_luke_cage},
        ]
    }

    minter = Minter(id_, data)
    minter.pid_value_path = "defenders.value"

    expected_len = 2
    expected_value = {value_jessica_jones, value_luke_cage}

    result_value = minter.get_pid_values()
    result_value_len = len(result_value)

    assert expected_value == result_value
    assert expected_len == result_value_len


def test_pid_value_with_string():
    id_ = uuid.uuid4()
    value_jessica_jones = "Jessica Jones"

    data = {"defenders": {"value": value_jessica_jones}}

    minter = Minter(id_, data)
    minter.pid_value_path = "defenders.value"

    expected_len = 1
    expected_value = {value_jessica_jones}

    result_value = minter.get_pid_values()
    result_value_len = len(result_value)

    assert expected_value == result_value
    assert expected_len == result_value_len


def test_pid_value_with_empty():
    id_ = uuid.uuid4()
    value_jessica_jones = "Jessica Jones"

    data = {"defenders": {"name": value_jessica_jones}}

    minter = Minter(id_, data)
    minter.pid_value_path = "defenders.value"

    expected_len = 0
    expected_value = set()

    result_value = minter.get_pid_values()
    result_value_len = len(result_value)

    assert expected_value == result_value
    assert expected_len == result_value_len
