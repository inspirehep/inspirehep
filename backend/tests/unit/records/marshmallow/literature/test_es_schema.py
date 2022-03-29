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
@patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_cv_format",
    return_value=[],
)
def test_es_schema_removes_supervisors_from_authors(
    mock_referenced_authors, mock_cv_format
):
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
@patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_cv_format",
    return_value=[],
)
def test_es_schema_removes_supervisors_from_facet_author_name(
    mock_referenced_authors, mock_cv_format
):
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


@patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
@patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_cv_format",
    return_value=[],
)
@patch("inspirehep.records.marshmallow.literature.ui.current_app")
@patch("inspirehep.records.marshmallow.literature.ui.current_s3_instance")
def test_es_schema_removes_fulltext_fields_from_ui_display(
    mock_referenced_authors, mock_cv_format, current_s3_mock, current_app_mock
):
    current_app_mock.config = {"FEATURE_FLAG_ENABLE_FILES": True}
    schema = LiteratureElasticSearchSchema()
    entry_data = {
        "documents": [
            {
                "source": "arxiv",
                "fulltext": True,
                "key": "new_doc.pdf",
                "url": "http://www.africau.edu/images/default/sample.pdf",
                "text": "asdfsdfbajabjbasdasdasd=",
                "attachment": {"content": "this is a text"},
            }
        ]
    }
    serialized = schema.dump(entry_data).data
    result = orjson.loads(schema.dumps(serialized).data)["_ui_display"]
    assert '"attachment":' not in result
    assert '"text": ' not in result
