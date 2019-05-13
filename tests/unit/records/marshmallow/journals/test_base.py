# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

from helpers.providers.faker import faker

from inspirehep.records.api import JournalsRecord
from inspirehep.records.marshmallow.journals import JournalsMetadataRawFieldsSchemaV1


def test_journals_serializer_should_serialize_whole_basic_record():
    schema = JournalsMetadataRawFieldsSchemaV1()

    data = faker.record("jou")
    expected_result = deepcopy(data)
    title_suggest = {"input": [data["journal_title"]["title"], data["short_title"]]}
    expected_result["title_suggest"] = title_suggest

    conference = JournalsRecord(data)
    result = schema.dump(conference).data

    assert result == expected_result


def test_journals_serializer_populates_title_suggest():
    schema = JournalsMetadataRawFieldsSchemaV1()
    data = {"title_variants": ["title_variant1", "title_variant2"]}

    data = faker.record("jou", data)

    expected_result = {
        "input": [
            data["journal_title"]["title"],
            data["short_title"],
            data["title_variants"][0],
            data["title_variants"][1],
        ]
    }
    institution = JournalsRecord(data)
    result = schema.dump(institution).data["title_suggest"]

    assert result == expected_result


def test_populate_title_suggest_with_all_inputs():
    data = {
        "$schema": "http://localhost:5000/schemas/records/journals.json",
        "journal_title": {"title": "The Journal of High Energy Physics (JHEP)"},
        "short_title": "JHEP",
        "title_variants": ["JOURNAL OF HIGH ENERGY PHYSICS"],
    }
    record = JournalsRecord(faker.record("jou", data))
    marshmallow_schema = JournalsMetadataRawFieldsSchemaV1()
    result = marshmallow_schema.dump(record).data["title_suggest"]
    expected = {
        "input": [
            "The Journal of High Energy Physics (JHEP)",
            "JHEP",
            "JOURNAL OF HIGH ENERGY PHYSICS",
        ]
    }

    assert expected == result
