# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson

from inspirehep.records.marshmallow.literature.common import IsbnSchemaV1


def test_isbn_medium_online_becomes_eBook():
    schema = IsbnSchemaV1()
    dump = {"medium": "online"}
    expected = {"medium": "eBook"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_isbn_medium_titleized_if_not_online():
    schema = IsbnSchemaV1()
    dump = {"medium": "print"}
    expected = {"medium": "Print"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_none_fields():
    schema = IsbnSchemaV1()
    dump = {}
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
