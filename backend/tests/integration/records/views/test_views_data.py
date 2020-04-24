# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from helpers.utils import create_record, create_record_factory


def test_data_application_json_get(inspire_app):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_put(inspire_app):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_delete(inspire_app):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_post(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/data")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_search_json_get(inspire_app):
    create_record_factory("dat", with_indexing=True)

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/data")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_record_search_results(inspire_app):
    record = create_record("dat")

    expected_metadata = record.serialize_for_es()

    with inspire_app.test_client() as client:
        result = client.get("/data")

    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata
