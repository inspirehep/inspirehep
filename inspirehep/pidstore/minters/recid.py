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

from ..errors import MissingSchema
from ..providers.recid import InspireRecordIdProvider


def recid_minter(record_uuid, data, pid_type, object_type):
    """Mint record identifiers."""

    if "$schema" not in data:
        raise MissingSchema

    args = {
        "object_type": object_type,
        "object_uuid": record_uuid,
        "pid_type": pid_type,
    }

    if "control_number" in data:
        args["pid_value"] = data["control_number"]

    provider = InspireRecordIdProvider.create(**args)
    data["control_number"] = provider.pid.pid_value
    return provider.pid
