# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureElasticSearchSchema


def test_es_schema_removes_supervisors_from_authors():
    schema = LiteratureElasticSearchSchema()
    authors = [
        {"full_name": "Frank Castle"},
        {"full_name": "Jimmy", "inspire_roles": ["supervisor"]},
    ]
    data = {"authors": authors}
    data = faker.record("lit", data=data)
    expected_author = "Frank Castle"
    result = json.loads(schema.dumps(data).data)["authors"]
    assert len(result) == 1
    assert expected_author == result[0]["full_name"]


def test_es_schema_removes_supervisors_from_facet_author_name():
    schema = LiteratureElasticSearchSchema()
    authors = [
        {"full_name": "Frank Castle"},
        {"full_name": "Jimmy", "inspire_roles": ["supervisor"]},
    ]
    data = {"authors": authors}
    data = faker.record("lit", data=data)
    expected_facet_author_name = ["NOREC_Frank Castle"]
    result = json.loads(schema.dumps(data).data)["facet_author_name"]
    assert expected_facet_author_name == result
