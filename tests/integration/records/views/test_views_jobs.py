# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json


def test_jobs_application_json_get(api_client, db, create_record):
    record = create_record("job")
    record_control_number = record["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_put(api_client, db, create_record):
    record = create_record("job")
    record_control_number = record["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_delete(api_client, db, create_record):
    record = create_record("job")
    record_control_number = record["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/jobs")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_search_json_get(api_client, db, create_record):
    create_record("job")

    expected_status_code = 200
    response = api_client.get("/jobs")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_record_search_results(api_client, db, es_clear, create_record):
    record = create_record("job")

    expected_metadata = record._dump_for_es()
    expected_results = 1

    result = api_client.get("/jobs")

    result_metadata = result.json["hits"]["hits"][0]["metadata"]
    result_created = result.json["hits"]["hits"][0]["created"]
    result_updated = result.json["hits"]["hits"][0]["updated"]

    expected_metadata_created = expected_metadata.pop("_created")
    expected_metadata_updated = expected_metadata.pop("_updated")

    assert expected_metadata_created == result_created
    assert expected_metadata_updated == result_updated
    assert expected_metadata == result_metadata
    assert expected_results == result.json["hits"]["total"]


def test_jobs_facets(api_client, db, es_clear, create_record, datadir):
    data = json.loads((datadir / "1735925.json").read_text())
    record = create_record("job", data=data)

    expected_aggregations = json.loads(
        (datadir / "es_aggregations_for_1735925.json").read_text()
    )

    response = api_client.get("/jobs/facets")
    response_data = response.json

    response_status_code = response.status_code
    response_aggregations = response_data["aggregations"]

    expected_status_code = 200

    assert expected_status_code == response_status_code
    assert expected_aggregations == response_aggregations


def test_jobs_sort_options(api_client, db, es_clear, create_record, datadir):
    data = json.loads((datadir / "1735925.json").read_text())
    record = create_record("job", data=data)

    response = api_client.get("/jobs")
    response_data = response.json

    response_status_code = response.status_code
    response_data_sort_options = response_data["sort_options"]

    expected_status_code = 200
    expected_sort_options = [
        {"value": "mostrecent", "display": "Most Recent"},
        {"value": "deadline", "display": "Deadline"},
    ]

    assert expected_status_code == response_status_code
    assert expected_sort_options == response_data_sort_options


def test_jobs_sort_by_deadline(api_client, db, es_clear, create_record, datadir):
    data = json.loads((datadir / "1735925.json").read_text())
    record = create_record("job", data=data)
    data["deadline_date"] = "2020-12-31"
    data["control_number"] = 1_735_926
    record_with_later_deadline = create_record("job", data=data)
    expected_first_control_number = 1_735_926
    expected_second_control_number = 1_735_925

    response = api_client.get("/jobs?sort=deadline")

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


def test_jobs_accelerator_experiments(api_client, db, es_clear, create_record, datadir):
    data = json.loads((datadir / "1735925.json").read_text())
    create_record("job", data=data)
    response = api_client.get("/jobs/1735925")
    response_accelerator_experiments = response.json["metadata"][
        "accelerator_experiments"
    ]
    response_status_code = response.status_code

    expected_accelerator_experiments = [{"name": "FNAL-E-0973"}, {"name": "LDMX"}]
    expected_status_code = 200

    assert expected_status_code == response_status_code
    assert expected_accelerator_experiments == response_accelerator_experiments
