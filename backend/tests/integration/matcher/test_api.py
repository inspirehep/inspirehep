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
    exact_match_literature_data,
    fuzzy_match_literature_data,
    get_reference_from_grobid,
    match_reference,
    match_reference_control_numbers_with_relaxed_journal_titles,
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
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

    assert expected_control_number == result_control_number


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
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference, with_data_records=True
    )

    assert expected_control_number == result_control_number


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
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

    assert expected_control_number == result_control_number


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
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

    assert set(expected_control_number) == set(result_control_number)
    assert len(expected_control_number) == len(result_control_number)


def test_match_reference_on_reportnumber_has_lower_priority_than_dois(inspire_app):
    cited_record_with_report_number_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "report_numbers": [{"value": "CERN-100"}],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_with_report_number_json)

    cited_record_with_dois_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "dois": [{"value": "10.5281/zenodo.11020"}],
    }

    create_record("lit", cited_record_with_dois_json)

    reference = {
        "reference": {
            "report_numbers": ["CERN-100"],
            "dois": ["10.5281/zenodo.11020"],
        }
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([reference], subschema) is None
    reference = match_reference(reference)

    assert reference["record"]["$ref"] == "http://localhost:5000/api/literature/2"
    assert validate([reference], subschema) is None

    expected_control_number = [2, 1]
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

    assert set(expected_control_number) == set(result_control_number)
    assert len(expected_control_number) == len(result_control_number)


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
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

    assert expected_control_number == result_control_number


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

    expected_control_number = [1]
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

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
    reference = match_reference_control_numbers_with_relaxed_journal_titles(reference)
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

    assert match_result["any_link_modified"]
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

    assert not match_result["any_link_modified"]
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

    assert match_result["any_link_modified"]
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
    result_control_number = match_reference_control_numbers_with_relaxed_journal_titles(
        reference
    )

    assert expected_control_number == result_control_number


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


def test_match_references_doesnt_use_relaxed_title_matching(inspire_app):
    non_cited_record_with_pub_info_json = {
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
    create_record("lit", non_cited_record_with_pub_info_json)

    cited_record_with_pub_info_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "texkeys": ["Shaikh:2022ynt"],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record("lit", cited_record_with_pub_info_json)

    references = [
        {
            "reference": {
                "publication_info": {
                    "journal_title": "Phys. Rev.",
                    "journal_volume": "100",
                    "page_start": "100",
                },
                "texkey": "Shaikh:2022ynt",
            }
        }
    ]

    expected_ref = {"$ref": "http://localhost:5000/api/literature/2"}
    result = match_references(references)

    assert expected_ref == result["matched_references"][0]["record"]


def test_exact_match_literature_data_returns_matched_workflow(inspire_app):
    original_record_data = {
        "control_number": 4328,
        "dois": [{"value": "10.1007/s10714-022-02939-y", "source": "Springer"}],
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title"},
        ],
    }

    matched_record_data = {
        "control_number": 4328,
        "dois": [{"value": "10.1007/s10714-022-02939-y", "source": "Springer"}],
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title"},
        ],
    }
    matched_record = create_record("lit", matched_record_data)

    match = exact_match_literature_data(original_record_data)
    assert match
    assert matched_record["control_number"] in match


def test_exact_match_literature_data_returns_matched_many_workflows(inspire_app):
    original_record_data = {
        "dois": [{"value": "10.1007/s10714-022-02939-y", "source": "Springer"}],
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "persistent_identifiers": [
            {
                "value": "urn:nbn:hr:217:044391",
                "schema": "URN",
                "source": "U. Zagreb (main)",
            }
        ],
        "arxiv_eprints": [
            {"value": "2301.08708", "categories": ["gr-qc", "math-ph", "math.MP"]}
        ],
        "titles": [
            {"title": "title"},
        ],
    }

    matched_record_data = {
        "control_number": 432821,
        "dois": [{"value": "10.1007/s10714-022-02939-y", "source": "Springer"}],
        "persistent_identifiers": [
            {
                "value": "urn:nbn:hr:217:044391",
                "schema": "URN",
                "source": "U. Zagreb (main)",
            }
        ],
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title"},
        ],
    }
    matched_record_data_1 = {
        "control_number": 43282,
        "arxiv_eprints": [
            {"value": "2301.08708", "categories": ["gr-qc", "math-ph", "math.MP"]}
        ],
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title"},
        ],
    }
    matched_record = create_record("lit", matched_record_data)
    matched_record_1 = create_record("lit", matched_record_data_1)

    match = exact_match_literature_data(original_record_data)

    assert match
    assert matched_record["control_number"] in match
    assert matched_record_1["control_number"] in match


