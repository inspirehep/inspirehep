#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value
from marshmallow import fields, missing

from inspirehep.records.marshmallow.base import ElasticSearchBaseSchema
from inspirehep.records.marshmallow.data.base import DataRawSchema
from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1
from inspirehep.search.api import LiteratureSearch


class DataElasticSearchSchema(ElasticSearchBaseSchema, DataRawSchema):
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    number_of_authors = fields.Method("get_number_of_authors")

    def fetch_authors_from_literature(self, data):
        literature = get_value(data, "literature")
        if literature:
            control_number = get_recid_from_ref(get_value(literature[0], "record"))
            if control_number:
                # This weird tuple is because the method takes [-1] of each list element as the control number...
                literature_record = LiteratureSearch.get_records_by_pids(
                    [(0, control_number)], source="authors"
                )
                if not literature_record:
                    return []
                return literature_record[0].to_dict().get("authors", [])

    def get_number_of_authors(self, data):
        authors = self.fetch_authors_from_literature(data)
        return self.get_len_or_missing(authors)

    def dump(self, obj, *args, **kwargs):
        fetched_authors = self.fetch_authors_from_literature(obj)
        if fetched_authors:
            obj["authors"] = fetched_authors[:10]
        return super().dump(obj, *args, **kwargs)

    @staticmethod
    def get_len_or_missing(maybe_none_list):
        if maybe_none_list is None:
            return missing
        return len(maybe_none_list)
