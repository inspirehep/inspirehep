# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker

from inspirehep.records.api import ConferencesRecord
from inspirehep.records.marshmallow.conferences import (
    ConferencesMetadataRawFieldsSchemaV1,
)


def test_conference_serializer_should_serialize_whole_basic_record():
    schema = ConferencesMetadataRawFieldsSchemaV1()

    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/conferences.json",
        "_collections": ["Conferences"],
    }

    conference = ConferencesRecord(faker.record("con"))
    result = schema.dump(conference).data

    assert result == expected_result
