# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson

from inspirehep.records.marshmallow.literature import LiteratureReferencesSchema


def test_references_schema_without_references():
    schema = LiteratureReferencesSchema()
    record = {"titles": [{"title": "Jessica Jones"}]}
    expected = {"references": []}
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result
