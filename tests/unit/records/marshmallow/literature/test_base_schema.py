# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureSearchUISchemaV1
from inspirehep.records.marshmallow.literature.base import (
    LiteratureMetadataRawPublicSchemaV1,
)


def test_literature_related_records():
    data = {
        "related_records": [
            {
                "record": {"$ref": "https://link-to-commentor-record/1"},
                "relation": "commented",
            },
            {"record": {"$ref": "https://link-to-any-other-record/2"}},
        ]
    }
    data_record = faker.record("lit", data=data)
    result = LiteratureMetadataRawPublicSchemaV1().dump(data).data
    assert data["related_records"] == result["related_records"]


def test_literature_ui_schema():
    data_record = faker.record("lit")
    data_record_json = json.dumps(data_record)
    data = {"metadata": {"_ui_display": data_record_json}}
    expected_result = {"metadata": data_record}
    result = LiteratureSearchUISchemaV1().dump(data).data

    assert expected_result == result


def test_literature_ui_schema_missing_ui_display_field():
    data_record = faker.record("lit")
    data_record_json = json.dumps(data_record)
    data = {"metadata": {"NOT_A_UI_DISPLAY_FIELD": data_record_json}}
    expected_result = {"metadata": {}}
    result = LiteratureSearchUISchemaV1().dump(data).data

    assert expected_result == result


def test_literature_ui_schema_with_invalid_ui_display():
    data = {"metadata": {"_ui_display": "foo"}}
    expected_result = {"metadata": {}}
    result = LiteratureSearchUISchemaV1().dump(data).data

    assert expected_result == result
