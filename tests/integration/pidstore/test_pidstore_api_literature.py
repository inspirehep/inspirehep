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

from inspirehep.pidstore.api import PidStoreLiterature
from inspirehep.pidstore.errors import MissingControlNumber, MissingSchema


def xtest_fetch(base_app, db, create_record):
    record = create_record("lit", with_pid=False)

    PidStoreLiterature.mint(record.id, record.json)
    pid_fetch = PidStoreLiterature.fetch(record.id, record.json)

    expected_control_number = str(record.json["control_number"])

    assert expected_control_number == pid_fetch.pid_value


def xtest_fetch_with_missing_schema(base_app, db, create_record):
    record = create_record("lit")
    data = record.json
    del data["$schema"]

    with pytest.raises(MissingSchema):
        PidStoreLiterature.fetch(record.id, record.json)


def xtest_fetch_with_missing_control_number(base_app, db, create_record):
    record = create_record("lit")
    data = record.json
    del data["control_number"]

    with pytest.raises(MissingControlNumber):
        PidStoreLiterature.fetch(record.id, record.json)
