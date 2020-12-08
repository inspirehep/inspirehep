# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import orjson
from marshmallow import Schema, fields

from inspirehep.records.marshmallow.literature.common import DOISchemaV1


def test_returns_value_and_material_for_doi():
    schema = DOISchemaV1()
    dump = {
        "source": "arXiv",
        "value": "10.1016/j.nuclphysb.2017.05.003",
        "material": "publication",
    }
    expected = {"value": "10.1016/j.nuclphysb.2017.05.003", "material": "publication"}
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_same_doi_value_from_different_source_is_ignored():
    class TestSchema(Schema):
        dois = fields.Nested(DOISchemaV1, dump_only=True, many=True)

    schema = TestSchema()
    dump = {
        "dois": [
            {"value": "10.1016/j.nuclphysb.2017.05.003"},
            {"value": "10.1016/j.nuclphysb.2017.05.003"},
            {"value": "10.1093/mnras/sty2213"},
        ]
    }
    expected = {
        "dois": [
            {"value": "10.1016/j.nuclphysb.2017.05.003"},
            {"value": "10.1093/mnras/sty2213"},
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
