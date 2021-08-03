# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from helpers.utils import create_record, create_record_factory, create_user_and_token

from inspirehep.accounts.roles import Roles


def test_experiments_application_json_get(inspire_app):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_put(inspire_app):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_delete(inspire_app):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_post(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/experiments")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_search_json_get(inspire_app):
    create_record_factory("exp", with_indexing=True)

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/experiments")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_record_search_results(inspire_app):
    record = create_record("exp")

    expected_metadata = record.serialize_for_es()
    del expected_metadata["_collections"]
    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")

    with inspire_app.test_client() as client:
        result = client.get("/experiments")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata


def test_experiment_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("exp")
    record = create_record("exp", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "experiments"


def test_experiment_update_permission(inspire_app):
    record = create_record("exp")
    control_number = record["control_number"]
    token = create_user_and_token(user_role=Roles.cataloger.value)
    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}
    with inspire_app.test_client() as client:
        response = client.put(
            f"/experiments/{control_number}", headers=headers, json=record
        )
        assert response.status_code == 200
