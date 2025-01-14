#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import Schema, fields, post_dump

from inspirehep.records.marshmallow.data.utils import get_authors


class DataAuthorsSchema(Schema):
    authors = fields.Method("get_authors", dump_only=True)

    def get_authors(self, data):
        return get_authors(data)

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
