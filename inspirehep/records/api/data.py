# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.api.mixins import CitationMixin

from ...pidstore.api import PidStoreData
from .base import InspireRecord


class DataRecord(InspireRecord, CitationMixin):
    """Data Record."""

    pid_type = "dat"

    es_serializer = None

    @staticmethod
    def mint(record_uuid, data):
        PidStoreData.mint(record_uuid, data)
