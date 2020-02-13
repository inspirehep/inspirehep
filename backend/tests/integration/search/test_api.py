# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

from helpers.providers.faker import faker
from invenio_accounts.testutils import login_user_via_session

from inspirehep.search.api import LiteratureSearch


def test_literature_get_records_by_pids_returns_correct_record(
    base_app, db, es_clear, create_record
):
    record1 = create_record("lit")
    record1_control_number = record1["control_number"]
    record2 = create_record("lit")
    record2_control_number = record2["control_number"]
    expected_control_numbers = [record1_control_number, record2_control_number]
    result = LiteratureSearch().get_records_by_pids([("lit", record1_control_number)])
    assert len(result) == 1
    assert (
        json.loads(result[0]._ui_display)["control_number"] == record1["control_number"]
    )

    result = LiteratureSearch().get_records_by_pids(
        [("lit", record1_control_number), ("lit", record2_control_number)]
    )

    assert len(result) == len(expected_control_numbers)
    for rec in result:
        assert rec.to_dict()["control_number"] in expected_control_numbers


def test_empty_literature_search(api_client, db, es_clear, create_record):
    create_record("lit")
    create_record("lit")
    response = api_client.get("api/literature")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_literature_search_with_parameter(api_client, db, es_clear, create_record):
    record1 = create_record("lit")
    create_record("lit")
    record1_control_number = record1["control_number"]
    response = api_client.get(f"api/literature?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_empty_authors_search(api_client, db, es_clear, create_record):
    create_record("aut")
    create_record("aut")
    response = api_client.get("api/authors")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_authors_search_with_parameter(api_client, db, es_clear, create_record):
    record1 = create_record("aut")
    create_record("aut")
    record1_control_number = record1["control_number"]
    response = api_client.get(f"api/authors?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_empty_jobs_search(api_client, db, es_clear, create_record):
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "closed"})
    response = api_client.get("api/jobs")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_jobs_search_with_parameter(api_client, db, es_clear, create_record):
    record1 = create_record("job", data={"status": "open"})
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "closed"})
    record1_control_number = record1["control_number"]
    response = api_client.get(f"api/jobs?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_empty_conferences_search(api_client, db, es_clear, create_record):
    create_record("con")
    create_record("con")
    response = api_client.get("api/conferences")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_conferences_search_with_parameter(api_client, db, es_clear, create_record):
    record1 = create_record("con")
    create_record("con")
    record1_control_number = record1["control_number"]
    response = api_client.get(f"api/conferences?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_citations_query_result(api_client, db, es_clear, create_record):
    record_control_number = 12345
    # create self_citation
    record_cited = create_record(
        "lit",
        data={"control_number": record_control_number},
        literature_citations=[record_control_number],
    )
    # create correct citation
    record_citing = create_record("lit", literature_citations=[record_control_number])

    response = api_client.get(f"api/literature/{record_control_number}/citations")

    assert response.json["metadata"]["citation_count"] == 1
    citation = response.json["metadata"]["citations"][0]
    assert citation["control_number"] == record_citing["control_number"]


def test_author_self_affiliations_filter(
    api_client, db, es_clear, create_record, create_user
):
    user = create_user(role="cataloger")
    login_user_via_session(api_client, email=user.email)

    create_record(
        "aut",
        data={
            "name": {
                "name_variants": ["Maldacena, Juan Martin"],
                "preferred_name": "Juan Martin Maldacena",
                "value": "Maldacena, Juan Martin",
            },
            "control_number": 999108,
        },
    )

    lit = create_record(
        "lit",
        data={
            "authors": [
                {
                    "affiliations": [{"value": "Princeton"}, {"value": "Harvard U."}],
                    "full_name": "Maldacena, Juan Martin",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        },
    )

    create_record(
        "lit",
        data={
            "authors": [
                {
                    "affiliations": [{"value": "Harvard U."}],
                    "full_name": "Maldacena, Juan Martin",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        },
    )

    response = api_client.get(
        "api/literature?author=999108_Juan%20Martin%20Maldacena&self_affiliations=Princeton"
    )

    expected_results_count = 1
    expected_control_number = lit["control_number"]
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        expected_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_author_self_author_names_filter(
    api_client, db, es_clear, create_record, create_user
):
    user = create_user(role="cataloger")
    login_user_via_session(api_client, email=user.email)

    create_record(
        "aut",
        data={
            "name": {
                "name_variants": ["Maldacena, Juan Martin"],
                "preferred_name": "Juan Martin Maldacena",
                "value": "Maldacena, Juan Martin",
            },
            "control_number": 999108,
        },
    )

    lit = create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Maldacena, Juan Martin",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        },
    )

    create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Maldacena, Juan",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        },
    )

    response = api_client.get(
        "api/literature?author=999108_Juan%20Martin%20Maldacena&self_author_names=Maldacena%2C%20Juan%20Martin"
    )

    expected_results_count = 1
    expected_control_number = lit["control_number"]
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        expected_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )
