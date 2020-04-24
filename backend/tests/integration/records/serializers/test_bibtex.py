# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from helpers.utils import create_record


def test_bibtex(api_client):
    headers = {"Accept": "application/x-bibtex"}
    data = {"control_number": 637275237, "titles": [{"title": "This is a title."}]}
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_etag = '"application/x-bibtex@v1"'
    expected_result = '@article{637275237,\n    title = "{This is a title.}"\n}\n'
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data


def test_bibtex_returns_all_expected_fields_for_conference_papers(api_client):
    headers = {"Accept": "application/x-bibtex"}

    conference_data = {
        "_collections": ["Conferences"],
        "control_number": 73415311,
        "titles": [{"title": "This is the parent conference title"}],
    }
    create_record("con", data=conference_data)

    conf_paper_data = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "Smith, John", "inspire_roles": ["editor"]},
            {"full_name": "Rossi, Maria", "inspire_roles": ["author"]},
        ],
        "control_number": 1203999,
        "titles": [{"title": "This is a conference paper title"}],
        "document_type": ["conference paper"],
        "texkeys": ["Smith:2019abc"],
        "publication_info": [
            {
                "conference_record": {
                    "$ref": "http://labs.inspirehep.net/api/conferences/73415311"
                }
            }
        ],
    }
    record = create_record("lit", data=conf_paper_data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@inproceedings{Smith:2019abc,\n    author = "Rossi, Maria",\n    editor = "Smith, John",\n    booktitle = "{This is the parent conference title}",\n    title = "{This is a conference paper title}"\n}\n'
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_bibtex_returns_all_expected_fields_for_book_chapters(api_client):
    headers = {"Accept": "application/x-bibtex"}

    book_data = {
        "_collections": ["Literature"],
        "control_number": 98141514,
        "titles": [{"title": "This is the parent book title"}],
    }
    create_record("lit", data=book_data)

    book_chapter_data = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "Smith, John", "inspire_roles": ["editor"]},
            {"full_name": "Rossi, Maria", "inspire_roles": ["author"]},
        ],
        "control_number": 4454431,
        "titles": [{"title": "This is a book chapter title"}],
        "document_type": ["book chapter"],
        "texkeys": ["Smith:2019abc"],
        "publication_info": [
            {
                "parent_record": {
                    "$ref": "http://labs.inspirehep.net/api/literature/98141514"
                }
            }
        ],
    }
    record = create_record("lit", data=book_chapter_data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@inbook{Smith:2019abc,\n    author = "Rossi, Maria",\n    editor = "Smith, John",\n    booktitle = "{This is the parent book title}",\n    title = "{This is a book chapter title}"\n}\n'
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_bibtex_search(api_client):
    headers = {"Accept": "application/x-bibtex"}
    data_1 = {"control_number": 637275237, "titles": [{"title": "This is a title."}]}
    data_2 = {"control_number": 637275232, "titles": [{"title": "Yet another title."}]}
    create_record("lit", data=data_1)
    create_record("lit", data=data_2)

    expected_status_code = 200
    expected_result_1 = (
        "@article{637275237,\n" '    title = "{This is a title.}"\n' "}\n"
    )
    expected_result_2 = (
        "@article{637275232,\n" '    title = "{Yet another title.}"\n' "}\n"
    )

    response = api_client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data


def test_bibtex_doesnt_encode_math_environments(api_client):
    headers = {"Accept": "application/x-bibtex"}
    data = {
        "control_number": 637275237,
        "titles": [
            {
                "title": "Low-energy theorem for $\\gamma\\to 3\\pi$: Σ surface terms against $\\pi a_1$-mixing"
            }
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@article{637275237,\n    title = "{Low-energy theorem for $\\gamma\\to 3\\pi$: $\\Sigma$ surface terms against $\\pi a_1$-mixing}"\n}\n'
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


@pytest.mark.xfail(reason="latexcodec doesn't know about the special characters")
def test_bibtex_encodes_unicode_outside_of_math_environments(api_client):
    headers = {"Accept": "application/x-bibtex"}
    data = {
        "control_number": 637275237,
        "titles": [
            {"title": "Core polarization effects up to 12ℏω in 7Li and 10B nuclei"}
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@article{637275237,\n    title = "{Core polarization effects up to 12$\hbar\omega$ in 7Li and 10B nuclei}"\n}\n'
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data
