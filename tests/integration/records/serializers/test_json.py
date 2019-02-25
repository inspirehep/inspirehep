# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
import json
from copy import deepcopy
from helpers.providers.faker import faker


def test_literature_application_json(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_result == response_data["metadata"]


def test_literature_application_json_search(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    record = create_record("lit", with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    expected_result_len = 1

    response = api_client.get("/literature/", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_len = len(response_data_hits)
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result_len == response_data_hits_len
    assert expected_result == response_data_hits_metadata


def test_literature_application_json_ui(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]
    record_titles = record.json["titles"]

    expected_status_code = 200
    expected_result_metadata = {
        "_collections": ["Literature"],
        "control_number": record_control_number,
        "document_type": ["article"],
        "titles": record_titles,
    }
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result_metadata == response_data_metadata


@pytest.mark.skip(reason="the indexing that adds ``_ui_display`` is not here yet.")
def test_literature_application_json_ui_search(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit", with_indexing=True)

    expected_status_code = 200
    expected_result = []
    response = api_client.get("/literature/", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    expected_data_hits = response_data["hits"]["hits"]

    assert expected_status_code == response_status_code
    assert expected_result == expected_data_hits


def test_literature_application_json_authors(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    full_name_1 = faker.name()
    data = {
        "authors": [{"full_name": full_name_1}],
        "collaborations": [{"value": "ATLAS"}],
    }
    record = create_record("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {
        "authors": [{"first_name": full_name_1, "full_name": full_name_1}],
        "collaborations": [{"value": "ATLAS"}],
    }
    response = api_client.get(
        "/literature/{}/authors".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_application_json_references(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    reference_without_link_title = faker.sentence()

    record_referenced = create_record("lit")
    record_referenced_control_number = record_referenced.json["control_number"]
    record_referenced_titles = record_referenced.json["titles"]

    data = {
        "references": [
            {
                "reference": {
                    "title": {"title": reference_without_link_title},
                    "label": "1",
                }
            },
            {
                "record": {
                    "$ref": "http://localhost:5000/api/literature/{}".format(
                        record_referenced_control_number
                    )
                },
                "reference": {"label": "2"},
            },
        ]
    }
    record = create_record("lit", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {
        "references": [
            {"label": "1", "titles": [{"title": reference_without_link_title}]},
            {
                "control_number": record_referenced_control_number,
                "titles": record_referenced_titles,
                "label": "2",
            },
        ]
    }

    response = api_client.get(
        "/literature/{}/references".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata
