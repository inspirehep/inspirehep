from unittest import mock

import pytest
from inspirehep.matcher.api import match


def test_match_raises_if_the_configuration_does_not_have_all_the_keys():
    config = {
        "doc_type": "hep",
        "index": "records-hep",
    }

    with pytest.raises(KeyError) as excinfo:
        list(match(None, config))
    assert "Malformed configuration" in str(excinfo.value)


def test_match_raises_if_one_step_of_the_algorithm_has_no_queries():
    config = {
        "algorithm": [
            {"validator": "inspirehep.matcher.validators:default_validator"},
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }

    with pytest.raises(KeyError) as excinfo:
        list(match(None, config))
    assert "Malformed algorithm" in str(excinfo.value)


@mock.patch("inspirehep.matcher.api.es", new_callable=mock.Mock)
def test_match_uses_the_given_validator_callable(es_mock):
    es_mock.search.return_value = {
        "hits": {
            "hits": {
                "dummy result",
            }
        }
    }
    dummy_validator = mock.Mock()
    dummy_validator.return_value = False

    config = {
        "algorithm": [
            {
                "queries": [
                    {
                        "type": "exact",
                        "path": "dummy.path",
                        "search_path": "dummy.search.path",
                    },
                ],
                "validator": dummy_validator,
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }

    record = {
        "dummy": {
            "path": "Non empty value",
        },
    }
    result = list(match(record, config))
    assert not result
    dummy_validator.assert_called_with(record, "dummy result")


def test_match_raises_if_one_query_does_not_have_a_type():
    config = {
        "algorithm": [
            {
                "queries": [
                    {},
                ],
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }

    with pytest.raises(
        ValueError, match="Malformed query. Query 0 of step 0 does not compile:"
    ) as excinfo:
        list(match(None, config))
    assert "Malformed query" in str(excinfo.value)


def test_match_raises_if_one_query_type_is_not_supported():
    config = {
        "algorithm": [
            {
                "queries": [
                    {"type": "not-supported"},
                ],
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }

    with pytest.raises(
        ValueError, match="Malformed query. Query 0 of step 0 does not compile:"
    ) as excinfo:
        list(match(None, config))
    assert "Malformed query" in str(excinfo.value)


def test_match_raises_if_an_exact_query_does_not_have_all_the_keys():
    config = {
        "algorithm": [
            {
                "queries": [
                    {
                        "search_path": "arxiv_eprints.value.raw",
                        "type": "exact",
                    },
                ],
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }

    with pytest.raises(
        ValueError, match="Malformed query. Query 0 of step 0 does not compile:"
    ) as excinfo:
        list(match(None, config))
    assert "Malformed query" in str(excinfo.value)


def test_match_raises_on_invalid_collections():
    config = {
        "algorithm": [
            {
                "queries": [
                    {
                        "search_path": "arxiv_eprints.value.raw",
                        "path": "arxiv_eprints.value",
                        "type": "exact",
                    },
                ],
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
        "collections": "Literature",
    }

    with pytest.raises(
        ValueError,
        match="Malformed collections. Expected a list of strings bug got: 'Literature'",
    ) as excinfo:
        list(match(None, config))
    assert "Malformed collections" in str(excinfo.value)


@mock.patch("inspirehep.matcher.api.es", new_callable=mock.Mock)
def test_validator_list(es_mock):
    es_mock.search.return_value = {
        "hits": {
            "hits": {
                "dummy result",
            }
        }
    }

    dummy_validator_1 = mock.Mock()
    dummy_validator_1.return_value = True
    dummy_validator_2 = mock.Mock()
    dummy_validator_2.return_value = True

    config = {
        "algorithm": [
            {
                "queries": [
                    {
                        "type": "exact",
                        "path": "dummy.path",
                        "search_path": "dummy.search.path",
                    },
                ],
                "validator": [dummy_validator_1, dummy_validator_2],
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }
    record = {
        "dummy": {
            "path": "Non empty value",
        },
    }

    result = list(match(record, config))
    assert "dummy result" in result
    dummy_validator_1.assert_called_with(record, "dummy result")
    dummy_validator_2.assert_called_with(record, "dummy result")


def test_match_raises_if_inner_hits_param_has_wrong_config():
    config = {
        "algorithm": [
            {
                "queries": [
                    {
                        "paths": ["first_name", "last_name"],
                        "search_paths": ["authors.first_name", "authors.last_name"],
                        "type": "nested",
                        "inner_hits": {"not_existing_argument": ["authors.record"]},
                    },
                ],
            },
        ],
        "doc_type": "hep",
        "index": "records-hep",
    }

    with pytest.raises(
        ValueError, match="Malformed query. Query 0 of step 0 does not compile:"
    ) as excinfo:
        list(match(None, config))
    assert "Malformed query" in str(excinfo.value)
