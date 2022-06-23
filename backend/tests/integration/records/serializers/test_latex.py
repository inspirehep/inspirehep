# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from freezegun import freeze_time
from helpers.utils import create_record, create_record_factory
import pytest

@freeze_time("1994-12-19")
def test_latex_eu(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}

    record = create_record_factory("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_us(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}

    record = create_record_factory("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_eu_do_not_show_supervisors(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": "Super, Visor",
                "inspire_roles": ["supervisor"],
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62c",
                "full_name": "Normal, Author",
            },
        ],
    }
    record = create_record("lit", data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = "%\\cite{637275237}\n\\bibitem{637275237}\nA.~Normal,\n%``This is a title.,''\n%0 citations counted in INSPIRE as of 19 Dec 1994"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    assert response.status_code == expected_status_code
    assert response.get_data(as_text=True) == expected_result


@freeze_time("1994-12-19")
def test_latex_us_do_not_show_supervisors(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": "Super, Visor",
                "inspire_roles": ["supervisor"],
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62c",
                "full_name": "Normal, Author",
            },
        ],
    }
    record = create_record("lit", data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = "%\\cite{637275237}\n\\bibitem{637275237}\nA.~Normal,\n%``This is a title.,''\n%0 citations counted in INSPIRE as of 19 Dec 1994"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    assert response.status_code == expected_status_code
    assert response.get_data(as_text=True) == expected_result


@freeze_time("1994-12-19")
def test_latex_eu_search_response(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data_1 = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}
    data_2 = {"control_number": 637_275_232, "titles": [{"title": "This is a title2."}]}
    create_record("lit", data=data_1)
    create_record("lit", data=data_2)

    expected_status_code = 200
    expected_result_1 = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    expected_result_2 = (
        "%\\cite{637275232}\n"
        "\\bibitem{637275232}\n"
        "%``This is a title2.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data


@freeze_time("1994-12-19")
def test_latex_eu_search_response_full_record(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {
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
                "year": 2014,
            }
        ],
        "report_numbers": [{"value": "DESY-17-036"}],
    }
    record = create_record("lit", data=data)

    expected_status_code = 200
    expected_result = (
        "%\\cite{a123bx}\n"
        "\\bibitem{a123bx}\n"
        "F.~Castle \\textit{et al.} [LHCb],\n"
        "%``Jessica Jones,''\n"
        "Phys. Rev. A \\textbf{58} (2014), 500-593\n"
        "doi:10.1088/1361-6633/aa5514\n"
        "[arXiv:1607.06746 [hep-th]].\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_us_search_response(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data_1 = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}
    data_2 = {"control_number": 637_275_232, "titles": [{"title": "This is a title2."}]}
    create_record("lit", data=data_1)
    create_record("lit", data=data_2)

    expected_status_code = 200
    expected_result_1 = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    expected_result_2 = (
        "%\\cite{637275232}\n"
        "\\bibitem{637275232}\n"
        "%``This is a title2.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data


@freeze_time("1994-12-19")
def test_latex_us_search_response_full_record(inspire_app):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {
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
                "year": 2014,
            }
        ],
        "report_numbers": [{"value": "DESY-17-036"}],
    }
    record = create_record("lit", data=data)

    expected_status_code = 200
    expected_result = (
        "%\\cite{a123bx}\n"
        "\\bibitem{a123bx}\n"
        "F.~Castle \\textit{et al.} [LHCb],\n"
        "%``Jessica Jones,''\n"
        "Phys. Rev. A \\textbf{58}, 500-593 (2014)\n"
        "doi:10.1088/1361-6633/aa5514\n"
        "[arXiv:1607.06746 [hep-th]].\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_literature_detail_latex_eu_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("lit")
    expected_content_type = "application/vnd+inspire.latex.eu+x-latex"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=latex-eu")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type


def test_literature_detail_latex_us_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("lit")
    expected_content_type = "application/vnd+inspire.latex.us+x-latex"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=latex-us")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type


def test_latex_handle_one_erratum(inspire_app):
    data = {
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
        ]
    }

    expected_latex_data = (
        "[erratum: Phys. Rev. D \\textbf{99}, no.1, 019903 (2019)]".encode()
    )

    record = create_record("lit", data)

    with inspire_app.test_client() as client:
        url = f"/literature/{record['control_number']}"
        response_latex = client.get(f"{url}?format=latex-us")

    assert response_latex.status_code == 200
    assert expected_latex_data in response_latex.data


def test_latex_handle_multiple_erratest_latex_handle_multiple_erratumstums(inspire_app):

    data = {
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

    expected_latex_data = "[erratum: Phys. Rev. D \\textbf{99}, no.1, 019903 (2019); erratum: Phys. Rev. C \\textbf{97}, no.12, 019903 (2020)]".encode()

    record = create_record("lit", data)

    with inspire_app.test_client() as client:
        url = f"/literature/{record['control_number']}"
        response_latex = client.get(f"{url}?format=latex-us")

    assert response_latex.status_code == 200
    assert expected_latex_data in response_latex.data


def test_latex_handle_multiple_erratums_with_missing_info(inspire_app):
    data = {
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
    expected_latex_data = "[erratum: , 032005; erratum: Phys. Rev. D]".encode()
    record = create_record("lit", data)

    with inspire_app.test_client() as client:
        url = f"/literature/{record['control_number']}"
        response_data = client.get(f"{url}?format=latex-eu")

    assert response_data.status_code == 200
    assert expected_latex_data in response_data.data


@freeze_time("2020-09-11")
def test_latex_returns_limits_number_of_authors_to_10(inspire_app):
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": "First, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62c",
                "full_name": "Second, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62d",
                "full_name": "Third, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62e",
                "full_name": "Fourth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62f",
                "full_name": "Fifth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd63a",
                "full_name": "Sixth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd63b",
                "full_name": "Seventh, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd63c",
                "full_name": "Eighth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd63d",
                "full_name": "Ninth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd63e",
                "full_name": "Tenth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd63f",
                "full_name": "Eleventh, Author",
            },
        ],
    }
    record = create_record("lit", data)
    expected = (
        "%\\cite{637275237}\n\\bibitem{637275237}\n"
        "A.~First, A.~Second, A.~Third, A.~Fourth, A.~Fifth, A.~Sixth, A.~Seventh, A.~Eighth, A.~Ninth and A.~Tenth, \\textit{et al.}\n"
        "%``This is a title.,''\n%0 citations counted in INSPIRE as of 11 Sep 2020"
    )

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=latex-us")
    response_data = response.get_data(as_text=True)

    assert response.status_code == 200
    assert response_data == expected


@freeze_time("2020-09-11")
def test_latex_not_returns_etal_when_authors_nb_less_than_10(inspire_app):
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": "First, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62c",
                "full_name": "Second, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62d",
                "full_name": "Third, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62e",
                "full_name": "Fourth, Author",
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62f",
                "full_name": "Fifth, Author",
            },
        ],
    }
    record = create_record("lit", data)
    expected = (
        "%\\cite{637275237}\n\\bibitem{637275237}\nA.~First, A.~Second, A.~Third, A.~Fourth and A.~Fifth,\n"
        "%``This is a title.,''\n%0 citations counted in INSPIRE as of 11 Sep 2020"
    )

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=latex-us")
    response_data = response.get_data(as_text=True)

    assert response.status_code == 200
    assert response_data == expected


@freeze_time("2020-09-16")
def test_latex_encodes_non_latex_chars(inspire_app):
    data = {
        "texkeys": ["Gerard2020:abc"],
        "titles": [{"title": "About γ-ray bursts"}],
        "authors": [{"full_name": "Gérard, Paweł"}],
        "collaborations": [{"value": "DAΦNE"}],
        "publication_info": [
            {
                "journal_title": "Annales H.Poincaré",
                "journal_volume": "42",
                "page_start": "314",
            }
        ],
        "dois": [{"value": "10.1234/567_89"}],
    }
    record = create_record("lit", data)
    expected = "%\\cite{Gerard2020:abc}\n\\bibitem{Gerard2020:abc}\nP.~G\\'erard [DA\\ensuremath{\\Phi}NE],\n%``About \\ensuremath{\\gamma}-ray bursts,''\nAnnales H. Poincar\\'e \\textbf{42}, 314\ndoi:10.1234/567\\_89\n%0 citations counted in INSPIRE as of 16 Sep 2020"

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=latex-us")
    response_data = response.get_data(as_text=True)

    assert response.status_code == 200
    assert response_data == expected


@freeze_time("2020-09-11")
@pytest.mark.parametrize(
    "input_author,expected_name",
    [("Lieber, Ed", "E.~Lieber,"),
     ('Lieber, Ed Viktor', "E.~V.~Lieber,"),
     ('Lieber, Ed Jr.', "E.~Lieber, Jr.,"),
     ('Lieber, Ed Victor Jr.', "E.~V.~Lieber, Jr.,"),
     ],
)
def test_latex_returns_names_correctly(input_author, expected_name, inspire_app):
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": input_author,
            },
        ],
    }
    record = create_record("lit", data)
    expected = (
        f"%\\cite{{637275237}}\n\\bibitem{{637275237}}\n{expected_name}\n"
        "%``This is a title.,''\n%0 citations counted in INSPIRE as of 11 Sep 2020"
    )

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=latex-us")
    response_data = response.get_data(as_text=True)

    assert response.status_code == 200
    assert response_data == expected
