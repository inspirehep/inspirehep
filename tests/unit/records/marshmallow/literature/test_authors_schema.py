# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureAuthorsMetadataSchemaV1


def test_authors_schema():
    schema = LiteratureAuthorsMetadataSchemaV1()
    authors = [
        {"full_name": "Frank Castle"},
        {"full_name": "Smith, John", "inspire_roles": ["author"]},
        {"full_name": "Black, Joe Jr.", "inspire_roles": ["editor"]},
        {"full_name": "Jimmy", "inspire_roles": ["supervisor"]},
    ]
    collaborations = [{"value": "LHCb"}]
    data = {"authors": authors, "collaborations": collaborations}
    data = faker.record("lit", data=data)
    expected = {
        "authors": [
            {"full_name": "Frank Castle", "first_name": "Frank Castle"},
            {
                "full_name": "Smith, John",
                "first_name": "John",
                "last_name": "Smith",
                "inspire_roles": ["author"],
            },
            {
                "full_name": "Black, Joe Jr.",
                "first_name": "Joe Jr.",
                "last_name": "Black",
                "inspire_roles": ["editor"],
            },
            {
                "full_name": "Jimmy",
                "first_name": "Jimmy",
                "inspire_roles": ["supervisor"],
            },
        ],
        "collaborations": [{"value": "LHCb"}],
    }
    result = json.loads(schema.dumps(data).data)
    assert expected == result


def test_authors_schema_without_authors():
    schema = LiteratureAuthorsMetadataSchemaV1()

    collaborations = [{"value": "LHCb"}]
    data = {"collaborations": collaborations}
    data = faker.record("lit", data=data)

    expected = {"collaborations": [{"value": "LHCb"}]}
    result = json.loads(schema.dumps(data).data)
    assert expected == result


def test_authors_schema_without_authors_and_collaborations():
    schema = LiteratureAuthorsMetadataSchemaV1()
    data = faker.record("lit")
    expected = {"authors": [], "collaborations": []}
    result = json.loads(schema.dumps(data).data)
    assert expected == result
