# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from mock import patch


def test_redirects_records_from_legacy_url(api_client, db, es_clear, create_record):
    create_record("lit", data={"control_number": 777})

    response = api_client.get("/record/777")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_path = "/literature/777"
    assert expected_status_code == response_status_code
    assert response_location_header.endswith(expected_redirect_path)


def test_redirects_non_existing_records_from_legacy_url(
    api_client, db, es_clear, create_record
):
    response = api_client.get("/record/111")

    assert response.status_code == 404


def test_redirects_authors_from_legacy_url(api_client, db, es_clear, create_record):
    author_data = {
        "control_number": 333,
        "ids": [{"schema": "INSPIRE BAI", "value": "Frank.Castle.1"}],
    }
    create_record("aut", data=author_data)

    response = api_client.get("/author/profile/Frank.Castle.1")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_path = "/authors/333"
    assert expected_status_code == response_status_code
    assert response_location_header.endswith(expected_redirect_path)


def test_redirects_non_existing_authors_from_legacy_url(
    api_client, db, es_clear, create_record
):
    response = api_client.get("/author/profile/Little.Jimmy.1")

    assert response.status_code == 404


def test_redirects_query_from_legacy_url(api_client, db, es_clear, create_record):
    response = api_client.get("/search?cc=HepNames&p=witten")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_status_code = 301
    expected_redirect_path = "/authors?q=witten"
    assert expected_status_code == response_status_code
    assert response_location_header.endswith(expected_redirect_path)


def test_redirects_query_from_legacy_url_not_in_labs(
    api_client, db, es_clear, create_record, base_app
):
    with patch.dict(
        base_app.config, {"LEGACY_BASE_URL": "https://legacy.inspirehep.net"}
    ):
        response = api_client.get("/search?cc=Institutions&p=CERN&whatever=something")

        response_status_code = response.status_code
        response_location_header = response.headers.get("Location")

        expected_status_code = 302
        expected_redirect_url = "https://legacy.inspirehep.net/search?cc=Institutions&p=CERN&whatever=something"
        assert expected_status_code == response_status_code
        assert response_location_header == expected_redirect_url
