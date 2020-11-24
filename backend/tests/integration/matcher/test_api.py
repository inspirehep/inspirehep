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
    match_reference,
    match_reference_control_numbers,
    match_references,
)


@pytest.mark.vcr()
def test_grobid_with_match(inspire_app):
    query = "[27] K. P. Das and R. C. Hwa, Phys. Lett. B 68, 459 (1977);"

    expected = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys. Lett. B",
                "journal_volume": "68",
                "page_start": "459",
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


def test_match_reference_for_jcap_and_jhep_config(inspire_app):
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
    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/1"
    assert validate([reference], subschema) is None

    expected_control_number = [1]
    result_coontrol_number = match_reference_control_numbers(reference)

    assert expected_control_number == result_coontrol_number


def test_match_reference_for_data_config(inspire_app):
    """Test reference matcher for the JCAP and JHEP configuration"""

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/data.json",
        "_collections": ["Data"],
        "control_number": 1,
        "dois": [{"value": "10.5281/zenodo.11020"}],
    }

    create_record("dat", cited_record_json)

    reference = {
        "reference": {
            "dois": ["10.5281/zenodo.11020"],
            "publication_info": {"year": 2007},
        }
    }

    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/data/1"

    expected_control_number = [1]
    result_coontrol_number = match_reference_control_numbers(reference)

    assert expected_control_number == result_coontrol_number


def test_match_reference_on_texkey(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "texkeys": ["Giudice:2007fh"],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }
    create_record("lit", cited_record_json)

    reference = {"reference": {"texkey": "Giudice:2007fh"}}

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/1"
    assert validate([reference], subschema) is None

    expected_control_number = [1]
    result_coontrol_number = match_reference_control_numbers(reference)

    assert expected_control_number == result_coontrol_number


def test_match_reference_on_texkey_has_lower_priority_than_pub_info(inspire_app):
    cited_record_with_texkey_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "texkeys": ["MyTexKey:2008fh"],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_with_texkey_json)

    cited_record_with_pub_info_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "JHEP",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_with_pub_info_json)

    reference = {
        "reference": {
            "texkey": "MyTexKey:2008fh",
            "publication_info": {
                "artid": "100",
                "journal_title": "JHEP",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            },
        }
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/2"
    assert validate([reference], subschema) is None

    expected_control_number = [2, 1]
    result_coontrol_number = match_reference_control_numbers(reference)

    assert set(expected_control_number) == set(result_coontrol_number)
    assert len(expected_control_number) == len(result_coontrol_number)


def test_match_reference_ignores_hidden_collections(inspire_app):
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
    reference = match_reference(reference)

    assert "record" not in reference


def test_match_reference_ignores_deleted(inspire_app):
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
    reference = match_reference(reference)

    assert "record" not in reference


def test_match_reference_doesnt_touch_curated(inspire_app):
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
    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/42"

    expected_control_number = [42]
    result_coontrol_number = match_reference_control_numbers(reference)

    assert expected_control_number == result_coontrol_number


def test_match_pubnote_info_when_journal_is_missing_a_letter(inspire_app):
    cited_record_with_pub_info_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "101",
                "journal_title": "Phys. Rev. B.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_with_pub_info_json)

    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys. Rev.",
                "journal_volume": "100",
                "page_start": "100",
            }
        }
    }
    reference = match_reference(reference)
    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/1"

    expected_control_number = [1]
    result_control_number = match_reference_control_numbers(reference)

    assert expected_control_number == result_control_number


def test_match_pubnote_info_doesnt_match_when_only_journal_title_match(inspire_app):
    cited_record_with_pub_info_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 3,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. D.",
                "journal_volume": "101",
                "page_start": "101",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    create_record("lit", cited_record_with_pub_info_json)

    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys. Rev.",
                "journal_volume": "100",
                "page_start": "100",
            }
        }
    }
    reference = match_reference(reference)
    assert not reference.get("record")


def test_match_references_returns_five_references(inspire_app):
    cited_record_with_pub_info_json_1 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. D.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    create_record("lit", cited_record_with_pub_info_json_1)

    cited_record_with_pub_info_json_2 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. A.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    create_record("lit", cited_record_with_pub_info_json_2)

    cited_record_with_pub_info_json_3 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 3,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. B.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    create_record("lit", cited_record_with_pub_info_json_3)

    cited_record_with_pub_info_json_4 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 4,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. C.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    create_record("lit", cited_record_with_pub_info_json_4)

    cited_record_with_pub_info_json_5 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 5,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. E.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    cited_record_with_pub_info_json_6 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 6,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "100",
                "journal_title": "Phys. Rev. E.",
                "journal_volume": "100",
                "page_start": "100",
                "year": 2020,
            }
        ],
        "titles": [{"title": "A cool title"}],
    }

    create_record("lit", cited_record_with_pub_info_json_5)
    create_record("lit", cited_record_with_pub_info_json_6)

    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "Phys. Rev.",
                "journal_volume": "100",
                "page_start": "100",
            }
        }
    }
    reference = match_reference_control_numbers(reference)
    assert len(reference) == 5


