# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker

from inspirehep.records.api import JobsRecord
from inspirehep.records.marshmallow.jobs import JobsMetadataRawFieldsSchemaV1


def test_jobs_serializer_should_serialize_whole_basic_record():
    schema = JobsMetadataRawFieldsSchemaV1()
    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/jobs.json",
        "_collections": ["Jobs"],
    }

    job = JobsRecord(faker.record("job"))
    result = schema.dump(job).data

    assert result == expected_result
