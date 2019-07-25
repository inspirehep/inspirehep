# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.api import JobsRecord
from inspirehep.records.marshmallow.jobs.base import JobsRawSchema


def test_jobs_serializer_should_serialize_whole_basic_record():
    schema = JobsRawSchema()
    data = {
        "$schema": "http://localhost:5000/schemas/records/jobs.json",
        "_collections": ["Jobs"],
        "deadline_date": "1996-11-15",
        "description": "Join us!",
        "position": "staff",
        "regions": ["Europe"],
        "status": "closed",
    }

    job = JobsRecord(data)
    result = schema.dump(job).data

    assert result == data
