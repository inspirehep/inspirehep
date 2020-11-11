# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from copy import deepcopy

from flask import abort
from inspire_dojson.utils import strip_empty_values
from invenio_records_rest.schemas.json import RecordSchemaJSONV1
from marshmallow import fields, post_dump, pre_dump
from marshmallow.schema import Schema


class EnvelopeSchema(RecordSchemaJSONV1):
    """This schema is the envelope of the API.

    Invenio API returns the following structure:

    Examples:
        {
            'uuid': '...',
            'id': '...',
            'metadata': {},
            'created': '...',
            'updated': '...',
        }

    Note:
        In our case we need to enchance this with extra data.
    """

    uuid = fields.String(dump_only=True, attribute="pid.object_uuid")


class ForbiddenSchema(Schema):
    @pre_dump
    def abort(self, data):
        abort(403)


class ElasticSearchBaseSchema:
    """ElasticSearch specific extra response data."""

    _created = fields.DateTime(dump_only=True, attribute="created")
    _updated = fields.DateTime(dump_only=True, attribute="updated")


class BaseSchema(Schema):
    """Base schema."""

    def dump(self, obj, *args, **kwargs):
        obj_copy = deepcopy(obj)
        if hasattr(obj, "model"):
            obj_copy.model = obj.model
        return super().dump(obj_copy, *args, **kwargs)


class RecordBaseSchema(BaseSchema):
    """Base record class for Inspire Schema.

    By default it will include all the fields. If you want fields to be excluded
    you should specify ``exclude``.

    Examples:

        # Exclude a field
        class Literature(RecordBaseSchema):
            class Meta:
                exclude = [
                    'name_of_the_field_to_exclude',
                ]

        # Register a new ``post_dump``
        class Literature(RecordBaseSchema):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self.post_dumps.append(self.another_post_dump)

            def another_post_dump(self, data, original_data):
                return data
    """

    def __new__(cls, *args, **kwargs):
        cls.post_dumps = []
        return super().__new__(cls)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.post_dumps.append(self.include_original_fields)

    def include_original_fields(self, data, original_data):
        for key, _ in original_data.items():
            if key not in data and key not in self.exclude:
                data[key] = original_data[key]
        return data

    @post_dump(pass_original=True)
    def process_post_dump_in_order(self, data, original_data):
        for dump_func in self.post_dumps:
            data = dump_func(data, original_data)
        return strip_empty_values(data)


def wrap_schema_class_with_metadata(schema):
    class MetadataSchema(EnvelopeSchema):
        metadata = fields.Nested(schema, dump_only=True)

    return MetadataSchema
