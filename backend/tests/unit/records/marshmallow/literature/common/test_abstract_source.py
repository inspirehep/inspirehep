# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

import mock
from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureElasticSearchSchema


@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
@mock.patch(
    ("inspirehep.records.api.literature.LiteratureRecord.get_es_linked_references")
)
def test_abstract_source_full(
    mockget_linked_records_from_dict_field, mock_referenced_authors
):
    schema = LiteratureElasticSearchSchema
    data = {
        "abstracts": [
            {
                "source": "submitter",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            },
            {
                "source": "arXiv",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            },
        ]
    }
    record = faker.record("lit", data=data)
    expected_abstracts = deepcopy(data["abstracts"])
    expected_abstracts[0]["abstract_source_suggest"] = {"input": "submitter"}
    expected_abstracts[1]["abstract_source_suggest"] = {"input": "arXiv"}
    result = json.loads(schema().dumps(record).data)
    assert result["abstracts"] == expected_abstracts


@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
@mock.patch(
    ("inspirehep.records.api.literature.LiteratureRecord.get_es_linked_references")
)
def test_abstract_source_one_missing_source(
    mockget_linked_records_from_dict_field, mock_referenced_authors
):
    schema = LiteratureElasticSearchSchema
    data = {
        "abstracts": [
            {
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat."
            },
            {
                "source": "arXiv",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            },
        ]
    }
    record = faker.record("lit", data=data)
    expected_abstracts = deepcopy(data["abstracts"])
    expected_abstracts[1]["abstract_source_suggest"] = {"input": "arXiv"}
    result = json.loads(schema().dumps(record).data)
    assert result["abstracts"] == expected_abstracts


@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
@mock.patch(
    ("inspirehep.records.api.literature.LiteratureRecord.get_es_linked_references")
)
def test_abstract_source_missing(
    mockget_linked_records_from_dict_field, mock_referenced_authors
):
    schema = LiteratureElasticSearchSchema

    record = faker.record("lit")
    result = json.loads(schema().dumps(record).data)
    assert result.get("abstracts") is None


@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
@mock.patch(
    ("inspirehep.records.api.literature.LiteratureRecord.get_es_linked_references")
)
def test_abstract_source_one_only(
    mockget_linked_records_from_dict_field, mock_referenced_authors
):
    schema = LiteratureElasticSearchSchema
    data = {
        "abstracts": [
            {
                "source": "arXiv",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            }
        ]
    }
    record = faker.record("lit", data=data)
    expected_abstracts = deepcopy(data["abstracts"])
    expected_abstracts[0]["abstract_source_suggest"] = {"input": "arXiv"}
    result = json.loads(schema().dumps(record).data)
    assert result["abstracts"] == expected_abstracts
