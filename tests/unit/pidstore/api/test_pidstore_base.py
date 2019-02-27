# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


import pytest
from mock import MagicMock, patch

from inspirehep.pidstore.api import PidStoreBase


@pytest.mark.parametrize("pid_type,expected", [("lit", "literature"), ("jes", None)])
@patch(
    "inspirehep.pidstore.api.PidStoreBase._get_config_pid_types_to_endpoints",
    return_value={"lit": "literature"},
)
def test_get_endpoint_from_pid_type(
    mock_get_config_pid_types_to_endpoints, pid_type, expected
):
    result = PidStoreBase.get_endpoint_from_pid_type(pid_type)

    assert expected == result


@pytest.mark.parametrize(
    "endpoint,expected", [("literature", "lit"), ("jes", None), (None, None)]
)
@patch(
    "inspirehep.pidstore.api.PidStoreBase._get_config_pid_types_to_endpoints",
    return_value={"lit": "literature"},
)
def test_get_pid_type_from_endpoint(
    momock_get_config_pid_types_to_endpointsck_get, endpoint, expected
):
    result = PidStoreBase.get_pid_type_from_endpoint(endpoint)

    assert expected == result


@pytest.mark.parametrize(
    "schema,expected",
    [
        ("http://localhost:5000/schemas/record/hep.json", "lit"),
        ("http://localhost:5000/schemas/record/jes.json", None),
        ("jes.json", None),
        (None, None),
    ],
)
@patch(
    "inspirehep.pidstore.api.PidStoreBase._get_config_pid_types_to_endpoints",
    return_value={"lit": "literature"},
)
@patch(
    "inspirehep.pidstore.api.PidStoreBase._get_config_pid_types_to_schema",
    return_value={"hep": "lit"},
)
def test_get_pid_type_from_schema(
    mock_get_config_pid_types_to_endpointsck_get,
    mock_get_config_pid_types_to_schema,
    schema,
    expected,
):
    result = PidStoreBase.get_pid_type_from_schema(schema)

    assert expected == result


def test_mint_with_one_minter():
    minter_1 = MagicMock(mint=MagicMock())

    class TestBase(PidStoreBase):
        minters = [minter_1]

    uuid = "uuid"
    data = {}

    TestBase.mint(uuid, data)

    minter_1.mint.assert_called_once_with(uuid, data)


def test_mint_with_many_minters():
    minter_1 = MagicMock(mint=MagicMock())
    minter_2 = MagicMock(mint=MagicMock())
    minter_3 = MagicMock(mint=MagicMock())

    class TestBase(PidStoreBase):
        minters = [minter_1, minter_2, minter_3]

    uuid = "uuid"
    data = {}

    TestBase.mint(uuid, data)

    minter_1.mint.assert_called_once_with(uuid, data)
    minter_2.mint.assert_called_once_with(uuid, data)
    minter_3.mint.assert_called_once_with(uuid, data)


@pytest.mark.parametrize(
    "url,expected",
    [
        ("http://labs.inspirehep.net/api/literature/1273685", ("lit", "1273685")),
        ("http://labs.inspirehep.net/api/literature/1273685/", ("lit", "1273685")),
        ("non-url-string", None),
    ],
)
def test_get_pid_from_record_uri(url, expected):
    data_result = PidStoreBase.get_pid_from_record_uri(url)

    assert expected == data_result
