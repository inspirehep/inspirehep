# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2018 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

"""INSPIRE module that adds more fun to the platform."""

from __future__ import absolute_import, division, print_function

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
        pid_type = "pid_type"
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
        pid_type = "pid_type"
        minters = [minter_1, minter_2, minter_3]

    uuid = "uuid"
    data = {}

    TestBase.mint(uuid, data)

    minter_1.mint.assert_called_once_with(uuid, data)
    minter_2.mint.assert_called_once_with(uuid, data)
    minter_3.mint.assert_called_once_with(uuid, data)
