# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest

from inspirehep.disambiguation.utils import (
    reorder_lit_author_names,
    update_author_names,
)


def test_update_author_names():
    author = {
        "name": {"value": "NEW AUTHOR"},
        "_collections": ["Authors"],
        "$schema": "http://localhost:5000/schemas/record/authors.json",
    }
    signatures = [
        {"full_name": "Doe, John"},
        {"full_name": "Mason, Jane"},
        {"full_name": "longest name in the list"},
    ]
    result_author = update_author_names(author, signatures)

    expected_author = {
        "name": {
            "value": "longest name in the list",
            "name_variants": ["Mason, Jane", "Doe, John"],
        },
        "_collections": ["Authors"],
        "$schema": "http://localhost:5000/schemas/record/authors.json",
    }
    assert expected_author == result_author


def test_update_author_names_doesnt_put_duplicate_name_variants():
    author = {
        "name": {"value": "NEW AUTHOR"},
        "_collections": ["Authors"],
        "$schema": "http://localhost:5000/schemas/record/authors.json",
    }
    signatures = [{"full_name": "Doe, John"}, {"full_name": "Doe, John"}]
    result_author = update_author_names(author, signatures)

    expected_author = {
        "name": {"value": "Doe, John"},
        "_collections": ["Authors"],
        "$schema": "http://localhost:5000/schemas/record/authors.json",
    }
    assert expected_author == result_author


@pytest.mark.parametrize(
    "lit_author_name,author_name,expected_normalized_name",
    [
        ("Smith, John Davis", "Smith Davis, John", "Smith Davis, John"),
        ("Smith, John Davis Aaron", "Smith Davis, John", "Smith Davis, John Aaron"),
        ("Qin, Qin", "Qin, Qin", "Qin, Qin"),
        ("Deiana, Allison Mccarn", "Deiana, Allison McCarn", "Deiana, Allison Mccarn"),
        ("Fayyazuddin", "Fayyazuddin", "Fayyazuddin"),
    ],
)
def test_reorder_lit_author_names(
    lit_author_name, author_name, expected_normalized_name
):
    assert expected_normalized_name == reorder_lit_author_names(
        lit_author_name, author_name
    )
