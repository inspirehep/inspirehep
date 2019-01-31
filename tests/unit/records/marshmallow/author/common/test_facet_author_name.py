# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from inspire_schemas.api import load_schema, validate

from inspirehep.records.marshmallow.authors.common import FacetAuthorNameSchemaV1


def test_facet_author_name_with_preferred_name():
    schema = FacetAuthorNameSchemaV1()
    author = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }

    expected_result = {"facet_author_name": "John.Doe.1_J Doe"}

    result = schema.dumps(author).data

    assert expected_result == json.loads(result)


def test_facet_author_name_without_preferred_name():
    schema = FacetAuthorNameSchemaV1()
    author = {
        "name": {"value": "Doe, John"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }

    expected_result = {"facet_author_name": "John.Doe.1_John Doe"}

    result = schema.dumps(author).data

    assert expected_result == json.loads(result)


def test_facet_author_name_without_ids():
    schema = FacetAuthorNameSchemaV1()
    author = {"name": {"value": "Doe, John"}}

    expected_result = {"facet_author_name": "BAI_John Doe"}

    result = schema.dumps(author).data

    assert expected_result == json.loads(result)
