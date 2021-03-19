# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.matcher.validators import (
    affiliations_validator,
    authors_validator,
    collaboration_validator,
)


def test_authors_validator_match_when_one_identifier_is_duplicated(inspire_app):
    lit_author = {
        "full_name": "Test Author",
        "ids": [{"schema": "WIKIPEDIA", "value": "T.Author.1"}],
    }
    matcher_result = {
        "_index": "test",
        "_type": "_doc",
        "_id": "2505d0ea-7c8f-45f1-b4dd-229f35315b1a",
        "_score": 0.2876821,
        "_source": {
            "ids": [
                {"schema": "INSPIRE BAI", "value": "T.Author.1"},
                {"schema": "WIKIPEDIA", "value": "T.Author.1"},
            ],
            "self": {"$ref": "http://localhost:5000/api/authors/123456813"},
        },
    }
    assert authors_validator(lit_author, matcher_result)


def test_authors_validator_match_when_identifiers_are_duplicated(inspire_app):
    lit_author = {
        "full_name": "Test Author",
        "ids": [
            {"schema": "WIKIPEDIA", "value": "T.Author.1"},
            {"schema": "SPIRES", "value": "T.Author.1"},
        ],
    }

    matcher_result = {
        "_index": "test",
        "_type": "_doc",
        "_id": "2505d0ea-7c8f-45f1-b4dd-229f35315b1a",
        "_score": 0.2876821,
        "_source": {
            "ids": [
                {"schema": "INSPIRE BAI", "value": "T.Author.1"},
                {"schema": "WIKIPEDIA", "value": "T.Author.1"},
            ],
            "self": {"$ref": "http://localhost:5000/api/authors/123456813"},
        },
    }
    assert authors_validator(lit_author, matcher_result)


def test_authors_validator_doesnt_match_when_id_is_from_incorrect_schema(
    inspire_app,
):
    lit_author = {
        "full_name": "Test Author",
        "ids": [
            {"schema": "SPIRES", "value": "T.Author.1"},
            {"schema": "ORCID", "value": "0000-1111-2222-3333"},
        ],
    }

    matcher_result = {
        "_index": "test",
        "_type": "_doc",
        "_id": "2505d0ea-7c8f-45f1-b4dd-229f35315b1a",
        "_score": 0.2876821,
        "_source": {
            "ids": [{"schema": "INSPIRE BAI", "value": "T.Author.1"}],
            "self": {"$ref": "http://localhost:5000/api/authors/123456813"},
        },
    }
    assert not authors_validator(lit_author, matcher_result)


def test_authors_validator_matches_when_id_is_from_correct_schema(inspire_app):
    lit_author = {
        "full_name": "Test Author",
        "ids": [{"schema": "LINKEDIN", "value": "T.Author.1"}],
    }

    matcher_result = {
        "_index": "test",
        "_type": "_doc",
        "_id": "2505d0ea-7c8f-45f1-b4dd-229f35315b1a",
        "_score": 0.2876821,
        "_source": {
            "ids": [
                {"schema": "LINKEDIN", "value": "T.Author.1"},
                {"schema": "SPIRES", "value": "HEPNAMES-400111"},
            ],
            "self": {"$ref": "http://localhost:5000/api/authors/123456813"},
        },
    }

    assert authors_validator(lit_author, matcher_result)


def test_collaboration_validator_validates_when_collaboration_match(inspire_app):
    author_data = {"collaborations": ["CMS"], "full_name": "John Smith"}
    result_data = {"_source": {"collaborations": [{"value": "CMS"}]}}
    assert collaboration_validator(author_data, result_data)


def test_collaboration_validator_doesnt_validate_when_collaboration_doesnt_match(
    inspire_app,
):
    author_data = {"collaborations": ["CMS"], "full_name": "John Smith"}
    result_data = {
        "_source": {"collaborations": [{"value": "CMS"}, {"value": "ATLAS"}]}
    }
    assert not collaboration_validator(author_data, result_data)


def test_affiliation_validator_doesnt_validate_when_affiliations_dont_match(
    inspire_app,
):
    author_data = {"full_name": "John Smith"}
    result_data = {
        "inner_hits": {
            "authors": {
                "hits": {
                    "hits": [
                        {
                            "_source": {
                                "affiliations": [
                                    {"value": "Warsaw U."},
                                    {"value": "Wasrsaw U. of Technology"},
                                ]
                            }
                        }
                    ]
                }
            }
        }
    }
    assert not affiliations_validator(author_data, result_data)


def test_affiliation_validator_validate_when_affiliations_match(inspire_app):
    author_data = {"affiliations": ["Warsaw U."], "full_name": "John Smith"}
    result_data = {
        "inner_hits": {
            "authors": {
                "hits": {
                    "hits": [{"_source": {"affiliations": [{"value": "Warsaw U."}]}}]
                }
            }
        }
    }
    assert affiliations_validator(author_data, result_data)
