# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record


def test_redirects_records_from_legacy_url(app_clean):
    create_record("lit", data={"control_number": 777})

    with app_clean.app.test_client() as client:
        response = client.get("/record/777")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/literature/777"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_non_existing_records_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/record/111")

    assert response.status_code == 404


def test_redirects_authors_from_legacy_url(app_clean):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    create_record("aut", data=author_data)
    with app_clean.app.test_client() as client:
        response = client.get("/author/Frank.Castle.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors/333"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_author_profile_from_legacy_url(app_clean):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    create_record("aut", data=author_data)
    with app_clean.app.test_client() as client:
        response = client.get("/author/profile/Frank.Castle.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors/333"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_non_existing_authors_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/author/profile/Little.Jimmy.1")

    assert response.status_code == 404


def test_redirects_claims_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/author/claim/G.Aad.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "https://old.inspirehep.net/author/claim/G.Aad.1"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_merge_profiles_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get(
            "/author/merge_profiles?search_param=Aad&primary_profile=G.Aad.1"
        )

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "https://old.inspirehep.net/author/merge_profiles?search_param=Aad&primary_profile=G.Aad.1"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_manage_profile_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/author/manage_profile/J.A.Bagger.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = (
        "https://old.inspirehep.net/author/manage_profile/J.A.Bagger.1"
    )
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/search?cc=HepNames&p=witten")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors?q=witten"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url_with_empty_query(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/search?cc=HEP")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/literature?q="
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_query_from_legacy_url_not_in_labs(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/search?cc=Institutions&p=CERN&whatever=something")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = (
        "https://old.inspirehep.net/search?cc=Institutions&p=CERN&whatever=something"
    )
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_collections_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/collection/HepNames")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_url = "http://localhost:5000/authors"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_collections_from_legacy_url_not_in_labs(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/collection/Institutions")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "https://old.inspirehep.net/collection/Institutions"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_redirects_info_from_legacy_url(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/info/hep/api")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 302
    expected_redirect_url = "https://old.inspirehep.net/info/hep/api"
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url
