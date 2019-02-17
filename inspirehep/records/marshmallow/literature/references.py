# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from invenio_records_rest.schemas.json import RecordSchemaJSONV1
from marshmallow import Schema, fields, post_dump, pre_dump

from ..fields import ListWithLimit, NestedWithoutEmptyObjects
from .common import ReferenceItemSchemaV1


class LiteratureReferencesMetadataSchemaV1(Schema):
    references = NestedWithoutEmptyObjects(
        ReferenceItemSchemaV1, default=[], many=True, dump_only=True
    )

    @pre_dump
    def filter_dump(self, data):
        return data.get("metadata", data)

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)


class LiteratureReferencesSchemaV1(RecordSchemaJSONV1):
    metadata = fields.Nested(LiteratureReferencesMetadataSchemaV1, dump_only=True)
