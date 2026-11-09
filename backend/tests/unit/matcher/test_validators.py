import json
from pathlib import Path

import pytest
from inspirehep.matcher.validators import (
    arxiv_eprints_validator,
    authors_titles_validator,
    cds_identifier_validator,
    default_validator,
    persistent_identifier_validator,
)


def load_fixture(name):
    return json.loads((Path(__file__).parent / "fixtures" / name).read_text())


def test_default_validator_is_not_very_exciting():
    assert default_validator(None, None)


def test_validator_matches_on_same_authors_and_titles():
    record = load_fixture("harvest_record_1601.02340.json")
    result = load_fixture("matching_result_1601.02340.json")

    assert authors_titles_validator(record, result)


def test_validator_no_match_on_similar_authors_different_titles():
    record = load_fixture("harvest_record_1804.09082.json")
    result = load_fixture("matching_wrong_result_1211.4028.json")

    assert not authors_titles_validator(record, result)


def test_validator_no_match_on_different_titles():
    record = load_fixture("harvest_record_1712.05946.json")
    result = load_fixture("matching_wrong_result_10.1103.json")

    assert not authors_titles_validator(record, result)


def test_cds_id_validator_matches_perfectlyh():
    record = load_fixture("harvest_record_2654944.json")
    result = load_fixture("matching_result_2654944.json")

    assert cds_identifier_validator(record, result)


def test_cds_identifier_mismatch_different_sources():
    record = load_fixture("harvest_record_2654944.json")
    result = load_fixture("matching_wrong_2654944.json")

    assert not cds_identifier_validator(record, result)


def test_persistent_identifier_validator():
    record = {"persistent_identifiers": [{"value": "10324/50675", "schema": "HDL"}]}

    result = {
        "_source": {
            "persistent_identifiers": [
                {"value": "10324/50675", "schema": "other"},
                {"value": "10324/50675", "schema": "HDL"},
            ]
        }
    }

    assert persistent_identifier_validator(record, result)


def test_persistent_identifier_validator_doesnt_validate_when_pid_entry_not_equal():
    record = {"persistent_identifiers": [{"value": "10324/50675", "schema": "HDL"}]}

    result = {
        "_source": {
            "persistent_identifiers": [{"value": "10324/50675", "schema": "other"}]
        }
    }

    assert not persistent_identifier_validator(record, result)


@pytest.mark.parametrize(
    ("expected", "record", "result"),
    [
        (
            False,
            {"arxiv_eprints": [{"value": "2101.12345"}]},
            {"_source": {"arxiv_eprints": [{"value": "2205.45423"}]}},
        ),
        (
            True,
            {"arxiv_eprints": [{"value": "2205.45423"}]},
            {"_source": {"arxiv_eprints": [{"value": "2205.45423"}]}},
        ),
        (
            True,
            {},
            {"_source": {"arxiv_eprints": [{"value": "2205.45423"}]}},
        ),
        (
            True,
            {"arxiv_eprints": [{"value": "2205.45423"}]},
            {"_source": {}},
        ),
        (
            True,
            {},
            {"_source": {}},
        ),
    ],
)
def test_arxiv_eprints_validator(expected, record, result):
    assert expected == arxiv_eprints_validator(record, result)
