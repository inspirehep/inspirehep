# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.providers.faker import faker
from mock import patch

from inspirehep.records.marshmallow.literature import LiteratureElasticSearchSchema


@patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
def test_es_schema_removes_supervisors_from_authors(mock_referenced_authors):
    schema = LiteratureElasticSearchSchema()
    authors = [
        {"full_name": "Frank Castle"},
        {"full_name": "Jimmy", "inspire_roles": ["supervisor"]},
    ]
    data = {"authors": authors}
    data = faker.record("lit", data=data)
    expected_author = "Frank Castle"
    result = orjson.loads(schema.dumps(data).data)["authors"]
    assert len(result) == 1
    assert expected_author == result[0]["full_name"]


@patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
def test_es_schema_removes_supervisors_from_facet_author_name(mock_referenced_authors):
    schema = LiteratureElasticSearchSchema()
    authors = [
        {"full_name": "Frank Castle"},
        {"full_name": "Jimmy", "inspire_roles": ["supervisor"]},
    ]
    data = {"authors": authors}
    data = faker.record("lit", data=data)
    expected_facet_author_name = ["NOREC_Frank Castle"]
    result = orjson.loads(schema.dumps(data).data)["facet_author_name"]
    assert expected_facet_author_name == result
