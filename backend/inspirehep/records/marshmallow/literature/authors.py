# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import Schema, fields, post_dump

from ..fields import NestedField
from .common import AuthorSchemaV1
from .common.author import SupervisorSchema


class LiteratureAuthorsSchema(Schema):
    authors = NestedField(
        AuthorSchemaV1, default=[], dump_only=True, many=True, attribute="authors"
    )
    supervisors = NestedField(
        SupervisorSchema, default=[], dump_only=True, many=True, attribute="authors"
    )
    collaborations = fields.Raw(default=[], dump_only=True)

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
