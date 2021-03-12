# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.providers.faker import faker
from helpers.utils import create_record, create_user, create_user_and_token
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_author_facets(inspire_app):
    create_record("lit")
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/facets?facet_name=hep-author-publication&author_recid=9999"
        )

    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = sorted(
        [
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "collaboration",
            "rpp",
            "self_affiliations",
        ]
    )
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_author_cataloger_facets(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/literature/facets?facet_name=hep-author-publication&author_recid=9999"
        )

    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = sorted(
        [
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "collaboration",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
            "self_curated_relation",
            "collection",
            "rpp",
        ]
    )
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_authors_application_json_put_without_token(inspire_app):
    record = create_record("aut")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put("/authors/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_authors_application_json_delete_without_token(inspire_app):
    record = create_record("aut")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete("/authors/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_authors_application_json_post_without_token(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/authors")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_authors_application_json_put_with_token(inspire_app):
    record = create_record("aut")
    record_control_number = record["control_number"]
    token = create_user_and_token()

    expected_status_code = 200

    headers = {"Authorization": "BEARER " + token.access_token}
    with inspire_app.test_client() as client:
        response = client.put(
            "/authors/{}".format(record_control_number), headers=headers, json=record
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_authors_application_json_delete_with_token(inspire_app):
    record = create_record("aut")
    record_control_number = record["control_number"]
    token = create_user_and_token()

    expected_status_code = 403

    headers = {"Authorization": "BEARER " + token.access_token}
    with inspire_app.test_client() as client:
        response = client.delete(
            "/authors/{}".format(record_control_number), headers=headers
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_authors_application_json_post_with_token(inspire_app):
    expected_status_code = 201
    token = create_user_and_token()

    headers = {"Authorization": "BEARER " + token.access_token}
    rec_data = faker.record("aut")

    with inspire_app.test_client() as client:
        response = client.post("/authors", headers=headers, json=rec_data)

    response_status_code = response.status_code
    assert expected_status_code == response_status_code


def test_author_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("aut")
    record = create_record("aut", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/authors/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "authors"
