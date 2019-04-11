# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from marshmallow import Schema, fields, missing

from inspirehep.records.marshmallow.fields import NonHiddenNested, NonHiddenRaw


def test_nested_returns_only_not_hidden_items_with_many_true():
    class ItemSchema(Schema):
        value = fields.Raw(dump_only=True)
        source = fields.Raw(dump_only=True)

    class RootSchema(Schema):
        items = NonHiddenNested(ItemSchema, dump_only=True, many=True)

    schema = RootSchema()
    data = {
        "items": [
            {"value": "public1"},
            {"value": "private1", "hidden": True, "source": "secret"},
            {"value": "public2", "hidden": False, "source": "whatever"},
        ]
    }

    expected = {
        "items": [{"value": "public1"}, {"value": "public2", "source": "whatever"}]
    }

    result = schema.dumps(data).data

    assert expected == json.loads(result)


def test_raw_returns_only_not_hidden_items_with_list():
    class RootSchema(Schema):
        items = NonHiddenRaw(dump_only=True)

    schema = RootSchema()
    data = {
        "items": [
            {"value": "public1"},
            {"value": "private1", "hidden": True, "source": "secret"},
            {"value": "public2", "hidden": False, "source": "whatever"},
        ]
    }

    expected = {
        "items": [
            {"value": "public1"},
            {"value": "public2", "hidden": False, "source": "whatever"},
        ]
    }

    result = schema.dumps(data).data

    assert expected == json.loads(result)


def test_raw_returns_empty_for_hidden_field():
    class RootSchema(Schema):
        hidden_field = NonHiddenRaw(dump_only=True)
        field = NonHiddenRaw(dump_only=True)

    schema = RootSchema()
    data = {
        "hidden_field": {"value": "private", "hidden": True},
        "field": {"value": "public", "hidden": False},
    }

    expected = {"hidden_field": {}, "field": {"value": "public", "hidden": False}}

    result = schema.dumps(data).data

    assert expected == json.loads(result)
