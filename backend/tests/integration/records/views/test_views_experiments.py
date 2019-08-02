# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def test_experiments_application_json_get(api_client, db, es, create_record_factory):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_put(api_client, db, es, create_record_factory):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_delete(api_client, db, es, create_record_factory):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/experiments")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_search_json_get(api_client, db, es, create_record_factory):
    create_record_factory("exp", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/experiments")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_record_search_results(api_client, db, es_clear, create_record):
    record = create_record("exp")

    expected_metadata = record.serialize_for_es()
    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")

    result = api_client.get("/experiments")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata
