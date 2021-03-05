# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

import orjson
from freezegun import freeze_time

from inspirehep.records.marshmallow.literature.latex import LatexSchema


@freeze_time("1994-12-19")
def test_full_schema():
    TODAY = "19 Dec 1994"
    schema = LatexSchema()
    record = {
        "texkeys": ["a123bx"],
        "titles": [{"title": "Jessica Jones"}],
        "authors": [
            {"full_name": "Castle, Frank"},
            {"full_name": "Smith, John"},
            {"full_name": "Black, Joe Jr."},
            {"full_name": "Jimmy"},
        ],
        "collaborations": [{"value": "LHCb"}],
        "dois": [{"value": "10.1088/1361-6633/aa5514"}],
        "arxiv_eprints": [{"value": "1607.06746", "categories": ["hep-th"]}],
        "publication_info": [
            {
                "journal_title": "Phys.Rev.A",
                "journal_volume": "58",
                "page_start": "500",
                "page_end": "593",
                "artid": "17920",
                "year": "2014",
            }
        ],
        "report_numbers": [{"value": "DESY-17-036"}],
    }
    expected = {
        "texkeys": "a123bx",
        "title": "Jessica Jones",
        "authors": ["F.~Castle", "J.~Smith", "J.~Black, Jr.", "Jimmy"],
        "collaborations": ["LHCb"],
        "dois": [{"value": "10.1088/1361-6633/aa5514"}],
        "arxiv_eprints": [{"value": "1607.06746", "categories": ["hep-th"]}],
        "publication_info": {
            "journal_title": "Phys. Rev. A",
            "journal_volume": "58",
            "page_start": "500",
            "page_end": "593",
            "page_range": "500-593",
            "artid": "17920",
            "year": "2014",
        },
        "report_numbers": [{"value": "DESY-17-036"}],
        "today": TODAY,
        "notes": None,
    }
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result


def test_authors_schema():
    schema = LatexSchema()
    record = {
        "control_number": "1",
        "authors": [
            {"full_name": "Castle, Frank"},
            {"full_name": "Smith, John"},
            {"full_name": "Black, Joe Jr."},
            {"full_name": "Jimmy"},
            {"full_name": "Anna-Maria Elisabeth Dinkelbach"},
        ],
    }
    expected = [
        "F.~Castle",
        "J.~Smith",
        "J.~Black, Jr.",
        "Jimmy",
        "A.~M.~E.~Dinkelbach",
    ]
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result["authors"]


def test_publication_info_schema():
    schema = LatexSchema()
    record = {
        "control_number": "1",
        "publication_info": [
            {
                "journal_title": "Phys.Rev.A",
                "journal_volume": "58",
                "page_start": "500",
                "page_end": "593",
                "artid": "17920",
                "year": "2014",
            }
        ],
    }
    expected = {
        "journal_title": "Phys. Rev. A",
        "journal_volume": "58",
        "page_start": "500",
        "page_end": "593",
        "page_range": "500-593",
        "artid": "17920",
        "year": "2014",
    }
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result["publication_info"]


def test_publication_info_does_not_generate_page_range_with_page_end():
    schema = LatexSchema()
    record = {
        "control_number": "1",
        "publication_info": [
            {
                "journal_title": "Phys.Rev.A",
                "journal_volume": "58",
                "page_end": "500",
                "artid": "17920",
                "year": "2014",
            }
        ],
    }
    expected = {
        "journal_title": "Phys. Rev. A",
        "journal_volume": "58",
        "page_end": "500",
        "artid": "17920",
        "year": "2014",
    }
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result["publication_info"]


def test_publication_info_generates_page_range_with_page_start():
    schema = LatexSchema()
    record = {
        "control_number": "1",
        "publication_info": [
            {
                "journal_title": "Phys.Rev.A",
                "journal_volume": "58",
                "page_start": "500",
                "artid": "17920",
                "year": "2014",
            }
        ],
    }
    expected = {
        "journal_title": "Phys. Rev. A",
        "journal_volume": "58",
        "page_start": "500",
        "page_range": "500",
        "artid": "17920",
        "year": "2014",
    }
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result["publication_info"]


def test_publication_info_without_journal_title_schema():
    schema = LatexSchema()
    record = {
        "control_number": "1",
        "publication_info": [
            {
                "journal_volume": "58",
                "page_start": "500",
                "page_end": "593",
                "artid": "17920",
                "year": "2014",
            }
        ],
    }
    result = orjson.loads(schema.dumps(record).data)
    assert "publication_info" not in result.keys()


def test_schema_takes_control_number_when_texkeys_not_present():
    schema = LatexSchema()
    record = {"control_number": "123456"}
    expected = "123456"
    result = orjson.loads(schema.dumps(record).data)
    assert expected == result["texkeys"]


def test_schema_gets_erratum():
    schema = LatexSchema()
    record = {
        "publication_info": [
            {
                "artid": "032004",
                "journal_issue": "3",
                "journal_title": "Phys.Rev.D",
                "journal_volume": "96",
                "material": "publication",
                "pubinfo_freetext": "Phys. Rev. D 96, 032004 (2017)",
                "year": 2017,
            },
            {
                "artid": "019903",
                "journal_issue": "1",
                "journal_title": "Phys.Rev.D",
                "journal_volume": "99",
                "material": "erratum",
                "year": 2019,
            },
            {
                "artid": "019903",
                "journal_issue": "12",
                "journal_title": "Phys.Rev.C",
                "journal_volume": "97",
                "material": "erratum",
                "year": 2020,
            },
        ]
    }
    expected = deepcopy(record["publication_info"][1:])
    expected[0]["journal_title"] = "Phys. Rev. D"
    expected[1]["journal_title"] = "Phys. Rev. C"
    result = orjson.loads(schema.dumps(record).data)

    assert expected == result["notes"]


def test_schema_handles_missing_info_in_erratum():
    schema = LatexSchema()
    record = {
        "publication_info": [
            {
                "artid": "032004",
                "journal_issue": "3",
                "journal_title": "Phys.Rev.D",
                "journal_volume": "96",
                "material": "publication",
                "pubinfo_freetext": "Phys. Rev. D 96, 032004 (2017)",
                "year": 2017,
            },
            {"artid": "032005", "material": "erratum"},
            {"journal_title": "Phys.Rev.D", "material": "erratum"},
        ]
    }

    expected = deepcopy(record["publication_info"][1:])
    expected[1]["journal_title"] = "Phys. Rev. D"
    result = orjson.loads(schema.dumps(record).data)

    assert expected == result["notes"]


def test_schema_replaces_underscore_in_doi():
    schema = LatexSchema()
    record = {
        "dois": [
            {"value": "10.1142/9789811219313_0086"},
            {"source": "Springer", "value": "10.1007/978-981-15-6292-1_4"},
        ]
    }

    expected = [
        {"value": "10.1142/9789811219313\\_0086"},
        {"source": "Springer", "value": "10.1007/978-981-15-6292-1\\_4"},
    ]
    result = orjson.loads(schema.dumps(record).data)

    assert expected == result["dois"]
