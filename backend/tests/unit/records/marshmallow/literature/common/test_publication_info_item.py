# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
import pytest

from inspirehep.records.marshmallow.literature.common import PublicationInfoItemSchemaV1


def test_returns_empty_if_display_fields_missing():
    schema = PublicationInfoItemSchemaV1()
    dump = {"journal_issue": "Test"}
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_returns_non_empty_fields_if_jonurnal_title_present():
    schema = PublicationInfoItemSchemaV1()
    dump = {"journal_title": "Test JT", "journal_volume": "Test JV"}
    expected = {"journal_title": "Test JT", "journal_volume": "Test JV"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_returns_non_empty_fields_if_pubinfo_freetext_present():
    schema = PublicationInfoItemSchemaV1()
    dump = {"pubinfo_freetext": "Test PubInfoFreetext"}
    expected = {"pubinfo_freetext": "Test PubInfoFreetext"}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
