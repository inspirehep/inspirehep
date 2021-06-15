# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from operator import itemgetter

import orjson
from freezegun import freeze_time
from helpers.utils import create_record, create_record_factory, create_user
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_conferences_application_json_get(inspire_app):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_delete(inspire_app):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_post(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/conferences")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_search_json_get(inspire_app):
    create_record_factory("con", with_indexing=True)

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/conferences")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conference_record_search_results(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("con")
    expected_metadata = record.serialize_for_es()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        result = client.get("/conferences")

    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata


def test_conferences_contribution_facets(inspire_app):
    create_record("lit")
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/facets?facet_name=hep-conference-contribution"
        )
    response_data = response.json
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = sorted(["subject", "collaboration"])
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_conferences_contribution_filters(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/facets?facet_name=hep-conference-contribution&doc_type=conference%20paper"
        )
    response_subject_aggregation_buckets = response.json["aggregations"]["subject"][
        "buckets"
    ]
    expected_subject_aggregation_buckets = [{"key": "Computing", "doc_count": 1}]

    assert expected_subject_aggregation_buckets == response_subject_aggregation_buckets


def test_conferences_application_json_put_without_auth(inspire_app):
    record = create_record("con")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_put_without_cataloger_logged_in(inspire_app):
    user = create_user()

    record = create_record("con")
    record_control_number = record["control_number"]

    expected_status_code = 403
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_put_with_cataloger_logged_in(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    record = create_record("con")
    record_control_number = record["control_number"]
    expected_status_code = 200
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.put(
            "/conferences/{}".format(record_control_number),
            content_type="application/json",
            headers={
                "If-Match": '"0"'
            },
            data=orjson.dumps(
                {
                    "control_number": record_control_number,
                    "$schema": "http://localhost:5000/schemas/records/conferences.json",
                    "_collections": ["Conferences"],
                }
            ),
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_sort_options(inspire_app):
    create_record("con")

    with inspire_app.test_client() as client:
        response = client.get(
            "/conferences", headers={"Accept": "application/vnd+inspire.record.ui+json"}
        )
    response_data = response.json

    response_status_code = response.status_code
    response_data_sort_options = response_data["sort_options"]

    expected_status_code = 200
    expected_sort_options = [
        {"display": "Best match", "value": "bestmatch"},
        {"display": "Date ascending", "value": "dateasc"},
        {"display": "Date descending", "value": "datedesc"},
    ]

    assert expected_status_code == response_status_code
    assert expected_sort_options == sorted(
        response_data_sort_options, key=itemgetter("value")
    )


def test_conferences_facets(inspire_app):
    create_record("con")
    with inspire_app.test_client() as client:
        response = client.get("/conferences/facets")
    response_data = response.json
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = ["subject", "series"]
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_conferences_filters(inspire_app):
    conference1 = {
        "opening_date": "2019-11-21",
        "inspire_categories": [{"term": "Accelerators"}],
    }
    expected_record = create_record("con", data=conference1)
    conference2 = {
        "inspire_categories": [{"term": "Computing"}],
        "opening_date": "2019-11-21",
    }
    create_record("con", data=conference2)
    conference3 = {
        "inspire_categories": [{"term": "Accelerators"}],
        "opening_date": "2019-11-19",
    }
    create_record("con", data=conference3)
    with inspire_app.test_client() as client:
        response = client.get(
            "/conferences?subject=Accelerators&start_date=2019-11-21--2019-11-24"
        )
    response_data = response.json
    assert len(response_data["hits"]["hits"]) == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == expected_record["control_number"]
    )


def test_conferences_date_range_contains_other_conferences(inspire_app):
    conference_during_april_first_week = {
        "control_number": 1,
        "opening_date": "2019-04-01",
        "closing_date": "2019-04-07",
    }
    conference_during_april_third_week = {
        "control_number": 2,
        "opening_date": "2019-04-14",
        "closing_date": "2019-04-21",
    }
    conference_during_whole_april = {
        "control_number": 3,
        "opening_date": "2019-04-01",
        "closing_date": "2019-04-30",
    }
    conference_during_january = {
        "control_number": 4,
        "opening_date": "2019-01-01",
        "closing_date": "2019-01-30",
    }
    conference_during_june = {
        "control_number": 5,
        "opening_date": "2019-06-01",
        "closing_date": "2019-06-30",
    }
    create_record("con", data=conference_during_april_first_week)
    create_record("con", data=conference_during_april_third_week)
    create_record("con", data=conference_during_whole_april)
    create_record("con", data=conference_during_january)
    create_record("con", data=conference_during_june)

    from_april_5_to_15 = "2019-04-05--2019-04-15"
    with inspire_app.test_client() as client:
        response = client.get(f"/conferences?contains={from_april_5_to_15}")
    response_data = response.json

    assert response_data["hits"]["total"] == 3

    found_recids = [
        record["metadata"]["control_number"] for record in response_data["hits"]["hits"]
    ]
    assert 1 in found_recids
    assert 2 in found_recids
    assert 3 in found_recids


@freeze_time("2019-9-15")
def test_conferences_start_date_range_filter_all(inspire_app):
    conference_in_april_2019 = {"control_number": 1, "opening_date": "2019-04-15"}
    upcoming_conference_april_2020 = {"control_number": 2, "opening_date": "2020-04-15"}
    upcoming_conference_january_2020 = {
        "control_number": 3,
        "opening_date": "2020-01-15",
    }
    conference_in_february_2019 = {"control_number": 4, "opening_date": "2019-02-15"}
    create_record("con", data=conference_in_april_2019)
    create_record("con", data=upcoming_conference_april_2020)
    create_record("con", data=upcoming_conference_january_2020)
    create_record("con", data=conference_in_february_2019)

    with inspire_app.test_client() as client:
        all_response = client.get("/conferences?start_date=all")
    all_data = all_response.json
    assert all_data["hits"]["total"] == 4
    all_recids = sorted(
        [record["metadata"]["control_number"] for record in all_data["hits"]["hits"]]
    )
    assert all_recids == [1, 2, 3, 4]


@freeze_time("2019-9-15")
def test_conferences_start_date_range_filter_upcoming(inspire_app):
    conference_in_april_2019 = {"control_number": 1, "opening_date": "2019-04-15"}
    upcoming_conference_april_2020 = {"control_number": 2, "opening_date": "2020-04-15"}
    upcoming_conference_january_2020 = {
        "control_number": 3,
        "opening_date": "2020-01-15",
    }
    conference_in_february_2019 = {"control_number": 4, "opening_date": "2019-02-15"}
    create_record("con", data=conference_in_april_2019)
    create_record("con", data=upcoming_conference_april_2020)
    create_record("con", data=upcoming_conference_january_2020)
    create_record("con", data=conference_in_february_2019)

    with inspire_app.test_client() as client:
        upcoming_response = client.get("/conferences?start_date=upcoming")
    upcoming_data = upcoming_response.json
    assert upcoming_data["hits"]["total"] == 2
    upcoming_recids = sorted(
        [
            record["metadata"]["control_number"]
            for record in upcoming_data["hits"]["hits"]
        ]
    )
    assert upcoming_recids == [2, 3]


@freeze_time("2019-9-15")
def test_conferences_start_date_range_filter_with_only_single_date(inspire_app):
    conference_in_april_2019 = {"control_number": 1, "opening_date": "2019-04-15"}
    upcoming_conference_april_2020 = {"control_number": 2, "opening_date": "2020-04-15"}
    upcoming_conference_january_2020 = {
        "control_number": 3,
        "opening_date": "2020-01-15",
    }
    conference_in_february_2019 = {"control_number": 4, "opening_date": "2019-02-15"}
    create_record("con", data=conference_in_april_2019)
    create_record("con", data=upcoming_conference_april_2020)
    create_record("con", data=upcoming_conference_january_2020)
    create_record("con", data=conference_in_february_2019)

    with inspire_app.test_client() as client:
        after_march_2019_data = client.get("/conferences?start_date=2019-03-01--").json
    assert after_march_2019_data["hits"]["total"] == 3
    after_march_2019_recids = sorted(
        [
            record["metadata"]["control_number"]
            for record in after_march_2019_data["hits"]["hits"]
        ]
    )
    assert after_march_2019_recids == [1, 2, 3]


@freeze_time("2019-9-15")
def test_conferences_start_date_range_filter_with_both_dates(inspire_app):
    conference_in_april_2019 = {"control_number": 1, "opening_date": "2019-04-15"}
    upcoming_conference_april_2020 = {"control_number": 2, "opening_date": "2020-04-15"}
    upcoming_conference_january_2020 = {
        "control_number": 3,
        "opening_date": "2020-01-15",
    }
    conference_in_february_2019 = {"control_number": 4, "opening_date": "2019-02-15"}
    create_record("con", data=conference_in_april_2019)
    create_record("con", data=upcoming_conference_april_2020)
    create_record("con", data=upcoming_conference_january_2020)
    create_record("con", data=conference_in_february_2019)

    with inspire_app.test_client() as client:
        between_march_2019_and_february_2020_response = client.get(
            "/conferences?start_date=2019-03-01--2020-02-01"
        )
    between_march_2019_and_february_2020_data = (
        between_march_2019_and_february_2020_response.json
    )
    assert between_march_2019_and_february_2020_data["hits"]["total"] == 2
    between_march_2019_and_february_2020_recids = sorted(
        [
            record["metadata"]["control_number"]
            for record in between_march_2019_and_february_2020_data["hits"]["hits"]
        ]
    )
    assert between_march_2019_and_february_2020_recids == [1, 3]


def test_conference_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("con")
    record = create_record("con", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/conferences/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "conferences"
