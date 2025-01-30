#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.pidstore.api import PidStoreData
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.api.mixins import CitationMixin
from inspirehep.records.marshmallow.data import DataElasticSearchSchema
from inspirehep.records.models import DataLiterature


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
        record.update_authors_records_table()
        record.update_refs_in_citation_table()
        return record

    def update(
        self,
        data,
        *args,
        **kwargs,
    ):
        super().update(data)
        self.update_authors_records_table()
        self.update_refs_in_citation_table()

    def delete_relations_with_literature(self):
        DataLiterature.query.filter_by(data_uuid=self.id).delete()

    def delete(self):
        super().delete()
        self.delete_relations_with_literature()

    def hard_delete(self):
        self.delete_relations_with_literature()
        super().hard_delete()

    def reindex(self):
        """Reindex the data record."""
        self.index()
