# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from helpers.utils import create_record

from inspirehep.cds.api import (
    get_record_for_pid_or_none,
    get_record_for_provided_ids,
    query_report_number,
)


@pytest.mark.parametrize(
    "data, pid_value, pid_type, expected_control_number",
    [
        (
            {"control_number": 12345},
            12345,
            "lit",
            12345,
        ),
        (
            {"control_number": 12345, "arxiv_eprints": [{"value": "2105.04372"}]},
            "2105.04372",
            "arxiv",
            12345,
        ),
        (
            {"control_number": 12345, "dois": [{"value": "10.1088/1361-6560/abf604"}]},
            "10.1088/1361-6560/abf604",
            "doi",
            12345,
        ),
    ],
)
def test_get_record_for_pid_or_none_control_number_record_exists(
    inspire_app, data, pid_value, pid_type, expected_control_number
):
    create_record("lit", data=data)

    record = get_record_for_pid_or_none(pid_type, pid_value)
    assert expected_control_number == record.control_number


@pytest.mark.parametrize(
    "data, pid_value, pid_type",
    [
        (
            {"control_number": 1234},
            9999,
            "lit",
        ),
        (
            {"control_number": 12345, "arxiv_eprints": [{"value": "2105.04372"}]},
            "9999.99999",
            "arxiv",
        ),
        (
            {"control_number": 12345, "dois": [{"value": "10.1088/1361-6560/abf604"}]},
            "99.9999/9999-9999/abc999",
            "doi",
        ),
    ],
)
def test_get_record_for_pid_or_none_control_number_record_missing(
    inspire_app, data, pid_value, pid_type
):
    create_record("lit", data=data)

    record = get_record_for_pid_or_none(pid_type, pid_value)
    assert record is None


def test_query_report_number(inspire_app):
    report_number = "PI/UAN-2021-689FT"
    expected_control_number = 12345
    data = {
        "control_number": expected_control_number,
        "report_numbers": [{"value": report_number, "source": "arXiv"}],
    }

    create_record("lit", data=data)
    rec = query_report_number(report_number)

    assert rec.control_number == expected_control_number


def test_query_report_number_in_multiple_records(inspire_app):
    report_number = "PI/UAN-2021-689FT"
    data = {"report_numbers": [{"value": report_number}]}

    create_record("lit", data=data)
    create_record("lit", data=data)
    rec = query_report_number(report_number)

    assert rec is None


def test_query_missing_report_number(inspire_app):
    report_number = "PI/UAN-2021-689FT"
    expected_control_number = 12345
    data = {
        "control_number": expected_control_number,
        "report_numbers": [{"value": report_number}],
    }

    create_record("lit", data=data)
    rec = query_report_number("AB/CDE-2021-689FG")

    assert rec is None


@pytest.mark.parametrize(
    "data, control_numbers, arxivs, dois, report_numbers, expected_control_number",
    [
        (
            {"control_number": 12345},
            [12345],
            [],
            [],
            [],
            12345,
        ),
        (
            {"control_number": 12345, "arxiv_eprints": [{"value": "2105.04372"}]},
            [],
            ["2105.04372"],
            [],
            [],
            12345,
        ),
        (
            {"control_number": 12345, "dois": [{"value": "10.1088/1361-6560/abf604"}]},
            [],
            [],
            ["10.1088/1361-6560/abf604"],
            [],
            12345,
        ),
        (
            {"control_number": 12345, "arxiv_eprints": [{"value": "2105.04372"}]},
            [],
            [],
            [],
            ["arXiv:2105.04372"],
            12345,
        ),
        (
            {
                "control_number": 12345,
                "report_numbers": [{"value": "PI/UAN-2021-689FT"}],
            },
            [],
            [],
            [],
            ["PI/UAN-2021-689FT"],
            12345,
        ),
    ],
)
def test_record_for_provided_ids(
    inspire_app,
    data,
    control_numbers,
    arxivs,
    dois,
    report_numbers,
    expected_control_number,
):
    create_record("lit", data=data)

    record = get_record_for_provided_ids(control_numbers, arxivs, dois, report_numbers)
    assert record.control_number == expected_control_number
