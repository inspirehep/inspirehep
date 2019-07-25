# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import Schema, fields, post_dump

from ..fields import NestedWithoutEmptyObjects
from .common import AuthorSchemaV1


class LiteratureAuthorsSchema(Schema):
    authors = NestedWithoutEmptyObjects(
        AuthorSchemaV1, default=[], dump_only=True, many=True
    )
    collaborations = fields.Raw(default=[], dump_only=True)

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
