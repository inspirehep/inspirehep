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

from __future__ import absolute_import, division, print_function

import pytest
from helpers.factories.models.records import RecordMetadataFactory

from inspirehep.pidstore.errors import MissingSchema
from inspirehep.pidstore.minters.recid import recid_minter


def test_minter_without_control_number(base_app, db):
    record = RecordMetadataFactory()
    data = record.json

    control_number = recid_minter(record.id, data, "pid", "rec")

    assert control_number.pid_value == data["control_number"]


def test_minter_with_control_number(base_app, db):
    record = RecordMetadataFactory()
    data = record.json
    data["control_number"] = 1

    control_number = recid_minter(record.id, data, "pid", "rec")

    assert control_number.pid_value == 1


def test_minter_with_missing_schema_key(base_app, db):
    record = RecordMetadataFactory()
    data = record.json
    del data["$schema"]

    with pytest.raises(MissingSchema):
        recid_minter(record.id, data, "pid", "rec")
