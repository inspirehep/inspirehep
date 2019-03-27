# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from ...pidstore.api import PidStoreExperiments
from .base import InspireRecord


class ExperimentsRecord(InspireRecord):
    """Experiments Record."""

    pid_type = "exp"

    es_serializer = None

    @staticmethod
    def mint(record_uuid, data):
        PidStoreExperiments.mint(record_uuid, data)
