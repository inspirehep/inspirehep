# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.utils import create_record, create_user, logout
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_jobs_application_json_get(inspire_app):
    record = create_record("job")
    record_control_number = record["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_put(inspire_app):
    record = create_record("job")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_delete(inspire_app):
    record = create_record("job")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_post(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/jobs")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_search_json_get(inspire_app):
    create_record("job")

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/jobs")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_facets(inspire_app, datadir):
    data = orjson.loads((datadir / "1735925.json").read_text())
    create_record("job", data=data)

    expected_aggregations = orjson.loads(
        (datadir / "es_aggregations_for_1735925.json").read_text()
    )
    with inspire_app.test_client() as client:
        response = client.get("/jobs/facets")
    response_data = response.json

    response_status_code = response.status_code
    response_aggregations = response_data["aggregations"]

    expected_status_code = 200

    assert expected_status_code == response_status_code
    assert expected_aggregations == response_aggregations
    assert len(response_data["hits"]["hits"]) == 0


def test_jobs_facets_cataloger(inspire_app, datadir):
    user = create_user(role=Roles.cataloger.value)

    data = orjson.loads((datadir / "1735925.json").read_text())
    create_record("job", data=data)

    expected_aggregations = orjson.loads(
        (datadir / "es_aggregations_cataloger_for_1735925.json").read_text()
    )
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/jobs/facets")
    response_data = response.json

    response_status_code = response.status_code
    response_aggregations = response_data["aggregations"]

    expected_status_code = 200

    assert expected_status_code == response_status_code
    assert expected_aggregations == response_aggregations


def test_jobs_sort_options(inspire_app, datadir):
    data = orjson.loads((datadir / "1735925.json").read_text())
    record = create_record("job", data=data)

    with inspire_app.test_client() as client:
        response = client.get("/jobs")
    response_data = response.json

    response_status_code = response.status_code
    response_data_sort_options = response_data["sort_options"]

    expected_status_code = 200
    expected_sort_options_1 = {"value": "mostrecent", "display": "Most Recent"}

    assert expected_status_code == response_status_code
    assert expected_sort_options_1 in response_data_sort_options


def test_jobs_accelerator_experiments(inspire_app, datadir):
    data = orjson.loads((datadir / "1735925.json").read_text())
    create_record("job", data=data)
    exp1 = create_record(
        "exp", data={"control_number": 1_108_209, "legacy_name": "FNAL-E-0973"}
    )

    with inspire_app.test_client() as client:
        response = client.get("/jobs/1735925")
    response_accelerator_experiments = response.json["metadata"][
        "accelerator_experiments"
    ]
    response_status_code = response.status_code

    expected_accelerator_experiments = [
        {
            "name": "FNAL-E-0973",
            "record": {"$ref": "http://localhost:5000/api/experiments/1108209"},
        },
        {"name": "LDMX"},
    ]
    expected_status_code = 200

    assert expected_status_code == response_status_code
    assert expected_accelerator_experiments == response_accelerator_experiments


def test_jobs_record_search_results_does_not_return_pending_job_to_non_superuser(
    inspire_app,
):
    create_record("job", data={"status": "pending"})
    with inspire_app.test_client() as client:
        result = client.get("/jobs")
    assert result.json["hits"]["total"] == 0


def test_jobs_record_search_results_returns_open_job_to_non_superuser(inspire_app):
    record = create_record(
        "job",
        data={"status": "open", "acquisition_source": {"orcid": "0000-0000-0000-0000"}},
    )

    with inspire_app.test_client() as client:
        result = client.get("/jobs")

    expected_metadata = record.serialize_for_es()
    expected_metadata.pop("_updated")
    expected_metadata.pop("_created")
    expected_results = 1

    assert result.json["hits"]["total"] == expected_results

    result_metadata = result.json["hits"]["hits"][0]["metadata"]

    assert expected_metadata == result_metadata
    assert expected_results == result.json["hits"]["total"]


def test_jobs_record_search_results_returns_pending_job_to_superuser(inspire_app):
    user = create_user(role=Roles.cataloger.value)

    record = create_record("job", data={"status": "pending"})

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        result = client.get("/jobs")

        expected_metadata = record.serialize_for_es()
        expected_metadata.pop("_updated")
        expected_metadata.pop("_created")
        expected_results = 1

        result_metadata = result.json["hits"]["hits"][0]["metadata"]

        assert expected_metadata == result_metadata
        assert expected_results == result.json["hits"]["total"]


def test_jobs_search_permissions(inspire_app):
    create_record("job", data={"status": "pending"})
    create_record("job", data={"status": "open"})
    with inspire_app.test_client() as client:
        response = client.get("/jobs")
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1

    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)

        response = client.get("/jobs")
        response_data = orjson.loads(response.data)

        assert response_data["hits"]["total"] == 2

        logout(client)

        response = client.get("/jobs")
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1


def test_jobs_sort_options(inspire_app, datadir):
    data = orjson.loads((datadir / "1735925.json").read_text())
    record = create_record("job", data=data)

    with inspire_app.test_client() as client:
        response = client.get("/jobs")
    response_data = response.json

    response_status_code = response.status_code
    response_data_sort_options = response_data["sort_options"]

    expected_status_code = 200
    expected_sort_options_1 = {"value": "mostrecent", "display": "Most Recent"}
    expected_sort_options_2 = {"value": "deadline", "display": "Earliest Deadline"}

    assert expected_status_code == response_status_code
    assert expected_sort_options_1 in response_data_sort_options
    assert expected_sort_options_2 in response_data_sort_options


def test_jobs_sort_by_deadline(inspire_app, datadir):
    data = orjson.loads((datadir / "1735925.json").read_text())
    create_record("job", data=data)
    data["deadline_date"] = "2020-12-31"
    data["control_number"] = 1_735_926
    create_record("job", data=data)
    expected_first_control_number = 1_735_925
    expected_second_control_number = 1_735_926

    with inspire_app.test_client() as client:
        response = client.get("/jobs?sort=deadline")

    response_data = response.json
    response_first_control_number = response_data["hits"]["hits"][0]["metadata"][
        "control_number"
    ]
    response_second_control_nubmer = response_data["hits"]["hits"][1]["metadata"][
        "control_number"
    ]

    response_status_code = response.status_code

    expected_status_code = 200

    assert expected_status_code == response_status_code
    assert expected_first_control_number == response_first_control_number
    assert expected_second_control_number == response_second_control_nubmer


def test_job_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("job")
    record = create_record("job", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "jobs"
