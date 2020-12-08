# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from helpers.utils import create_record, create_record_factory, create_user
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_institutions_application_json_get(inspire_app):
    record = create_record_factory("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_put(inspire_app):
    record = create_record_factory("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_delete(inspire_app):
    record = create_record_factory("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_post(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/institutions")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_search_json_get(inspire_app):
    create_record_factory("ins", with_indexing=True)

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/institutions")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institution_record_search_results(inspire_app):
    record = create_record("ins")

    expected_metadata = record.serialize_for_es()
    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")
    expected_metadata.pop("_collections")

    with inspire_app.test_client() as client:
        result = client.get("/institutions")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata


def test_institutions_application_json_put_without_auth(inspire_app):
    record = create_record("ins")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_put_without_cataloger_logged_in(inspire_app):
    user = create_user()
    record = create_record("ins")
    record_control_number = record["control_number"]

    expected_status_code = 403
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_put_with_cataloger_logged_in(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    record = create_record("ins")
    record_control_number = record["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.put(
            "/institutions/{}".format(record_control_number),
            content_type="application/json",
            data=orjson.dumps(
                {
                    "control_number": record_control_number,
                    "$schema": "http://localhost:5000/schemas/records/institutions.json",
                    "_collections": ["Institutions"],
                }
            ),
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institution_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("ins")
    record = create_record("ins", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/institutions/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "institutions"
