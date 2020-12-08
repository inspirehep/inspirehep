# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson

from inspirehep.records.marshmallow.literature.common import ThesisInfoSchemaV1


def test_degree_type_phd_becomes_PhD():
    schema = ThesisInfoSchemaV1()
    dump = {"degree_type": "phd"}
    expected = {"degree_type": "PhD"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_degree_type_titleized_if_not_phd():
    schema = ThesisInfoSchemaV1()
    dump = {"degree_type": "diploma"}
    expected = {"degree_type": "Diploma"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_none_fields():
    schema = ThesisInfoSchemaV1()
    dump = {}
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


@mock.patch("inspirehep.records.marshmallow.literature.common.thesis_info.format_date")
def test_formatted_date(format_date):
    format_date.return_value = "7 Jun 1993"
    schema = ThesisInfoSchemaV1()
    dump = {"date": "7-6-1993"}
    expected = {"date": "7 Jun 1993"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


@mock.patch("inspirehep.records.marshmallow.literature.common.thesis_info.format_date")
def test_formatted_defense_date(format_date):
    format_date.return_value = "7 Jun 1993"
    schema = ThesisInfoSchemaV1()
    dump = {"defense_date": "7-6-1993"}
    expected = {"defense_date": "7 Jun 1993"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
