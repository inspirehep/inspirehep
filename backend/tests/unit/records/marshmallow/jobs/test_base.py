# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

from helpers.providers.faker import faker

from inspirehep.records.api import JobsRecord
from inspirehep.records.marshmallow.jobs.base import JobsPublicListSchema, JobsRawSchema


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


def test_jobs_api_serializer_doesent_return_reference_letters():
    data = {"emails": ["test.test.test@cern.ch", "test@cern.ch"]}
    job = faker.record("job", data={"reference_letters": data})
    result = JobsPublicListSchema().dumps(job).data
    result_data = json.loads(result)

    assert "reference_letters" not in result_data


def test_jobs_api_serializer_doesent_return_email_in_contact_details():
    data = [{"email": "test.test.test@cern.ch", "name": "Test, Contact",}]

    job = faker.record("job", data={"contact_details": data})
    result = JobsPublicListSchema().dumps(job).data
    result_data = json.loads(result)

    assert "emails" not in result_data["contact_details"]


def test_jobs_api_serializer_doesent_return_email_in_acquisition_source():
    acquisition_source = {
        "email": "test.test.test@cern.ch",
        "internal_uid": 60000,
        "method": "submitter",
        "orcid": "0000-0000-0000-0000",
        "source": "submitter",
        "submission_number": "None",
    }

    job = faker.record("job", data={"acquisition_source": acquisition_source})
    result = JobsPublicListSchema().dumps(job).data
    result_data = json.loads(result)

    assert "email" not in result_data["acquisition_source"]
