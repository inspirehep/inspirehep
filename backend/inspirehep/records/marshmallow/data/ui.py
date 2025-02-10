#
# Copyright (C) 2024 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields, missing

from inspirehep.records.marshmallow.common.literature_record import (
    LiteratureRecordSchemaV1,
)
from inspirehep.records.marshmallow.data.base import DataPublicSchema
from inspirehep.records.marshmallow.data.utils import get_authors
from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1


class DataBaseSchema(DataPublicSchema):
    pass


class DataDetailSchema(DataBaseSchema):
    literature = fields.Nested(LiteratureRecordSchemaV1, dump_only=True, many=True)
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    number_of_authors = fields.Method("get_number_of_authors")

    def get_number_of_authors(self, data):
        authors = data.get("authors")
        if not authors:
            authors = get_authors(data)
        return self.get_len_or_missing(authors)

    @staticmethod
    def get_len_or_missing(maybe_none_list):
        if maybe_none_list is None:
            return missing
        return len(maybe_none_list)


class DataListSchema(DataBaseSchema):
    pass
