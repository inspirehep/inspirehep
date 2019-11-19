# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_conferences_application_json_get(api_client, db, es, create_record_factory):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_delete(api_client, db, es, create_record_factory):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/conferences")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_search_json_get(api_client, db, es, create_record_factory):
    create_record_factory("con", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/conferences")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conference_record_search_results(
    api_client, db, create_user, es, create_record
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)
    record = create_record("con")
    expected_metadata = record.serialize_for_es()

    result = api_client.get("/conferences")

    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata


def test_conferences_contribution_facets(api_client, db, es, create_record):
    create_record("lit")
    response = api_client.get(
        "/literature/facets?facet_name=hep-conference-contribution"
    )
    response_data = response.json
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = ["subject", "collaboration"]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_conferences_contribution_filters(api_client, db, es, create_record):
    book_chapter_paper = {
        "inspire_categories": [{"term": "Accelerators"}],
        "document_type": ["book chapter"],
    }
    create_record("lit", data=book_chapter_paper)
    conference_paper = {
        "inspire_categories": [{"term": "Computing"}],
        "document_type": ["conference paper"],
    }
    create_record("lit", data=conference_paper)
    response = api_client.get(
        "/literature/facets?facet_name=hep-conference-contribution&doc_type=conference%20paper"
    )
    response_subject_aggregation_buckets = response.json["aggregations"]["subject"][
        "buckets"
    ]
    expected_subject_aggregation_buckets = [{"key": "Computing", "doc_count": 1}]

    assert expected_subject_aggregation_buckets == response_subject_aggregation_buckets


def test_conferences_application_json_put_without_auth(
    api_client, db, es_clear, create_record
):
    record = create_record("con")
    record_control_number = record["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_put_without_cataloger_logged_in(
    api_client, db, es_clear, create_user, create_record
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    record = create_record("con")
    record_control_number = record["control_number"]

    expected_status_code = 403
    response = api_client.put(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_put_with_cataloger_logged_in(
    api_client, db, es_clear, create_user, create_record
):
    cataloger = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=cataloger.email)
    record = create_record("con")
    record_control_number = record["control_number"]

    expected_status_code = 200
    response = api_client.put(
        "/conferences/{}".format(record_control_number),
        content_type="application/json",
        data=json.dumps(
            {
                "$schema": "http://localhost:5000/schemas/records/conferences.json",
                "_collections": ["Conferences"],
            }
        ),
    )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code
