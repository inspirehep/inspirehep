# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session


def test_redirects_records_from_legacy_url(inspire_app):
    create_record("lit", data={"control_number": 777})

    with inspire_app.test_client() as client:
        response = client.get("/record/777")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/literature/777"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_data_records_to_legacy_url(inspire_app):
    create_record("dat", data={"control_number": 777})

    with inspire_app.test_client() as client:
        response = client.get("/record/777")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "https://old.inspirehep.net/record/777"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_non_existing_records_from_legacy_url(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/record/111")

    assert response.status_code == 404


def test_redirects_authors_from_legacy_url(inspire_app):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    create_record("aut", data=author_data)
    with inspire_app.test_client() as client:
        response = client.get("/author/Frank.Castle.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors/333"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_author_profile_from_legacy_url(inspire_app):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    create_record("aut", data=author_data)
    with inspire_app.test_client() as client:
        response = client.get("/author/profile/Frank.Castle.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors/333"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_non_existing_authors_from_legacy_url(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/author/profile/Little.Jimmy.1")

    assert response.status_code == 404


def test_redirects_claims_to_author_page(inspire_app):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "G.Aad.1"}],
    }
    create_record("aut", data=author_data)

    with inspire_app.test_client() as client:
        response = client.get("/author/claim/G.Aad.1")

        response_status_code = response.status_code
        response_location_header = response.headers.get("Location")

        expected_status_code = 302
        expected_redirect_url = "http://localhost:5000/authors/333"
        assert expected_status_code == response_status_code
        assert response_location_header == expected_redirect_url


def test_redirects_claims_from_legacy_url(inspire_app):
    rec = create_record(
        "aut", data={"ids": [{"schema": "INSPIRE BAI", "value": "G.Aad.1"}]}
    )
    with inspire_app.test_client() as client:
        response = client.get("/author/claim/G.Aad.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = f"http://localhost:5000/authors/{rec['control_number']}"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_merge_profiles_from_legacy_url(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get(
            "/author/merge_profiles?search_param=Aad&primary_profile=G.Aad.1"
        )

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "http://localhost:5000/authors"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_merge_profiles_in_author_page(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get(
            "/author/merge_profiles?search_param=Aad&primary_profile=G.Aad.1"
        )

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "http://localhost:5000/authors"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_manage_profile_from_legacy_url(inspire_app):
    rec = create_record(
        "aut", data={"ids": [{"schema": "INSPIRE BAI", "value": "J.A.Bagger.1"}]}
    )
    with inspire_app.test_client() as client:
        response = client.get("/author/manage_profile/J.A.Bagger.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = f"http://localhost:5000/authors/{rec['control_number']}"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_manage_profile_to_author_page(inspire_app):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "G.Aad.1"}],
    }
    create_record("aut", data=author_data)

    with inspire_app.test_client() as client:
        response = client.get("/author/manage_profile/G.Aad.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "http://localhost:5000/authors/333"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/search?cc=HepNames&p=witten")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors?q=witten"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url_to_hep_search(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/search?cc=Slac&p=witten")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = (
        "http://localhost:5000/literature?q=_collections:%22Slac%22%20and%20witten"
    )
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url_with_empty_query(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/search?cc=HEP")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/literature?q="
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url_with_empty_query_to_hep_search(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/search?cc=halhidden")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = (
        'http://localhost:5000/literature?q=_collections:"halhidden"'
    )
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url_not_in_labs(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/search?cc=SOME_COLLECTION&p=CERN&whatever=something")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/literature?q=_collections:%22SOME_COLLECTION%22%20and%20CERN"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_collections_from_legacy_url(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/collection/HepNames")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_collections_from_legacy_url_to_hep_search(
    inspire_app,
):
    with inspire_app.test_client() as client:
        response = client.get("/collection/halhidden")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = (
        'http://localhost:5000/literature?q=_collections:"halhidden"'
    )
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_collections_from_legacy_url_not_in_labs(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/collection/SOME_COLLECTION")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = (
        'http://localhost:5000/literature?q=_collections:"SOME_COLLECTION"'
    )
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_info_from_legacy_url(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/info/hep/api")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "https://old.inspirehep.net/info/hep/api"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirect_by_orcid(inspire_app):
    record = create_record(
        "aut",
        data={
            "ids": [
                {"value": "0000-0002-5405-5504", "schema": "ORCID"},
            ]
        },
    )
    user = create_user()
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/legacy/orcid/0000-0002-5405-5504", headers=headers)
    assert response.status_code == 302
    assert response.location.split("/")[-1] == str(record["control_number"])


def test_redirect_by_arxiv(inspire_app):
    record = create_record(
        "lit",
        data={
            "arxiv_eprints": [{"value": "hep-th/9711200", "categories": ["hep-th"]}],
        },
    )
    with inspire_app.test_client() as client:
        response = client.get("/legacy/arxiv/hep-th/9711200")

    assert response.status_code == 302
    assert response.location.split("/")[-1] == str(record["control_number"])
