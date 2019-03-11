# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import mock
from inspire_schemas.api import load_schema, validate
from marshmallow import Schema, fields

from inspirehep.records.api import InspireRecord
from inspirehep.records.marshmallow.literature.common import ReferenceItemSchemaV1


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_non_empty_fields(mock_get_linked_records_in_field):
    schema = ReferenceItemSchemaV1()
    dump = {
        "reference": {
            "label": "123",
            "authors": [{"full_name": "Jessica, Jones"}],
            "publication_info": {"journal_title": "Alias Investigations"},
            "title": {"title": "Jessica Jones"},
            "arxiv_eprint": "1207.7214",
            "dois": ["10.1016/j.physletb.2012.08.020"],
            "urls": [
                {"value": "http://www.claymath.org/prize-problems"},
                {"value": "http://www.arthurjaffe.com"},
            ],
            "collaborations": ["CMS", "ATLAS Team"],
        }
    }
    expected = {
        "label": "123",
        "authors": [
            {
                "first_name": "Jones",
                "full_name": "Jessica, Jones",
                "last_name": "Jessica",
            }
        ],
        "publication_info": [{"journal_title": "Alias Investigations"}],
        "titles": [{"title": "Jessica Jones"}],
        "arxiv_eprint": [{"value": "1207.7214"}],
        "dois": [{"value": "10.1016/j.physletb.2012.08.020"}],
        "urls": [
            {"value": "http://www.claymath.org/prize-problems"},
            {"value": "http://www.arthurjaffe.com"},
        ],
        "collaborations": [{"value": "CMS"}],
        "collaborations_with_suffix": [{"value": "ATLAS Team"}],
    }

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_forces_collaborations_to_be_object_if_reference_not_linked(
    mock_get_linked_records_in_field
):
    schema = ReferenceItemSchemaV1()
    dump = {"reference": {"collaborations": ["CMS", "LHCb"]}}
    expected = {"collaborations": [{"value": "CMS"}, {"value": "LHCb"}]}

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_forces_collaborations_to_be_object_if_reference_not_linked_with_many_true(
    mock_get_linked_records_in_field
):
    class TestSchema(Schema):
        references = fields.Nested(ReferenceItemSchemaV1, dump_only=True, many=True)

    schema = TestSchema()
    dump = {"references": [{"reference": {"collaborations": ["CMS", "LHCb"]}}]}
    expected = {
        "references": [{"collaborations": [{"value": "CMS"}, {"value": "LHCb"}]}]
    }

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_empty_if_no_reference_or_record_field(
    mock_get_linked_records_in_field
):
    schema = ReferenceItemSchemaV1()
    dump = {}
    expected = {}

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_empty_if_empty_reference_or_record_field(
    mock_get_linked_records_in_field
):
    schema = ReferenceItemSchemaV1()
    dump = {"record": {}, "reference": {}}
    expected = {}

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_non_empty_fields_if_some_fields_missing(
    mock_get_linked_records_in_field
):
    schema = ReferenceItemSchemaV1()
    dump = {"reference": {"label": "123", "control_number": 123}}
    expected = {"label": "123", "control_number": 123}

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_no_misc_if_title_persent(mock_get_linked_records_in_field):
    hep_schema = load_schema("hep")
    subschema = hep_schema["properties"]["references"]
    schema = ReferenceItemSchemaV1()
    dump = {"reference": {"title": {"title": "Jessica Jones"}, "misc": ["A Misc"]}}
    expected = {"titles": [{"title": "Jessica Jones"}]}

    assert validate([dump], subschema) is None

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_no_misc_if_titles_persent_in_the_resolved_record(
    mock_get_linked_records_in_field
):
    mock_get_linked_records_in_field.return_value = [
        InspireRecord(
            {
                "control_number": 123,
                "titles": [
                    {
                        "source": "arXiv",
                        "title": "Theoretical limit of residual amplitude modulation in electro-optic modulators",  # noqa
                    },
                    {
                        "source": "arXiv",
                        "title": "Fundamental level of residual amplitude modulation in phase modulation processes",  # noqa
                    },
                ],
            }
        )
    ]

    hep_schema = load_schema("hep")
    subschema = hep_schema["properties"]["references"]
    schema = ReferenceItemSchemaV1()
    dump = {
        "record": {"$ref": "http://localhost:5000/api/literature/123"},
        "reference": {"label": "123", "misc": ["A misc"]},
    }
    assert validate([dump], subschema) is None

    result = schema.dumps(dump).data
    assert "misc" not in json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_only_first_misc(mock_get_linked_records_in_field):
    hep_schema = load_schema("hep")
    subschema = hep_schema["properties"]["references"]
    schema = ReferenceItemSchemaV1()

    dump = {"reference": {"label": "123", "misc": ["A Misc", "Another Misc"]}}

    expected = {"label": "123", "misc": "A Misc"}
    assert validate([dump], subschema) is None

    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_dois_from_the_resolved_record(mock_get_linked_records_in_field):
    mock_get_linked_records_in_field.return_value = [
        InspireRecord(
            {"control_number": 123, "dois": [{"value": "10.1103/PhysRevD.94.054021"}]}
        )
    ]

    hep_schema = load_schema("hep")
    subschema = hep_schema["properties"]["references"]
    schema = ReferenceItemSchemaV1()
    dump = {"record": {"$ref": "http://localhost:5000/api/literature/123"}}
    assert validate([dump], subschema) is None

    expected = {
        "control_number": 123,
        "dois": [{"value": "10.1103/PhysRevD.94.054021"}],
    }
    result = schema.dumps(dump).data
    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.reference_item"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_arxiv_eprints_from_the_resolved_record(
    mock_get_linked_records_in_field
):
    mock_get_linked_records_in_field.return_value = [
        InspireRecord(
            {
                "control_number": 123,
                "arxiv_eprints": [{"value": "1606.09129", "categories": "hep"}],
            }
        )
    ]

    hep_schema = load_schema("hep")
    subschema = hep_schema["properties"]["references"]
    schema = ReferenceItemSchemaV1()
    dump = {"record": {"$ref": "http://localhost:5000/api/literature/123"}}
    assert validate([dump], subschema) is None

    expected = {"control_number": 123, "arxiv_eprint": [{"value": "1606.09129"}]}
    result = schema.dumps(dump).data
    assert expected == json.loads(result)
