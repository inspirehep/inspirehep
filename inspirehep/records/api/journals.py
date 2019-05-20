# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.journals import JournalsMetadataRawFieldsSchemaV1

from ...pidstore.api import PidStoreJournals
from .base import InspireRecord


class JournalsRecord(InspireRecord):
    """Journals Record."""

    pid_type = "jou"

    es_serializer = JournalsMetadataRawFieldsSchemaV1

    @staticmethod
    def mint(record_uuid, data):
        PidStoreJournals.mint(record_uuid, data)
