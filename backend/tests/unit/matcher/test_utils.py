# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from bs4 import BeautifulSoup
from inspire_schemas.api import load_schema, validate

from inspirehep.matcher.utils import grobid_to_reference


def test_grobid_to_reference():
    xml = """
<biblStruct >
    <analytic>
        <title/>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><surname>Graff</surname></persName>
        </author>
    </analytic>
    <idno type="DOI">10.1007/JHEP11(2010)093</idno>
    <idno type="arxiv">1009.1212</idno>
    <idno type="report">ESS 2013-001</idno>
    <idno type="isbn">2321061939</idno>
    <monogr>
        <title level="j">Expert. Opin. Ther. Targets</title>
        <imprint>
            <biblScope unit="volume">6</biblScope>
            <biblScope unit="issue">1</biblScope>
            <biblScope unit="page" from="103" to="113" />
            <date type="published" when="2002" />
        </imprint>
    </monogr>
</biblStruct>
"""
    result = grobid_to_reference(xml)
    expected = {
        "reference": {
            "arxiv_eprint": "1009.1212",
            "dois": ["10.1007/JHEP11(2010)093"],
            "isbn": "2321061939",
            "publication_info": {
                "journal_issue": "1",
                "journal_title": "Expert. Opin. Ther. Targets",
                "journal_volume": "6",
                "page_end": "113",
                "page_start": "103",
                "year": 2002,
            },
            "report_numbers": ["ESS 2013-001"],
        }
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([result], subschema) is None

    assert expected == result


def test_grobid_to_reference_doesnt_return_empty_values():
    xml = """
<biblStruct >
    <analytic>
        <title/>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><surname>Graff</surname></persName>
        </author>
    </analytic>
    <idno type="DOI">10.1007/JHEP11(2010)093</idno>
    <monogr>
        <title level="j">Expert. Opin. Ther. Targets</title>
        <imprint>

            <biblScope unit="issue">1</biblScope>
            <date type="published" when="2002" />
        </imprint>
    </monogr>
</biblStruct>
"""
    result = grobid_to_reference(xml)
    expected = {
        "reference": {
            "dois": ["10.1007/JHEP11(2010)093"],
            "publication_info": {
                "journal_issue": "1",
                "journal_title": "Expert. Opin. Ther. Targets",
                "year": 2002,
            },
        }
    }
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([result], subschema) is None
    assert expected == result


def test_empty_grobid_to_reference():
    result = grobid_to_reference("")
    expected = None
    assert expected == result
