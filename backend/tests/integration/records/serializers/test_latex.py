# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from freezegun import freeze_time
from helpers.utils import create_record, create_record_factory


@freeze_time("1994-12-19")
def test_latex_eu(app_clean):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}

    record = create_record_factory("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_etag = '"application/vnd+inspire.latex.eu+x-latex@v0"'
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_us(app_clean):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}

    record = create_record_factory("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_etag = '"application/vnd+inspire.latex.us+x-latex@v0"'
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_eu_do_not_show_supervisors(app_clean):
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
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    assert response.status_code == expected_status_code
    assert response.get_data(as_text=True) == expected_result


@freeze_time("1994-12-19")
def test_latex_us_do_not_show_supervisors(app_clean):
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
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    assert response.status_code == expected_status_code
    assert response.get_data(as_text=True) == expected_result


@freeze_time("1994-12-19")
def test_latex_eu_search_response(app_clean):
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
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data


@freeze_time("1994-12-19")
def test_latex_eu_search_response_full_record(app_clean):
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
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_us_search_response(app_clean):
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
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data


@freeze_time("1994-12-19")
def test_latex_us_search_response_full_record(app_clean):
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
    with app_clean.app.test_client() as client:
        response = client.get(f"/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data
