#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value
from invenio_pidstore.errors import PIDDoesNotExistError
from marshmallow import fields, pre_dump

from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.records.marshmallow.base import ElasticSearchBaseSchema
from inspirehep.records.marshmallow.common.literature_record import (
    LiteratureRecordSchemaV1,
)
from inspirehep.records.marshmallow.data.base import DataRawSchema
from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1
from inspirehep.records.marshmallow.utils import (
    get_facet_author_name_lit_and_dat,
)


class DataElasticSearchSchema(ElasticSearchBaseSchema, DataRawSchema):
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    literature = fields.Nested(LiteratureRecordSchemaV1, dump_only=True, many=True)
    facet_author_name = fields.Method("get_facet_author_name")

    def fetch_authors_from_literature(self, data):
        literature = get_value(data, "literature")
        if not literature:
            return None
        control_number = get_recid_from_ref(get_value(literature[0], "record"))
        if not control_number:
            return None
        try:
            literature_record = LiteratureRecord.get_record_by_pid_value(control_number)
        except PIDDoesNotExistError:
            return None
        return literature_record.get("authors")

    def get_facet_author_name(self, record):
        return get_facet_author_name_lit_and_dat(record)

    @pre_dump
    def load_authors(self, obj):
        if not obj.get("authors"):
            authors = self.fetch_authors_from_literature(obj)
            if authors:
                obj["authors"] = authors
        return obj
