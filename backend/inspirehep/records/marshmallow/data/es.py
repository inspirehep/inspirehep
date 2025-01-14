#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value
from marshmallow import fields

from inspirehep.records.marshmallow.base import ElasticSearchBaseSchema
from inspirehep.records.marshmallow.data.base import DataRawSchema
from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1
from inspirehep.search.api import LiteratureSearch


class DataElasticSearchSchema(ElasticSearchBaseSchema, DataRawSchema):
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)

    def fetch_authors_from_literature(self, data):
        literature = get_value(data, "literature")
        if not literature:
            return None

        control_number = get_recid_from_ref(get_value(literature[0], "record"))
        if not control_number:
            return None

        literature_record = LiteratureSearch.get_records_by_pids(
            [("lit", control_number)], source="authors"
        )
        if not literature_record:
            return None

        return literature_record[0].to_dict().get("authors")

    def dump(self, obj, *args, **kwargs):
        if not obj.get("authors"):
            authors = self.fetch_authors_from_literature(obj)
            if authors:
                obj["authors"] = authors
        return super().dump(obj, *args, **kwargs)
