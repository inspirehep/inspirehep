# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json


from inspirehep.records.marshmallow.literature.common import (
    AuthorSchemaV1,
    AuthorsInfoSchemaForES,
)


def test_author():
    schema = AuthorSchemaV1()

    dump = {"full_name": "Castle, Frank"}
    expected = {
        "full_name": "Castle, Frank",
        "first_name": "Frank",
        "last_name": "Castle",
    }
    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_author_without_last_name():
    schema = AuthorSchemaV1()

    dump = {"full_name": "Frank Castle"}
    expected = {"full_name": "Frank Castle", "first_name": "Frank Castle"}
    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_author_with_with_inspire_roles():
    schema = AuthorSchemaV1()
    dump = {"full_name": "Smith, John", "inspire_roles": ["author"]}
    expected = {
        "full_name": "Smith, John",
        "first_name": "John",
        "last_name": "Smith",
        "inspire_roles": ["author"],
    }
    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_author_es_enchancement():
    schema = AuthorsInfoSchemaForES()

    dump = {"full_name": "Castle, Frank"}
    expected_name_variations = sorted(
        [
            "frank castle",
            "f, castle",
            "frank, castle",
            "f castle",
            "castle frank",
            "castle, f",
            "castle f",
            "castle",
            "castle, frank",
        ]
    )
    expected_name_suggest = sorted(
        [
            "frank castle",
            "f, castle",
            "frank, castle",
            "f castle",
            "castle frank",
            "castle, f",
            "castle f",
            "castle",
            "castle, frank",
        ]
    )

    result = json.loads(schema.dumps(dump).data)

    assert sorted(result["name_variations"]) == expected_name_variations
    assert "input" in result["name_suggest"]
    assert sorted(result["name_suggest"]["input"]) == expected_name_suggest


def test_author_es_enchancement_without_last_name():
    schema = AuthorsInfoSchemaForES()

    dump = {"full_name": "Frank Castle"}
    expected_name_variations = sorted(
        [
            "frank castle",
            "f, castle",
            "frank, castle",
            "f castle",
            "castle frank",
            "castle, f",
            "castle f",
            "castle",
            "castle, frank",
        ]
    )
    expected_name_suggest = sorted(
        [
            "frank castle",
            "f, castle",
            "frank, castle",
            "f castle",
            "castle frank",
            "castle, f",
            "castle f",
            "castle",
            "castle, frank",
        ]
    )

    result = json.loads(schema.dumps(dump).data)

    assert sorted(result["name_variations"]) == expected_name_variations
    assert "input" in result["name_suggest"]
    assert sorted(result["name_suggest"]["input"]) == expected_name_suggest