def test_match_references_matches_when_multiple_match_if_same_as_previous(inspire_app):
    """Test reference matcher for when inspire-matcher returns multiple matches
    where the matched record id is one of the previous matched record id as well"""

    original_cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "159",
                "journal_title": "JHEP",
                "journal_volume": "03",
                "page_start": "159",
                "year": 2016,
            },
            {
                "artid": "074",
                "journal_title": "JHEP",
                "journal_volume": "05",
                "material": "erratum",
                "page_start": "074",
                "year": 2017,
            },
        ],
    }

    errata_cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "074",
                "journal_title": "JHEP",
                "journal_volume": "05",
                "material": "erratum",
                "page_start": "074",
                "year": 2017,
            }
        ],
    }

    create_record("lit", data=original_cited_record_json)
    create_record("lit", data=errata_cited_record_json)

    references = [
        {
            "reference": {
                "publication_info": {
                    "artid": "159",
                    "journal_title": "JHEP",
                    "journal_volume": "03",
                    "page_start": "159",
                    "year": 2016,
                }
            }
        },
        {
            "reference": {
                "publication_info": {
                    "artid": "074",
                    "journal_title": "JHEP",
                    "journal_volume": "05",
                    "page_start": "074",
                    "year": 2017,
                }
            }
        },
    ]

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate(references, subschema) is None

    match_result = match_references(references)
    matched_references = match_result["matched_references"]

    assert (
        matched_references[1]["record"]["$ref"]
        == "http://localhost:5000/api/literature/1"
    )
    assert validate(matched_references, subschema) is None

    assert match_result["any_link_modified"] == True
    assert match_result["added_recids"] == [1, 1]
    assert match_result["removed_recids"] == []


def test_match_references_no_match_when_multiple_match_different_from_previous(
    inspire_app,
):
    """Test reference matcher for when inspire-matcher returns multiple matches
    where the matched record id is not the same as the previous matched record id"""

    original_cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "159",
                "journal_title": "JHEP",
                "journal_volume": "03",
                "page_start": "159",
                "year": 2016,
            },
            {
                "artid": "074",
                "journal_title": "JHEP",
                "journal_volume": "05",
                "material": "erratum",
                "page_start": "074",
                "year": 2017,
            },
        ],
    }

    errata_cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "074",
                "journal_title": "JHEP",
                "journal_volume": "05",
                "material": "erratum",
                "page_start": "074",
                "year": 2017,
            }
        ],
    }

    create_record("lit", data=original_cited_record_json)
    create_record("lit", data=errata_cited_record_json)

    references = [
        {
            "reference": {
                "publication_info": {
                    "artid": "074",
                    "journal_title": "JHEP",
                    "journal_volume": "05",
                    "page_start": "074",
                    "year": 2017,
                }
            }
        }
    ]

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate(references, subschema) is None

    match_result = match_references(references)
    references = match_result["matched_references"]

    assert get_value(references[0], "record") is None
    assert validate(references, subschema) is None

    assert match_result["any_link_modified"] == False
    assert match_result["added_recids"] == []
    assert match_result["removed_recids"] == []


@patch(
    "inspirehep.matcher.api.match",
    return_value=[
        {
            "_score": 1.6650109,
            "_type": "hep",
            "_id": "AWRuwf9plgR0Y_yvhtt4",
            "_source": {"control_number": 1},
            "_index": "records-hep",
        },
        {
            "_score": 3.2345618,
            "_type": "hep",
            "_id": "AWRuwf9plgR0Y_yvhtt4",
            "_source": {"control_number": 1},
            "_index": "records-hep",
        },
    ],
)
def test_match_references_finds_match_when_repeated_record_with_different_scores(
    mocked_inspire_matcher_match, inspire_app
):
    references = [
        {
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
    ]

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate(references, subschema) is None

    match_result = match_references(references)
    references = match_result["matched_references"]

    assert len(references) == 1
    assert references[0]["record"]["$ref"] == "http://localhost:5000/api/literature/1"
    assert validate(references, subschema) is None

    assert match_result["any_link_modified"] == True
    assert match_result["added_recids"] == [1]
    assert match_result["removed_recids"] == []


def test_match_reference_finds_proper_ref_when_wrong_provided(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "texkeys": ["Giudice:2007fh"],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }
    create_record("lit", cited_record_json)

    reference = {
        "reference": {"texkey": "Giudice:2007fh"},
        "record": {"$ref": "http://localhost:5000/api/literature/9999"},
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/1"
    assert validate([reference], subschema) is None

    expected_control_number = [1]
    result_coontrol_number = match_reference_control_numbers(reference)

    assert expected_control_number == result_coontrol_number


def test_match_reference_not_returning_ref_key_when_no_reference_found(inspire_app):
    reference = {
        "reference": {"texkey": "Giudice:2007fh"},
        "record": {"$ref": "http://localhost:5000/api/literature/9999"},
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference(reference)

    assert "record" not in reference
    assert validate([reference], subschema) is None


def test_match_reference_not_returning_curated_relation_key_when_no_other_keys_exists(
    inspire_app
):
    reference = {
        "curated_relation": False,
        "record": {"$ref": "http://localhost:5000/api/literature/9999"},
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference(reference)

    assert reference == {}


def test_match_references_do_not_return_duplicated_empty_references(inspire_app):
    references = [
        {
            "curated_relation": False,
            "record": {"$ref": "http://localhost:5000/api/literature/9999"},
        },
        {
            "reference": {"texkey": "Giudice:2007fh"},
            "record": {"$ref": "http://localhost:5000/api/literature/8888"},
            "curated_relation": False,
        },
        {
            "record": {"$ref": "http://localhost:5000/api/literature/7777"},
            "curated_relation": False,
        },
    ]

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate(references, subschema) is None

    match_result = match_references(references)
    references = match_result["matched_references"]

    assert len(references) == 1
    assert validate(references, subschema) is None
