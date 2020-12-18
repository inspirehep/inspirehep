# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.providers.faker import faker

from inspirehep.records.api import InstitutionsRecord
from inspirehep.records.marshmallow.institutions import InstitutionsElasticSearchSchema


def test_institutions_serializer_should_serialize_whole_basic_record():
    schema = InstitutionsElasticSearchSchema()

    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "_collections": ["Institutions"],
    }

    institution = faker.record("ins")
    result = schema.dump(institution).data

    assert result == expected_result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_institutions_serializer_populates_affiliation_suggest(
    mock_institution_literature_table,
):
    schema = InstitutionsElasticSearchSchema()
    data = {
        "ICN": ["ICN_VALUE"],
        "legacy_ICN": "Legacy icn value",
        "institution_hierarchy": [{"acronym": "ACR1", "name": "Name1"}],
        "name_variants": [{"value": "name1"}, {"value": "name2"}],
        "addresses": [{"postal_code": "12345"}, {"postal_code": "65432"}],
    }

    expected_result = {
        "input": [
            "ICN_VALUE",
            "ACR1",
            "Name1",
            "Legacy icn value",
            "name1",
            "name2",
            "12345",
            "65432",
        ]
    }
    institution = InstitutionsRecord(faker.record("ins", data))
    result = schema.dump(institution).data["affiliation_suggest"]

    assert result == expected_result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_icn(mock_institution_literature_table):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "ICN": ["CERN, Geneva"],
        "legacy_ICN": "CERN",
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["CERN, Geneva", "CERN"]}

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_institution_hierarchy_acronym(
    mock_institution_literature_table,
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "institution_hierarchy": [{"acronym": "CERN"}],
        "legacy_ICN": "CERN",
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["CERN", "CERN"]}

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_institution_hierarchy_name(
    mock_institution_literature_table,
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "institution_hierarchy": [
            {"name": "European Organization for Nuclear Research"}
        ],
        "legacy_ICN": "CERN",
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["European Organization for Nuclear Research", "CERN"]}

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_legacy_icn(
    mock_institution_literature_table,
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "legacy_ICN": "CERN",
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["CERN"]}

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_name_variants(
    mock_institution_literature_table,
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "legacy_ICN": "CERN",
        "name_variants": [{"value": "Centre Européen de Recherches Nucléaires"}],
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["CERN", "Centre Européen de Recherches Nucléaires"]}

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_name_variants_with_umr(
    mock_institution_literature_table,
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "legacy_ICN": "CERN",
        "name_variants": [
            {"value": "Centre Européen de Recherches Nucléaires"},
            {"value": "UMR 2454"},
            {"value": "umr 1234"},
            {"value": "umr"},
        ],
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {
        "input": [
            "CERN",
            "Centre Européen de Recherches Nucléaires",
            "UMR 2454",
            "umr 1234",
            "umr",
            "2454",
            "1234",
        ]
    }

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_from_postal_code(
    mock_institution_literature_table,
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "addresses": [{"postal_code": "1211"}],
        "legacy_ICN": "CERN",
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["CERN", "1211"]}

    assert expected == result


@mock.patch("inspirehep.records.api.institutions.InstitutionLiterature")
def test_populate_affiliation_suggest_to_ref(mock_institution_literature_table):
    data = {
        "$schema": "http://localhost:5000/schemas/records/institutions.json",
        "legacy_ICN": "CERN",
        "self": {"$ref": "http://localhost:5000/api/institutions/902725"},
    }
    record = InstitutionsRecord(faker.record("ins", data))

    schema = InstitutionsElasticSearchSchema()
    result = schema.dump(record).data["affiliation_suggest"]

    expected = {"input": ["CERN"]}

    assert expected == result
