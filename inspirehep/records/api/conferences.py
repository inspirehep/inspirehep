# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from ...pidstore.api import PidStoreConferences
from .base import InspireRecord


class ConferencesRecord(InspireRecord):
    """Conferences Record."""

    pid_type = "con"

    es_serializer = None

    @staticmethod
    def mint(record_uuid, data):
        PidStoreConferences.mint(record_uuid, data)
