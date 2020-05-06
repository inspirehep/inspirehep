# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from helpers.utils import create_record, create_record_factory


def test_journals_application_json_get(app_clean):
    record = create_record_factory("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with app_clean.app.test_client() as client:
        response = client.get(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_put(app_clean):
    record = create_record_factory("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with app_clean.app.test_client() as client:
        response = client.put(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_delete(app_clean):
    record = create_record_factory("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with app_clean.app.test_client() as client:
        response = client.delete(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_post(app_clean):
    expected_status_code = 401
    with app_clean.app.test_client() as client:
        response = client.post("/journals")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_search_json_get(app_clean):
    create_record_factory("jou", with_indexing=True)

    expected_status_code = 200
    with app_clean.app.test_client() as client:
        response = client.get("/journals")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journal_record_search_results(app_clean):
    record = create_record("jou")

    expected_metadata = record.serialize_for_es()
    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")
    expected_metadata.pop("title_suggest")

    with app_clean.app.test_client() as client:
        result = client.get("/journals")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata
