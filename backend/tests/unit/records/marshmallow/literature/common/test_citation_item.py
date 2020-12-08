# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson

from inspirehep.records.marshmallow.literature.common import CitationItemSchemaV1


def test_returns_non_empty_fields():
    schema = CitationItemSchemaV1()
    dump = {
        "control_number": 123,
        "authors": [{"emails": ["big@chief.com"]}],
        "publication_info": {"journal_title": "Alias Investigations"},
        "titles": [{"title": "Jessica Jones"}],
        "collaborations": [{"value": "ATLAS Team"}, {"value": "CMS"}],
    }
    expected = {
        "control_number": 123,
        "authors": [{"emails": ["big@chief.com"]}],
        "publication_info": [{"journal_title": "Alias Investigations"}],
        "titles": [{"title": "Jessica Jones"}],
        "collaborations": [{"value": "CMS"}],
        "collaborations_with_suffix": [{"value": "ATLAS Team"}],
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_returns_max_10_authors():
    schema = CitationItemSchemaV1()
    dump = {
        "control_number": 123,
        "authors": [
            {"emails": ["big1@chief.com"]},
            {"emails": ["big2@chief.com"]},
            {"emails": ["big3@chief.com"]},
            {"emails": ["big4@chief.com"]},
            {"emails": ["big5@chief.com"]},
            {"emails": ["big6@chief.com"]},
            {"emails": ["big7@chief.com"]},
            {"emails": ["big8@chief.com"]},
            {"emails": ["big9@chief.com"]},
            {"emails": ["big10@chief.com"]},
            {"emails": ["big11@chief.com"]},
        ],
    }
    expected = {
        "control_number": 123,
        "authors": [
            {"emails": ["big1@chief.com"]},
            {"emails": ["big2@chief.com"]},
            {"emails": ["big3@chief.com"]},
            {"emails": ["big4@chief.com"]},
            {"emails": ["big5@chief.com"]},
            {"emails": ["big6@chief.com"]},
            {"emails": ["big7@chief.com"]},
            {"emails": ["big8@chief.com"]},
            {"emails": ["big9@chief.com"]},
            {"emails": ["big10@chief.com"]},
        ],
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_returns_non_empty_fields_if_some_fields_missing():
    schema = CitationItemSchemaV1()
    dump = {"control_number": 123}
    expected = {"control_number": 123}
    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
