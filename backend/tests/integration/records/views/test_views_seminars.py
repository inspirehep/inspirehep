# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from operator import itemgetter

from helpers.utils import create_record, create_record_factory


def test_seminars_application_json_get(inspire_app):
    record = create_record_factory("sem", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/seminars/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_seminars_application_json_put(inspire_app):
    record = create_record_factory("sem", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/seminars/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_seminars_application_json_delete(inspire_app):
    record = create_record_factory("sem", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/seminars/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_seminars_application_json_post(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/seminars")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_seminars_search_json_get(inspire_app):
    create_record_factory("sem", with_indexing=True)

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/seminars")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_seminars_record_search_results(inspire_app):
    record = create_record("sem")

    expected_metadata = record.serialize_for_es()
    with inspire_app.test_client() as client:
        result = client.get("/seminars")

    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")
    expected_metadata.pop("_collections")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata


def test_seminars_sort_options(inspire_app):
    create_record("sem")

    with inspire_app.test_client() as client:
        response = client.get(
            "/seminars", headers={"Accept": "application/vnd+inspire.record.ui+json"}
        )
    response_data = response.json

    response_status_code = response.status_code
    response_data_sort_options = response_data["sort_options"]

    expected_status_code = 200
    expected_sort_options = [
        {"display": "Date ascending", "value": "dateasc"},
        {"display": "Date descending", "value": "datedesc"},
    ]

    assert expected_status_code == response_status_code
    assert expected_sort_options == sorted(
        response_data_sort_options, key=itemgetter("value")
    )


def test_seminar_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("sem")
    record = create_record("sem", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/seminars/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "seminars"
