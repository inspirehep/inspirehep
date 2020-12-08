# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson

from inspirehep.records.marshmallow.seminars.common.speaker import SpeakerSchemaV1


def test_speaker_with_first_and_last_name():
    schema = SpeakerSchemaV1()

    dump = {"name": "Castle, Frank"}
    expected = {"name": "Castle, Frank", "first_name": "Frank", "last_name": "Castle"}
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_speaker_without_last_name():
    schema = SpeakerSchemaV1()

    dump = {"name": "Frank Castle"}
    expected = {"name": "Frank Castle", "first_name": "Frank Castle"}
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_speaker():
    schema = SpeakerSchemaV1()

    dump = {
        "affiliations": [
            {
                "curated_relation": False,
                "record": {"$ref": "http://localhost:5000/institutions/12345"},
                "value": "University KA",
            },
            {
                "curated_relation": False,
                "record": {"$ref": "http://localhost:5000/institutions/12346"},
                "value": "University City",
            },
        ],
        "curated_relation": False,
        "ids": [
            {"schema": "SPIRES", "value": "HEPNAMES-73543"},
            {"schema": "SPIRES", "value": "HEPNAMES-368925"},
        ],
        "name": "Castle, Frank",
        "record": {"$ref": "http://localhost:5000/authors/12345"},
    }
    expected = {
        "affiliations": [
            {
                "curated_relation": False,
                "record": {"$ref": "http://localhost:5000/institutions/12345"},
                "value": "University KA",
            },
            {
                "curated_relation": False,
                "record": {"$ref": "http://localhost:5000/institutions/12346"},
                "value": "University City",
            },
        ],
        "curated_relation": False,
        "ids": [
            {"schema": "SPIRES", "value": "HEPNAMES-73543"},
            {"schema": "SPIRES", "value": "HEPNAMES-368925"},
        ],
        "name": "Castle, Frank",
        "record": {"$ref": "http://localhost:5000/authors/12345"},
        "first_name": "Frank",
        "last_name": "Castle",
    }
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
