#
# Copyright (C) 2024 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.date import format_date
from marshmallow import fields, missing

from inspirehep.records.marshmallow.common import AcceleratorExperimentSchemaV1
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
    date = fields.Method("get_date")
    number_of_authors = fields.Method("get_number_of_authors")
    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )

    def get_number_of_authors(self, data):
        authors = data.get("authors")
        if not authors:
            authors = get_authors(data)
        return self.get_len_or_missing(authors)

    def get_date(self, data):
        return (
            format_date(data.get("creation_date"))
            if "creation_date" in data
            else missing
        )

    @staticmethod
    def get_len_or_missing(maybe_none_list):
        if maybe_none_list is None:
            return missing
        return len(maybe_none_list)


class DataListSchema(DataBaseSchema):
    class Meta:
        exclude = ["facet_author_name"]
