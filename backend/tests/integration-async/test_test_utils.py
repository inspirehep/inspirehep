# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from operator import add
from time import sleep

import pytest


def test_retry_until_matched_simple_step_without_expected_key(retry_until_matched):

    steps = [{"step": add, "args": [1, 2], "expected_result": 3}]
    retry_until_matched(steps)


def test_retry_until_matched_simple_step_with_expected_key(retry_until_matched):
    steps = [
        {
            "step": dict,
            "kwargs": {"a": 1, "b": [{"z": 2}], "c": 3},
            "expected_result": {"expected_key": "b[0].z", "expected_result": 2},
        }
    ]
    retry_until_matched(steps)


def test_retry_until_matched_multi_step_with_expected_key_simpler_definition(
    retry_until_matched
):
    steps = [
        {
            "step": dict,
            "kwargs": {"a": 1, "b": [{"z": 2}], "c": [3]},
            "expected_key": "b[0].z",
            "expected_result": 2,
        },
        {"expected_key": "c[0]", "expected_result": 3},
    ]
    retry_until_matched(steps)


def test_retry_until_matched_multi_step_wrong_value(retry_until_matched):

    steps = [{"step": add, "args": [1, 2], "expected_result": 4}]
    with pytest.raises(AssertionError):
        retry_until_matched(steps, timeout=1)

    steps = [
        {
            "step": dict,
            "kwargs": {"a": 1, "b": [{"z": 3}], "c": [3]},
            "expected_key": "b[0].z",
            "expected_result": 2,
        }
    ]
    with pytest.raises(AssertionError):
        retry_until_matched(steps, timeout=1)


def test_retry_until_matched_actually_retries_all_steps(retry_until_matched):
    def _test_func(l, p):
        l.append(p)
        return l

    test_list = []
    steps = [
        {"step": _test_func, "args": [test_list, 1]},
        {"expected_result": [1, 1, 1]},
    ]
    retry_until_matched(steps)


def test_retry_until_matched_raises_last_error_on_timeout(retry_until_matched):
    def _test_func():
        raise ConnectionError

    steps = [{"step": _test_func}]
    with pytest.raises(ConnectionError):
        retry_until_matched(steps, 1)


def test_retry_until_matched_raises_timeout_on_timeout_when_no_other_exceptions(
    retry_until_matched
):
    steps = [{"step": sleep, "args": [2]}, {"step": sleep, "args": [2]}]
    with pytest.raises(TimeoutError):
        retry_until_matched(steps, 1)
