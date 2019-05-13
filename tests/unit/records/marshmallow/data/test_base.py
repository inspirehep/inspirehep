# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker

from inspirehep.records.api import DataRecord
from inspirehep.records.marshmallow.data import DataMetadataRawFieldsSchemaV1


def test_data_serializer_should_serialize_whole_basic_record():
    schema = DataMetadataRawFieldsSchemaV1()

    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/data.json",
        "_collections": ["Data"],
    }

    data_record = DataRecord(faker.record("dat"))
    result = schema.dump(data_record).data

    assert result == expected_result
