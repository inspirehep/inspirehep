# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest

from inspirehep.disambiguation.utils import update_author_names


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
