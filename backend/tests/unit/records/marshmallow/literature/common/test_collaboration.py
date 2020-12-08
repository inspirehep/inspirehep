# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson

from inspirehep.records.marshmallow.literature.common import (
    CollaborationSchemaV1,
    CollaborationWithSuffixSchemaV1,
)


def test_collaboration_with_suffix_returns_empty_if_value_has_no_suffix():
    schema = CollaborationWithSuffixSchemaV1()
    dump = {"value": "CMS"}
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_collaboration_with_suffix_returns_value_if_value_has_suffix():
    schema = CollaborationWithSuffixSchemaV1()
    dump = {"value": "CMS Team"}
    expected = {"value": "CMS Team"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_collaboration_returns_empty_if_value_has_suffix():
    schema = CollaborationSchemaV1()
    dump = {"value": "CMS Team"}
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_collaboration_returns_value_if_value_has_no_suffix():
    schema = CollaborationSchemaV1()
    dump = {"value": "CMS"}
    expected = {"value": "CMS"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
