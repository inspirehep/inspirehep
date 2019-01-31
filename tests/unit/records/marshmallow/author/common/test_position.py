# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from inspire_schemas.api import load_schema, validate

from inspirehep.records.marshmallow.authors.common import PositionSchemaV1


def test_returns_display_date_if_start_and_end_date_present():
    schema = PositionSchemaV1()
    dump = {"institution": "CERN", "start_date": "2000", "end_date": "2015"}

    position_schema = load_schema("authors")["properties"]["positions"]["items"]
    assert validate(dump, position_schema) is None

    expected = {"institution": "CERN", "display_date": "2000-2015"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_returns_display_date_if_start_date_present_and_current_set():
    schema = PositionSchemaV1()
    dump = {"institution": "CERN", "start_date": "2000", "current": True}

    position_schema = load_schema("authors")["properties"]["positions"]["items"]
    assert validate(dump, position_schema) is None

    expected = {"institution": "CERN", "current": True, "display_date": "2000-present"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_returns_display_date_if_only_current_set():
    schema = PositionSchemaV1()
    dump = {"institution": "CERN", "current": True}

    position_schema = load_schema("authors")["properties"]["positions"]["items"]
    assert validate(dump, position_schema) is None

    expected = {"institution": "CERN", "current": True, "display_date": "present"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_returns_display_date_if_start_date_present():
    schema = PositionSchemaV1()
    dump = {"institution": "CERN", "start_date": "2000"}

    position_schema = load_schema("authors")["properties"]["positions"]["items"]
    assert validate(dump, position_schema) is None

    expected = {"institution": "CERN", "display_date": "2000"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_returns_display_date_if_end_date_present():
    schema = PositionSchemaV1()
    dump = {"institution": "CERN", "end_date": "2000"}

    position_schema = load_schema("authors")["properties"]["positions"]["items"]
    assert validate(dump, position_schema) is None

    expected = {"institution": "CERN", "display_date": "2000"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_returns_display_date_rank_institution_and_current():
    schema = PositionSchemaV1()
    dump = {"institution": "CERN", "current": False, "end_date": "2000", "rank": "PHD"}

    position_schema = load_schema("authors")["properties"]["positions"]["items"]
    assert validate(dump, position_schema) is None

    expected = {
        "institution": "CERN",
        "display_date": "2000",
        "rank": "PHD",
        "current": False,
    }

    result = schema.dumps(dump).data

    assert expected == json.loads(result)
