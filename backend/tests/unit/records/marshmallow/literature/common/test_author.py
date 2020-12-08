# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson

from inspirehep.records.marshmallow.literature.common import (
    AuthorSchemaV1,
    AuthorsInfoSchemaForES,
)
from inspirehep.records.marshmallow.literature.common.author import (
    FirstAuthorSchemaV1,
    SupervisorSchema,
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

    assert expected == orjson.loads(result)


def test_author_without_last_name():
    schema = AuthorSchemaV1()

    dump = {"full_name": "Frank Castle"}
    expected = {"full_name": "Frank Castle", "first_name": "Frank Castle"}
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_author_with_bai():
    schema = AuthorSchemaV1()

    dump = {
        "full_name": "Frank Castle",
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    expected = {
        "full_name": "Frank Castle",
        "first_name": "Frank Castle",
        "bai": "Frank.Castle.1",
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


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

    assert expected == orjson.loads(result)


def test_author_es_enchancement():
    schema = AuthorsInfoSchemaForES()

    dump = {"full_name": "Castle, Frank"}
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

    result = orjson.loads(schema.dumps(dump).data)

    assert "input" in result["name_suggest"]
    assert sorted(result["name_suggest"]["input"]) == expected_name_suggest


def test_author_es_enchancement_without_last_name():
    schema = AuthorsInfoSchemaForES()

    dump = {"full_name": "Frank Castle"}
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

    result = orjson.loads(schema.dumps(dump).data)

    assert "input" in result["name_suggest"]
    assert sorted(result["name_suggest"]["input"]) == expected_name_suggest


def test_author_schema_returns_empty_for_supervisor():
    schema = AuthorSchemaV1()
    dump = {"full_name": "Smith, John", "inspire_roles": ["supervisor"]}
    result = schema.dumps(dump).data

    assert orjson.loads(result) == {}


def test_supervisor_schema():
    schema = SupervisorSchema()
    dump = {"full_name": "Smith, John", "inspire_roles": ["supervisor"]}
    expected = {
        "full_name": "Smith, John",
        "first_name": "John",
        "last_name": "Smith",
        "inspire_roles": ["supervisor"],
    }
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_supervisor_schema_returns_empty_for_non_supervisor():
    schema = SupervisorSchema()
    dump = {"full_name": "Smith, John", "inspire_roles": ["author"]}
    result = schema.dumps(dump).data

    assert orjson.loads(result) == {}


def test_first_author():
    schema = FirstAuthorSchemaV1()

    dump = {
        "ids": [{"schema": "INSPIRE BAI", "value": "Benjamin.P.Abbott.1"}],
        "record": {"$ref": "http://labs.inspirehep.net/api/authors/1032336"},
        "recid": 1032336,
        "raw_affiliations": [
            {
                "value": "LIGO - California Institute of Technology - Pasadena - CA 91125 - USA"
            }
        ],
        "affiliations": [
            {
                "record": {
                    "$ref": "http://labs.inspirehep.net/api/institutions/908529"
                },
                "value": "LIGO Lab., Caltech",
            }
        ],
        "signature_block": "ABATb",
        "uuid": "7662251b-47d4-4083-b44b-ce8a0112fd7b",
        "full_name": "Abbott, B.P.",
    }
    expected = {
        "last_name": "Abbott",
        "full_name": "Abbott, B.P.",
        "first_name": "B.P.",
        "recid": 1032336,
        "ids": [{"schema": "INSPIRE BAI", "value": "Benjamin.P.Abbott.1"}],
    }
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
