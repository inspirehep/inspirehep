# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from bs4 import BeautifulSoup
from inspire_schemas.api import load_schema, validate

from inspirehep.matcher.parsers import GrobidReferenceParser


def test_grobid_to_reference():
    xml = """
<biblStruct>
    <analytic>
        <title/>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><surname>Graff</surname></persName>
        </author>
    </analytic>
    <monogr>
        <title level="j">Expert. Opin. Ther. Targets</title>
        <idno type="DOI">10.1007/JHEP11(2010)093</idno>
        <idno type="arXiv">arXiv:1009.1212</idno>
        <idno type="isbn">978-3-642-23908-3</idno>
        <idno>ATLAS-CONF-2015-029</idno>
        <imprint>
            <biblScope unit="volume">6</biblScope>
            <biblScope unit="issue">1</biblScope>
            <biblScope unit="page" from="103" to="113" />
            <date type="published" when="2002" />
        </imprint>
    </monogr>
</biblStruct>
"""
    result = GrobidReferenceParser(xml).parse()
    expected = {
        "reference": {
            "arxiv_eprint": "1009.1212",
            "dois": ["10.1007/JHEP11(2010)093"],
            "isbn": "9783642239083",
            "publication_info": {
                "journal_issue": "1",
                "journal_title": "Expert. Opin. Ther. " "Targets",
                "journal_volume": "6",
                "page_end": "113",
                "page_start": "103",
                "year": 2002,
            },
            "report_numbers": ["ATLAS-CONF-2015-029"],
        }
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([result], subschema) is None

    assert expected == result


def test_grobid_to_reference_doesnt_return_empty_values():
    # [28] K. Ito, H. Nakajima, T. Saka, and S. Sasaki,
    # “N=2 Instanton Effective Action in Ω-background and D3/D(-1)-brane System in R-R Background,”
    # JHEP 11 (2010) 093, arXiv:1009.1212 [hep-th].
    xml = """
<biblStruct>
    <monogr>
        <title level="m" type="main">N=2 Instanton Effective Action in Ω-background and D3/D(-1)-brane System in R-R Background</title>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><forename type="first">K</forename><surname>Ito</surname></persName>
        </author>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><forename type="first">H</forename><surname>Nakajima</surname></persName>
        </author>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><forename type="first">T</forename><surname>Saka</surname></persName>
        </author>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0"><forename type="first">S</forename><surname>Sasaki</surname></persName>
        </author>
        <idno type="arXiv">arXiv:1009.1212</idno>
        <imprint>
            <date type="published" when="2010" />
            <biblScope unit="page">93</biblScope>
        </imprint>
    </monogr>
    <note>hep-th</note>
</biblStruct>
"""
    result = GrobidReferenceParser(xml).parse()
    expected = {
        "reference": {
            "arxiv_eprint": "1009.1212",
            "publication_info": {
                "journal_title": "N=2 Instanton Effective "
                "Action in Ω-background "
                "and D3/D(-1)-brane "
                "System in R-R Background",
                "year": 2010,
                "page_start": "93",
            },
        }
    }
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([result], subschema) is None
    assert expected == result


def test_grobid_to_reference_with_report_number():
    xml = """
<biblStruct>
    <monogr>
        <idno>ATLAS-CONF-2015-029</idno>
        <ptr target="https://cds.cern.ch/record/2037702" />
        <title level="m">Selection of jets produced in13TeVproton-proton collisions with the ATLASdetector</title>
        <imprint>
            <date type="published" when="2015" />
        </imprint>
    </monogr>
</biblStruct>
"""
    result = GrobidReferenceParser(xml).parse()
    expected = {
        "reference": {
            "publication_info": {
                "journal_title": "Selection of jets "
                "produced "
                "in13TeVproton-proton "
                "collisions with the "
                "ATLASdetector",
                "year": 2015,
            },
            "report_numbers": ["ATLAS-CONF-2015-029"],
        }
    }
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    assert validate([result], subschema) is None
    assert expected == result


def test_grobid_with_only_one_page_instead_of_page_range():
    # Phys. Lett. B 704 (2011) 223
    xml = """
<biblStruct >
    <analytic>
        <title/>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0">
                <forename type="first">K</forename>
                <forename type="middle">P</forename>
                <surname>Das</surname>
            </persName>
        </author>
        <author>
            <persName xmlns="http://www.tei-c.org/ns/1.0">
                <forename type="first">R</forename>
                <forename type="middle">C</forename>
                <surname>Hwa</surname>
            </persName>
        </author>
    </analytic>
    <monogr>
        <title level="j">Phys. Lett. B</title>
        <imprint>
            <biblScope unit="volume">68</biblScope>
            <biblScope unit="page">459</biblScope>
            <date type="published" when="1977" />
        </imprint>
    </monogr>
</biblStruct>
"""
    result = GrobidReferenceParser(xml).parse()
    expected = {
        "reference": {
            "publication_info": {
                "journal_volume": "68",
                "journal_title": "Phys. Lett. B",
                "page_start": "459",
                "year": 1977,
            }
        }
    }
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]
    assert validate([result], subschema) is None
    assert expected == result


def test_empty_grobid_to_reference():
    result = GrobidReferenceParser("").parse()
    expected = None
    assert expected == result
