# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from ...pidstore.api import PidStoreInstitutions
from .base import InspireRecord


class InstitutionsRecord(InspireRecord):
    """Institutions Record."""

    pid_type = "ins"

    es_serializer = None

    @staticmethod
    def mint(record_uuid, data):
        PidStoreInstitutions.mint(record_uuid, data)
