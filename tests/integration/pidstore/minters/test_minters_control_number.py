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

from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from inspirehep.pidstore.minters.control_number import LiteratureMinter


def test_control_number_literature_without_control_number(base_app, db, create_record):
    record = create_record("lit", with_pid=False)
    data = record.json

    LiteratureMinter.mint(record.id, data)

    expected_pid_value = str(data["control_number"])
    expected_pid_type = "lit"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid


def test_control_number_literature_with_control_number(base_app, db, create_record):
    data = {"control_number": 1}
    record = create_record("lit", data=data, with_pid=False)
    data = record.json

    LiteratureMinter.mint(record.id, data)
    expected_pid_value = str(data["control_number"])
    expected_pid_type = "lit"
    expected_pid_object_uuid = record.id

    result_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert expected_pid_type == result_pid.pid_type
    assert expected_pid_value == result_pid.pid_value
    assert expected_pid_object_uuid == result_pid.object_uuid
