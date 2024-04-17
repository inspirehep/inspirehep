# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask_sqlalchemy import models_committed
from helpers.utils import create_record

from inspirehep.records.marshmallow.literature.common.author import CVAuthorSchemaV1
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch


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
        response = client.get(f"/literature/{record_control_number}", headers=headers)
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
    assert expected_status_code == response_status_code
    assert "https://localhost:5000/literature/637275237" in expected_result
    assert "https://localhost:5000/literature/637275232" in expected_result
    assert "This is a title." in expected_result
    assert "Yet another title." in expected_result


def test_cv_with_linked_and_unlinked_authors(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    aut = create_record("aut", data={"control_number": 637_275_238})
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
    record = create_record("lit", data=data, without_author_refs=True)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_linked_and_unlinked_authors.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_multiple_collaborations(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    author = create_record(
        "aut", data={"name": {"value": "Doe, John"}, "control_number": 1}
    )
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "collaborations": [{"value": "ATLAS"}, {"value": "CMS"}],
        "authors": [{"full_name": "Doe, John6", "record": author["self"]}],
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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_collaborations_and_no_authors(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "collaborations": [{"value": "ATLAS"}, {"value": "CMS"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_collaborations_and_no_authors.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)
    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_collaboration_and_multiple_authors(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    author = create_record(
        "aut", data={"name": {"value": "John Doe"}, "control_number": 1}
    )
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "collaborations": [{"value": "ATLAS"}],
        "authors": [
            {"full_name": "Doe, John6", "record": author["self"]},
            {"full_name": "Didi, Jane"},
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_collaboration_and_multiple_authors.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_collaboration_with_suffix_and_multiple_authors(
    inspire_app, shared_datadir
):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    author = create_record(
        "aut", data={"name": {"value": "Doe, John"}, "control_number": 1}
    )
    author_2 = create_record(
        "aut", data={"name": {"value": "Didi, Jane"}, "control_number": 2}
    )
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "collaborations": [{"value": "Particle Data Group"}],
        "authors": [
            {"full_name": "Doe, John6", "record": author["self"]},
            {"full_name": "Didi, Jane", "record": author_2["self"]},
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_collaboration_with_suffix_and_multiple_authors.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_author_with_affiliations(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    institution = create_record("ins", data={"control_number": 637_275_238})
    authors = create_record(
        "aut", data={"control_number": 1, "name": {"value": "Doe, John"}}
    )
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "full_name": "Doe, John6",
                "record": authors["self"],
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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_author_with_multiple_affiliations(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    institution = create_record("ins", data={"control_number": 637_275_238})
    author = create_record(
        "aut", data={"control_number": 1, "name": {"value": "Doe, John"}}
    )
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "record": author["self"],
                "full_name": "Doe, John6",
                "affiliations": [
                    {
                        "record": {
                            "$ref": f"https://inspirehep.net/api/institutions/{institution['control_number']}"
                        },
                        "value": "Gent U.",
                    },
                    {"value": "New York U."},
                ],
            }
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_with_author_with_multiple_affiliations.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_author_with_editor_role(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    author = create_record(
        "aut", data={"control_number": 1, "name": {"value": "Doe, John"}}
    )
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "record": author["self"],
                "full_name": "Doe, John6",
                "inspire_roles": ["editor"],
            }
        ],
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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_with_publication_info_with_only_page_start(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
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
        .replace("RECORD_ID", str(record_control_number))
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_cv_search_with_more_complex_records(inspire_app, shared_datadir):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    author = create_record(
        "aut", data={"control_number": 837_275_237, "name": {"value": "Doe, John"}}
    )
    data_1 = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "arxiv_eprints": [
            {"value": "1207.7214", "categories": ["gr-qc"]},
            {"value": "1208.7214"},
        ],
    }
    data_2 = {
        "control_number": 637_275_232,
        "titles": [{"title": "Yet another title"}],
        "authors": [
            {
                "record": author["self"],
                "full_name": "Doe, John6",
                "inspire_roles": ["editor"],
            }
        ],
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
    rec_1 = create_record("lit", data=data_1)
    rec_2 = create_record("lit", data=data_2)

    assert LiteratureSearch().get_record(str(rec_1.id)).execute().hits
    assert LiteratureSearch().get_record(str(rec_2.id)).execute().hits

    expected_status_code = 200
    expected_result = (
        (shared_datadir / "cv_search_with_more_complex_records.html")
        .read_text()
        .replace("\n", "")
    )
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)

    response_status_code = response.status_code
    assert expected_status_code == response_status_code
    assert "https://localhost:5000/literature/637275237" in expected_result
    assert "https://localhost:5000/literature/637275232" in expected_result
    assert "https://localhost:5000/authors/837275237" in expected_result
    assert "This is a title." in expected_result
    assert "Yet another title" in expected_result
    assert "1207.7214" in expected_result
    assert "John6 Doe" in expected_result
    assert "Test Journal TV (2016)" in expected_result
    assert "1-2" in expected_result


def test_cv_search_cached(inspire_app):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "titles": [{"title": "Yet another title"}],
    }
    record = create_record("lit", data=data)

    models_committed.disconnect(index_after_commit)

    data = dict(record)
    data["titles"] = [{"title": "Modified title"}]

    record.update(data)
    record_control_number = record["control_number"]
    expected_status_code = 200
    expected_result = f'<!DOCTYPE html><html><body>  <p><b>    <a href="https://localhost:5000/literature/{record_control_number}">      Yet another title    </a>  </b></p>          <br></body></html>'
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert expected_result == response_data

    models_committed.connect(index_after_commit)


def test_literature_detail_cv_link_alias_format(inspire_app):

    data = {
        "titles": [{"title": "Yet another title"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    expected_status_code = 200
    expected_result = f'<!DOCTYPE html><html><body>  <p><b>    <a href="https://localhost:5000/literature/{record_control_number}">      Yet another title    </a>  </b></p>          <br></body></html>'

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=cv")
    response_data = response.get_data(as_text=True).replace("\n", "")

    assert response.status_code == expected_status_code
    assert expected_result == response_data


def test_supervisors_are_not_returned_in_cv(inspire_app):
    headers = {"Accept": "text/vnd+inspire.html+html"}
    data = {
        "core": True,
        "urls": [{"value": "https://escholarship.mcgill.ca/concern/theses/m613mz38c"}],
        "titles": [{"title": "Hard probes of the quark-gluon plasma"}],
        "$schema": "https://inspirehep.net/schemas/records/hep.json",
        "authors": [
            {
                "ids": [{"value": "S.Caron.Huot.1", "schema": "INSPIRE BAI"}],
                "uuid": "7c094b4d-639a-4539-a125-596b59fb7b4b",
                "record": {"$ref": "https://inspirehep.net/api/authors/1259628"},
                "full_name": "Caron-Huot, Simon",
                "affiliations": [
                    {
                        "value": "McGill U.",
                        "record": {
                            "$ref": "https://inspirehep.net/api/institutions/902995"
                        },
                    }
                ],
                "signature_block": "HATs",
                "raw_affiliations": [{"value": "McGill U."}],
            },
            {
                "uuid": "f378d3dd-ac32-4f94-b323-51504d1b5478",
                "full_name": "Moore, Guy",
                "affiliations": [
                    {
                        "value": "McGill U.",
                        "record": {
                            "$ref": "https://inspirehep.net/api/institutions/902995"
                        },
                    }
                ],
                "inspire_roles": ["supervisor"],
                "signature_block": "MARg",
            },
        ],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True).replace("\n", "")
    assert expected_status_code == response_status_code
    assert CVAuthorSchemaV1.get_display_name(record["authors"][1]) not in response_data
