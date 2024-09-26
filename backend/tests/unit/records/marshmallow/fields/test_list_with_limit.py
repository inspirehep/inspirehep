#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from inspirehep.records.marshmallow.fields import ListWithLimit
from marshmallow import Schema, fields


class TestSchemaWithLimitFive(Schema):
    __test__ = False
    list_of_items = ListWithLimit(fields.Raw(), limit=5)


class TestSchemaWithLimitOne(Schema):
    __test__ = False
    list_of_items = ListWithLimit(fields.Raw(), limit=1)


class TestSchemaWithNoLimit(Schema):
    __test__ = False
    list_of_items = ListWithLimit(fields.Raw())


def test_list_with_limit_five():
    schema = TestSchemaWithLimitFive()
    data = {"list_of_items": ["one", "two", "three", "four", "five", "six"]}

    expected = {"list_of_items": ["one", "two", "three", "four", "five"]}

    result = schema.dumps(data).data

    assert expected == orjson.loads(result)


def test_list_with_limit_one():
    schema = TestSchemaWithLimitOne()
    data = {"list_of_items": ["one", "two", "three", "four", "five", "six"]}

    expected = {"list_of_items": ["one"]}

    result = schema.dumps(data).data

    assert expected == orjson.loads(result)


def test_list_with_no_limit():
    schema = TestSchemaWithNoLimit()
    data = {"list_of_items": ["one", "two", "three", "four", "five"]}

    expected = {"list_of_items": ["one", "two", "three", "four", "five"]}

    result = schema.dumps(data).data

    assert expected == orjson.loads(result)
