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

import requests
from flask import current_app
from invenio_pidstore.models import PIDStatus, RecordIdentifier
from invenio_pidstore.providers.base import BaseProvider


def get_next_pid_from_legacy():
    """Reserve the next pid on legacy.
    Sends a request to a legacy instance to reserve the next available
    identifier, and returns it to the caller.
    """
    headers = {"User-Agent": "invenio_webupload"}

    url = current_app.config.get("LEGACY_PID_PROVIDER")
    next_pid = requests.get(url, headers=headers).json()

    return next_pid


class InspireRecordIdProvider(BaseProvider):
    """Record identifier provider."""

    pid_type = None

    pid_provider = None

    default_status = PIDStatus.RESERVED

    @classmethod
    def create(cls, object_type=None, object_uuid=None, **kwargs):
        """Create a new record identifier."""
        if "pid_value" not in kwargs:
            if current_app.config.get("LEGACY_PID_PROVIDER"):
                kwargs["pid_value"] = get_next_pid_from_legacy()
                RecordIdentifier.insert(kwargs["pid_value"])
            else:
                kwargs["pid_value"] = RecordIdentifier.next()
        else:
            RecordIdentifier.insert(kwargs["pid_value"])

        kwargs.setdefault("status", cls.default_status)
        if object_type and object_uuid:
            kwargs["status"] = PIDStatus.REGISTERED
        return super(InspireRecordIdProvider, cls).create(
            object_type=object_type, object_uuid=object_uuid, **kwargs
        )
