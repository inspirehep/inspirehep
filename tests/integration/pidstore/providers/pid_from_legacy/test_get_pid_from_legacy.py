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
from helpers.factories.models.records import RecordMetadataFactory
from invenio_pidstore.models import PIDStatus

from inspirehep.pidstore.providers.recid import InspireRecordIdProvider


def test_provider_with_legacy_provider(base_app, db, requests_mock):
    requests_mock.get(
        "http://someurl.com", text="1", headers={"Content-Type": "application/json"}
    )

    record = RecordMetadataFactory()

    provide = {"object_type": "rec", "object_uuid": record.id, "pid_type": "pid"}
    provider = InspireRecordIdProvider.create(**provide)

    assert provider.pid.pid_value == 1
    assert "pid" == provider.pid.pid_type
    assert PIDStatus.REGISTERED == provider.pid.status