def test_exact_match_literature_data_no_match(inspire_app):
    original_record_data = {
        "control_number": 4328,
        "dois": [{"value": "10.1007/s10714-022-02939-y", "source": "Springer"}],
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title"},
        ],
    }

    another_record_data = {
        "control_number": 4328,
        "abstracts": [
            {
                "value": "abstract",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title"},
        ],
    }
    create_record("lit", another_record_data)

    match = exact_match_literature_data(original_record_data)
    assert not match


def test_fuzzy_workflow_match_without_math_ml_and_latex(inspire_app):
    correct_match = {
        "$schema": "https://inspirehep.net/schemas/records/hep.json",
        "_collections": ["Literature"],
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "document_type": ["article"],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
    }

    record_match_1 = create_record("lit", correct_match)

    incorrect_match = {
        "$schema": "https://inspirehep.net/schemas/records/hep.json",
        "_collections": ["Literature"],
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            },
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "document_type": ["article"],
        "abstracts": [
            {
                "value": 'Wrong content (<math altimg="si1.svg"><mi>a</mi><mi>N</mi><mi>T</mi><mi>G</mi><mi>C</mi></math>) via <math altimg="si2.svg"><mi>p</mi><mi>p</mi><mo stretchy="false">→</mo><mi>Z</mi><mi>Z</mi></math> production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. osite-sign leptons (electrons or muons) and the other one very very incorrect decayn the charge-parity (CP)-conserving couplings <math altimg="si3.svg"><msub><mrow><mi>C</mi></mrow><mrow><mover accent="true"><mrow><mi>B</mi></mrow><mrow><mo>˜</mo></mrow></mover><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and CP-violating couplings <math altimg="si4.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>W</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math>, <math altimg="si5.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and <math altimg="si6.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>B</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> achievedfakey fakesystem (<math altimg="si7.svg"><msubsup><mrow><mi>p</mi></mrow><mrow><mi>T</mi></mrow><mrow><mi>ℓ</mi><mi>ℓ</mi></mrow></msubsup></math>) are <math altimg="si8.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.042</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.042</mn><mo stretchy="false">]</mo></math>, <math altimg="si9.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.049</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.049</mn><mo stretchy="false">]</mo></math>, <math altimg="si10.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.048</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.048</mn><mo stretchy="false">]</mo></math>, and <math altimg="si11.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.047</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.047</mn><mo stretchy="false">]</mo></math> in units of TeV<sup loc="post">−4</sup>, respectively.',
                "source": "Elsevier B.V.",
            }
        ],
    }

    create_record("lit", incorrect_match)

    record = {
        "_collections": ["Literature"],
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            },
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "document_type": ["article"],
        "abstracts": [
            {
                "value": 'This paper presents the projections on the anomalous neutral triple gauge couplings (<math altimg="si1.svg"><mi>a</mi><mi>N</mi><mi>T</mi><mi>G</mi><mi>C</mi></math>) via <math altimg="si2.svg"><mi>p</mi><mi>p</mi><mo stretchy="false">→</mo><mi>Z</mi><mi>Z</mi></math> production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings <math altimg="si3.svg"><msub><mrow><mi>C</mi></mrow><mrow><mover accent="true"><mrow><mi>B</mi></mrow><mrow><mo>˜</mo></mrow></mover><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and CP-violating couplings <math altimg="si4.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>W</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math>, <math altimg="si5.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and <math altimg="si6.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>B</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system (<math altimg="si7.svg"><msubsup><mrow><mi>p</mi></mrow><mrow><mi>T</mi></mrow><mrow><mi>ℓ</mi><mi>ℓ</mi></mrow></msubsup></math>) are <math altimg="si8.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.042</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.042</mn><mo stretchy="false">]</mo></math>, <math altimg="si9.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.049</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.049</mn><mo stretchy="false">]</mo></math>, <math altimg="si10.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.048</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.048</mn><mo stretchy="false">]</mo></math>, and <math altimg="si11.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.047</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.047</mn><mo stretchy="false">]</mo></math> in units of TeV<sup loc="post">−4</sup>, respectively.',
                "source": "Elsevier B.V.",
            }
        ],
    }

    original_abstract = record_match_1["abstracts"][0]["value"]
    matches = fuzzy_match_literature_data(record)
    assert matches

    # assert the result with correct abstract comes as a first result
    assert matches[0]["control_number"] == record_match_1["control_number"]
    assert matches[0]["abstract"] == original_abstract


