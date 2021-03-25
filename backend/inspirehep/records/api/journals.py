# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from ...pidstore.api import PidStoreJournals
from .base import InspireRecord


class JournalsRecord(InspireRecord):
    """Journals Record."""

    es_serializer = (
        "inspirehep.records.marshmallow.journals.JournalsElasticSearchSchema"
    )
    pid_type = "jou"
    pidstore_handler = PidStoreJournals
