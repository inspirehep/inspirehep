# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.conferences import ConferencesElasticSearchSchema

from ...pidstore.api import PidStoreConferences
from .base import InspireRecord


class ConferencesRecord(InspireRecord):
    """Conferences Record."""

    es_serializer = ConferencesElasticSearchSchema
    pid_type = "con"
    pidstore_handler = PidStoreConferences