def test_workflow_matching(inspire_app):
    correct_match = {
        "$schema": "https://inspirehep.net/schemas/records/hep.json",
        "_collections": ["Literature"],
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "document_type": ["article"],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
        "arxiv_eprints": [{"categories": ["hep-lat"], "value": "1205.1659"}],
    }

    record_1 = create_record("lit", correct_match)

    incorrect_match = {
        "$schema": "https://inspirehep.net/schemas/records/hep.json",
        "_collections": ["Literature"],
        "titles": [
            {
                "title": "Blah Blah",
            },
        ],
        "authors": [
            {"full_name": "Yalmaz, Ali"},
        ],
        "document_type": ["article"],
        "abstracts": [
            {
                "value": 'This paper presents the projections on the anomalous neutral triple gauge couplings (<math altimg="si1.svg"><mi>a</mi><mi>N</mi><mi>T</mi><mi>G</mi><mi>C</mi></math>) via <math altimg="si2.svg"><mi>p</mi><mi>p</mi><mo stretchy="false">→</mo><mi>Z</mi><mi>Z</mi></math> production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings <math altimg="si3.svg"><msub><mrow><mi>C</mi></mrow><mrow><mover accent="true"><mrow><mi>B</mi></mrow><mrow><mo>˜</mo></mrow></mover><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and CP-violating couplings <math altimg="si4.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>W</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math>, <math altimg="si5.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and <math altimg="si6.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>B</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system (<math altimg="si7.svg"><msubsup><mrow><mi>p</mi></mrow><mrow><mi>T</mi></mrow><mrow><mi>ℓ</mi><mi>ℓ</mi></mrow></msubsup></math>) are <math altimg="si8.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.042</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.042</mn><mo stretchy="false">]</mo></math>, <math altimg="si9.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.049</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.049</mn><mo stretchy="false">]</mo></math>, <math altimg="si10.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.048</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.048</mn><mo stretchy="false">]</mo></math>, and <math altimg="si11.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.047</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.047</mn><mo stretchy="false">]</mo></math> in units of TeV<sup loc="post">−4</sup>, respectively.',
                "source": "Elsevier B.V.",
            }
        ],
        "arxiv_eprints": [
            {"categories": ["hep-ph", "astro-ph.CO"], "value": "1811.12764"}
        ],
    }

    incorrect_match = create_record("lit", incorrect_match)

    record = {
        "_collections": ["Literature"],
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            },
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "document_type": ["article"],
        "abstracts": [
            {
                "value": 'This paper presents the projections on the anomalous neutral triple gauge couplings (<math altimg="si1.svg"><mi>a</mi><mi>N</mi><mi>T</mi><mi>G</mi><mi>C</mi></math>) via <math altimg="si2.svg"><mi>p</mi><mi>p</mi><mo stretchy="false">→</mo><mi>Z</mi><mi>Z</mi></math> production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings <math altimg="si3.svg"><msub><mrow><mi>C</mi></mrow><mrow><mover accent="true"><mrow><mi>B</mi></mrow><mrow><mo>˜</mo></mrow></mover><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and CP-violating couplings <math altimg="si4.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>W</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math>, <math altimg="si5.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>W</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> and <math altimg="si6.svg"><msub><mrow><mi>C</mi></mrow><mrow><mi>B</mi><mi>B</mi></mrow></msub><mo stretchy="false">/</mo><msup><mrow><mi mathvariant="normal">Λ</mi></mrow><mrow><mn>4</mn></mrow></msup></math> achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system (<math altimg="si7.svg"><msubsup><mrow><mi>p</mi></mrow><mrow><mi>T</mi></mrow><mrow><mi>ℓ</mi><mi>ℓ</mi></mrow></msubsup></math>) are <math altimg="si8.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.042</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.042</mn><mo stretchy="false">]</mo></math>, <math altimg="si9.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.049</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.049</mn><mo stretchy="false">]</mo></math>, <math altimg="si10.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.048</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.048</mn><mo stretchy="false">]</mo></math>, and <math altimg="si11.svg"><mo stretchy="false">[</mo><mo linebreak="badbreak" linebreakstyle="after">−</mo><mspace width="0.2em"/><mn>0.047</mn><mo>,</mo><mspace width="0.2em"/><mspace width="0.2em"/><mo linebreak="badbreak" linebreakstyle="after">+</mo><mspace width="0.2em"/><mn>0.047</mn><mo stretchy="false">]</mo></math> in units of TeV<sup loc="post">−4</sup>, respectively.',
                "source": "Elsevier B.V.",
            }
        ],
        "arxiv_eprints": [{"categories": ["hep-lat"], "value": "1205.1659"}],
    }

    original_abstract = record["abstracts"][0]["value"]
    fuzzy_match_result = fuzzy_match_literature_data(record)
    assert fuzzy_match_result

    # assert the result with correct abstract and not with the incorrect one
    assert fuzzy_match_result[0]["control_number"] == record_1["control_number"]
    assert record["abstracts"][0]["value"] == original_abstract


