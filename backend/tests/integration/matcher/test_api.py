# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.utils import create_record
from inspire_schemas.api import load_schema, validate
from inspire_utils.record import get_value
from mock import patch

from inspirehep.matcher.api import (
    get_reference_from_grobid,
    match_reference_control_number,
)


@pytest.mark.vcr()
def test_grobid_with_match(inspire_app):
    query = "[27] K. P. Das and R. C. Hwa, Phys. Lett. B 68, 459 (1977);"

    expected = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys. Lett. B",
                "journal_volume": "68",
                "year": 1977,
            }
        }
    }
    result = get_reference_from_grobid(query)
    assert expected == result


@pytest.mark.vcr()
def test_grobid_without_match(inspire_app):
    query = "jessica"

    expected = None

    result = get_reference_from_grobid(query)
    assert expected == result


def test_match_reference_control_numbers_with_publication_info(inspire_app):
    """Test reference matcher for when inspire-matcher returns multiple matches
    where the matched record id is one of the previous matched record id as well"""

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "page_start": "223",
                "year": 2011,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_json)

    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "year": 2011,
            }
        }
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None

    reference = match_reference_control_number(reference)
    assert reference == 1


def test_match_reference_control_number_for_jcap_and_jhep_config(inspire_app):
    """Test reference matcher for the JCAP and JHEP configuration"""
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "045",
                "journal_title": "JHEP",
                "journal_volume": "06",
                "page_start": "045",
                "year": 2007,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_json)

    reference = {
        "reference": {
            "publication_info": {
                "artid": "045",
                "journal_title": "JHEP",
                "journal_volume": "06",
                "page_start": "045",
                "year": 2007,
            }
        }
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None

    reference = match_reference_control_number(reference)
    assert reference == 1


def test_match_reference_control_number_ignores_hidden_collections(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["HAL Hidden"],
        "control_number": 1,
        "document_type": ["article"],
        "dois": [{"value": "10.1371/journal.pone.0188398"}],
    }

    create_record("lit", cited_record_json)
    reference = {"reference": {"dois": ["10.1371/journal.pone.0188398"]}}

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference_control_number(reference)

    assert reference == None


def test_match_reference_control_number_ignores_deleted(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "deleted": True,
        "dois": [{"value": "10.1371/journal.pone.0188398"}],
    }

    create_record("lit", cited_record_json)

    reference = {"reference": {"dois": ["10.1371/journal.pone.0188398"]}}

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference_control_number(reference)

    assert reference == None


def test_match_reference_control_number_doesnt_touch_curated(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "dois": [{"value": "10.1371/journal.pone.0188398"}],
    }

    create_record("lit", cited_record_json)

    reference = {
        "curated_relation": True,
        "record": {"$ref": "http://localhost:5000/api/literature/42"},
        "reference": {"dois": ["10.1371/journal.pone.0188398"]},
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    control_number = match_reference_control_number(reference)
    assert control_number == None
