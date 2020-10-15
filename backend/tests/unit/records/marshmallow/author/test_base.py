# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.authors import (
    AuthorsAdminSchema,
    AuthorsOnlyControlNumberSchema,
    AuthorsPublicListSchema,
    AuthorsPublicSchema,
)


def test_public_schema_does_not_return_hidden_emails():
    schema = AuthorsPublicSchema()
    data = {
        "email_addresses": [
            {"value": "public@cern.ch"},
            {"value": "private@cern.ch", "hidden": True},
        ]
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_emails = [{"value": "public@cern.ch"}]

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert result_data["email_addresses"] == expected_emails


def test_public_schema_excludes_private_notes():
    schema = AuthorsPublicSchema()
    data = {"_private_notes": [{"value": "Super private note about the author"}]}
    author = faker.record("aut", data=data, with_control_number=True)

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert "_private_notes" not in result_data


def test_admin_schema_returns_all_emails():
    schema = AuthorsAdminSchema()
    data = {
        "email_addresses": [
            {"value": "public@cern.ch"},
            {"value": "private@cern.ch", "hidden": True},
        ]
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_emails = [
        {"value": "public@cern.ch"},
        {"value": "private@cern.ch", "hidden": True},
    ]

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert result_data["email_addresses"] == expected_emails


def test_only_control_number_schema_ignores_other_fields():
    schema = AuthorsOnlyControlNumberSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_result = {"control_number": author["control_number"]}

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert result_data == expected_result


def test_authors_api_schema_doesnt_return_acquisition_source_email():
    schema = AuthorsPublicListSchema()
    data = {
        "acquisition_source": {
            "orcid": "0000-0000-0000-0000",
            "email": "test@test.ch",
            "submission_number": "12312341",
        }
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_result = {"orcid": "0000-0000-0000-0000", "submission_number": "12312341"}

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert result_data["acquisition_source"] == expected_result


def test_authors_api_schema_doesnt_return_emails_adresses():
    schema = AuthorsPublicListSchema()
    data = {
        "email_addresses": [
            {"value": "test@test.edu", "current": True},
            {"value": "test1@test1.edu", "hidden": True, "current": False},
            {"value": "test2@test2.edu", "hidden": True, "current": False},
        ]
    }
    author = faker.record("aut", data=data, with_control_number=True)

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert "email_adresses" not in result_data
