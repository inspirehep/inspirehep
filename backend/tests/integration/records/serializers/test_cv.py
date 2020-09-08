# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from helpers.utils import create_record


def test_cv_with_subtitle(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title.", "subtitle": "my subtitle"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_subtitle.html").read_text().replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )
    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_search(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data_1 = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}
    data_2 = {
        "control_number": 637_275_232,
        "titles": [{"title": "Yet another title."}],
    }
    create_record("lit", data=data_1)
    create_record("lit", data=data_2)

    expected_status_code = 200
    expected_result = (shared_datadir / "cv_search.html").read_text().replace("\n", "")
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_linked_and_unlinked_authors(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    aut = create_record("aut", data={"control_number": 637275238})
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title.", "subtitle": "my subtitle"}],
        "authors": [
            {
                "full_name": "Doe, John1",
                "record": {
                    "$ref": f'https://localhost:5000/api/authors/{aut["control_number"]}'
                },
            },
            {"full_name": "Doe, John2"},
            {"full_name": "Doe, John3"},
            {"full_name": "Doe, John4"},
            {"full_name": "Doe, John5"},
            {"full_name": "Doe, John6"},
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_linked_and_unlinked_authors.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_multiple_collaborations(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "collaborations": [{"value": "ATLAS"}, {"value": "CMS"}],
        "authors": [{"full_name": "Doe, John6"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_multiple_collaborations.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_author_with_affiliations(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    institution = create_record("ins", data={"control_number": 637275238})
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "full_name": "Doe, John6",
                "affiliations": [
                    {
                        "record": {
                            "$ref": f"https://inspirehep.net/api/institutions/{institution['control_number']}"
                        },
                        "value": "Gent U.",
                    }
                ],
            }
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_author_with_affiliations.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_author_with_editor_role(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [{"full_name": "Doe, John6", "inspire_roles": ["editor"]}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_author_with_editor_role.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_doi(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "dois": [
            {"source": "Italian Physical Society", "value": "10.1393/ncc/i2019-19248-9"}
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_doi.html").read_text().replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_multiple_dois_with_material(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "dois": [
            {
                "source": "Italian Physical Society",
                "value": "10.1393/ncc/i2019-19248-9",
            },
            {
                "source": "Italian Physical Society",
                "value": "10.1393/ncc/i2019-19248-10",
                "material": "erratum",
            },
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_multiple_dois_with_material.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_publication_info_with_all_fields(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "publication_info": [
            {
                "journal_title": "Test Journal",
                "journal_volume": "TV",
                "year": 2016,
                "page_start": "1",
                "page_end": "2",
                "artid": "012345",
                "pubinfo_freetext": "Test. Pub. Info. Freetext",
            }
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_publication_info_with_all_fields.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_publication_info_with_pubinfo_freetext(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "publication_info": [{"pubinfo_freetext": "Test. Pub. Info. Freetext"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_publication_info_with_pubinfo_freetext.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_publication_info_with_material(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "publication_info": [{"journal_title": "Test Journal", "material": "erratum"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_publication_info_with_material.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_publication_info_with_publication_material(
    inspire_app, shared_datadir
):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "publication_info": [
            {"journal_title": "Test Journal", "material": "publication"}
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_publication_info_with_publication_material.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_publication_info_with_only_page_start(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "publication_info": [
            {
                "journal_title": "Test Journal",
                "page_start": "1",
                "artid": "123",
                "journal_issue": "2",
            }
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_publication_info_with_only_page_start.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_arxiv_eprints(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "arxiv_eprints": [
            {"value": "1207.7214", "categories": ["gr-qc"]},
            {"value": "1208.7214"},
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_arxiv_eprints.html").read_text().replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/{}".format(record_control_number), headers=headers
        )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data
