# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.api.mixins import CitationMixin
from inspirehep.records.marshmallow.data import DataElasticSearchSchema

from ...pidstore.api import PidStoreData
from .base import InspireRecord


class DataRecord(CitationMixin, InspireRecord):
    """Data Record."""

    es_serializer = DataElasticSearchSchema
    pid_type = "dat"
    pidstore_handler = PidStoreData

    @classmethod
    def create(
        cls,
        data,
        *args,
        **kwargs,
    ):
        record = super().create(data, **kwargs)
        record.update_refs_in_citation_table()
        return record

    def update(
        self,
        data,
        *args,
        **kwargs,
    ):
        super().update(data)
        self.update_refs_in_citation_table()
