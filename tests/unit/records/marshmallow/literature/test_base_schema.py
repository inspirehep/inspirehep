# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

import pytest
from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureUISchema


def test_literature_ui_schema():
    data_record = faker.record("lit")
    data_record_json = json.dumps(data_record)
    data = {"metadata": {"_ui_display": data_record_json}}
    expected_result = {"metadata": data_record}
    result = LiteratureUISchema().dump(data).data

    assert expected_result == result


def test_literature_ui_schema_missing_ui_display_field():
    data_record = faker.record("lit")
    data_record_json = json.dumps(data_record)
    data = {"metadata": {"NOT_A_UI_DISPLAY_FIELD": data_record_json}}
    expected_result = {"metadata": {}}
    result = LiteratureUISchema().dump(data).data

    assert expected_result == result


def test_literature_ui_schema_with_invalid_ui_display():
    data = {"metadata": {"_ui_display": "foo"}}
    expected_result = {"metadata": {}}
    result = LiteratureUISchema().dump(data).data

    assert expected_result == result
