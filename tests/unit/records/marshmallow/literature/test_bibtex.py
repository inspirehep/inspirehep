#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest

from inspirehep.records.marshmallow.literature.bibtex import BibTexCommonSchema
from inspire_schemas.api import load_schema, validate


def test_get_author_by_role():
    test_record = {
        "authors": [
            {"full_name": "Kiritsis, Elias", "inspire_roles": ["editor"]},
            {"full_name": "Nitti, Francesco", "inspire_roles": ["author"]},
            {"full_name": "Pimenta, Leandro Silva"},
        ]
    }
    expected = ["Nitti, Francesco", "Pimenta, Leandro Silva"]
    result = BibTexCommonSchema.get_authors_with_role(test_record["authors"], "author")
    assert expected == result


def test_get_editor_by_role():
    test_record = {
        "authors": [
            {"full_name": "Kiritsis, Elias", "inspire_roles": ["editor"]},
            {"full_name": "Nitti, Francesco", "inspire_roles": ["author"]},
        ]
    }
    expected = ["Kiritsis, Elias"]
    result = BibTexCommonSchema.get_authors_with_role(
        test_record.get("authors"), "editor"
    )
    assert expected == result


def test_bibtex_document_type():
    test_record = {
        "document_type": ["thesis"],
        "thesis_info": {"degree_type": "master"},
    }
    expected = "mastersthesis"
    result = BibTexCommonSchema.get_bibtex_document_type(test_record)
    assert expected == result


def test_bibtex_document_type_recognizes_phd_theses():
    schema = load_schema("hep")
    document_type_schema = schema["properties"]["document_type"]
    thesis_info_schema = schema["properties"]["thesis_info"]

    record = {"document_type": ["thesis"], "thesis_info": {"degree_type": "phd"}}
    assert validate(record["document_type"], document_type_schema) is None
    assert validate(record["thesis_info"], thesis_info_schema) is None

    expected = "phdthesis"
    result = BibTexCommonSchema.get_bibtex_document_type(record)

    assert expected == result


def test_bibtex_document_type_handles_missing_thesis_info():
    schema = load_schema("hep")
    subschema = schema["properties"]["document_type"]

    record = {"document_type": ["thesis"]}
    assert validate(record["document_type"], subschema) is None

    expected = "mastersthesis"
    result = BibTexCommonSchema.get_bibtex_document_type(record)

    assert expected == result


def test_get_volume():
    test_record = {"publication_info": [{"journal_volume": "12"}]}
    expected = "12"
    schema = BibTexCommonSchema()
    result = schema.get_volume(test_record)
    assert expected == result


def test_get_report_number():
    test_data = {
        "report_numbers": [
            {"value": "CERN-SOME-REPORT"},
            {"value": "CERN-SOME-OTHER-REPORT"},
        ]
    }
    expected = "CERN-SOME-REPORT, CERN-SOME-OTHER-REPORT"
    schema = BibTexCommonSchema()
    result = schema.get_report_number(test_data)
    assert expected == result


def test_get_type():
    test_data = {"doc_type": "thesis", "thesis_info": {"degree_type": "bachelor"}}
    expected = "Bachelor thesis"
    schema = BibTexCommonSchema()
    result = schema.get_type(test_data)
    assert expected == result


def test_get_type_handles_missing_thesis_info():
    schema = load_schema("hep")
    subschema = schema["properties"]["document_type"]

    record = {"document_type": ["thesis"]}
    assert validate(record["document_type"], subschema) is None
    schema = BibTexCommonSchema()
    expected = "Other thesis"
    result = schema.get_type(record)

    assert expected == result


def test_get_author():
    test_record = {"corporate_author": ["Corp A", "Corp B"]}
    expected = "{Corp A} and {Corp B}"
    schema = BibTexCommonSchema()
    result = schema.get_author(test_record)
    assert expected == result


def test_get_best_publication_info():
    test_record = {
        "publication_info": [
            {"journal_title": "A", "journal_issue": "1"},
            {"journal_title": "B", "journal_issue": "2", "journal_volume": "2"},
            {
                "journal_title": "C",
                "journal_issue": "3",
                "journal_volume": "3",
                "year": 2017,
            },
        ]
    }
    expected = test_record["publication_info"][2]
    result = BibTexCommonSchema.get_best_publication_info(test_record)
    assert expected == result


def test_note_on_erratum():
    test_record = {
        "publication_info": [
            {
                "journal_title": u"Zażółć gęślą jaźń",
                "journal_volume": "A",
                "page_start": "12",
                "page_end": "15",
                "year": 2016,
                "material": "erratum",
            },
            {
                "journal_title": "A Title",
                "journal_volume": "B",
                "artid": "987",
                "material": "addendum",
            },
        ]
    }
    expected = "[Erratum: Zażółć gęślą jaźń A, 12--15 (2016), Addendum: A Title B, 987]"
    schema = BibTexCommonSchema()
    result = schema.get_note(test_record)
    assert expected == result
