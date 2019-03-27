# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from marshmallow import Schema, fields

from inspirehep.records.marshmallow.fields import NestedWithoutEmptyObjects


class TestNestedSchema(Schema):
    title = fields.Raw()


class TestSchema(Schema):
    list_of_items = NestedWithoutEmptyObjects(TestNestedSchema, many=True)


def test_nested_without_empty_objects():
    schema = TestSchema()

    data = {"list_of_items": [{"title": "first"}, {"title": "second"}]}
    expected = {"list_of_items": [{"title": "first"}, {"title": "second"}]}

    result = schema.dumps(data).data

    assert expected == json.loads(result)


def test_nested_without_empty_objects_with_one_empty():
    schema = TestSchema()

    data = {"list_of_items": [{"name": "first"}, {"title": "second"}]}
    expected = {"list_of_items": [{"title": "second"}]}

    result = schema.dumps(data).data

    assert expected == json.loads(result)


def test_nested_without_empty_objects_with_all_empty():
    schema = TestSchema()

    data = {"list_of_items": [{"name": "first"}, {"name": "second"}]}
    expected = {"list_of_items": None}

    result = schema.dumps(data).data

    assert expected == json.loads(result)
