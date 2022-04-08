# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from marshmallow import Schema, fields

from inspirehep.records.marshmallow.fields import NestedField


class TestNestedSchema(Schema):
    title = fields.Raw()


class TestSchema(Schema):
    list_of_items = NestedField(TestNestedSchema, many=True)


def test_nested_without_empty_objects():
    schema = TestSchema()

    data = {"list_of_items": [{"title": "first"}, {"title": "second"}]}
    expected = {"list_of_items": [{"title": "first"}, {"title": "second"}]}

    result = schema.dumps(data).data

    assert expected == orjson.loads(result)