def test_fuzzy_match_returns_control_number_if_one_match(inspire_app):
    record = {
        "control_number": 4328,
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
    }

    matched_record = {
        "control_number": 4328,
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
    }
    matched_record = create_record("lit", matched_record)
    matches = fuzzy_match_literature_data(record)

    assert len(matches) == 1
    assert matched_record["control_number"] == matches[0]["control_number"]


def test_fuzzy_match_returns_control_numbers_if_multiple_matches(inspire_app):
    record = {
        "control_number": 4328,
         "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
    }

    matched_record = {
        "control_number": 4328,
        "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
    }
    matched_record_2 = {
        "control_number": 43228,
         "titles": [
            {
                "title": "Search for the limits on anomalous neutral triple gauge couplings via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh",
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "abstracts": [
            {
                "value": "This paper presents the projections on the anomalous neutral triple gauge couplings via production in the 2ℓ2ν final state at a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh detector environments and its effects taken into account in the analysis. The study is carried out in the mode where one Z boson decays into a pair of same-flavor, opposite-sign leptons (electrons or muons) and the other one decays to the two neutrinos. The new bounds on the charge-parity (CP)-conserving couplings and CP-violating couplings and achieved at 95% Confidence Level (C.L.) using the transverse momentum of the dilepton system, respectively.",
                "source": "Elsevier B.V.",
            }
        ],
    }
    matched_record_1 = create_record("lit", matched_record)
    matched_record_2 = create_record("lit", matched_record_2)
    matches = fuzzy_match_literature_data(record)

    assert len(matches) == 2

    result_control_numbers = [match['control_number'] for match in matches]

    assert matched_record_1["control_number"] in result_control_numbers
    assert matched_record_2["control_number"] in result_control_numbers
