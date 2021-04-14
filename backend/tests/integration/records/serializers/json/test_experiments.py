# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

import orjson
from helpers.utils import create_record, create_record_factory, create_user
from invenio_accounts.testutils import login_user_via_session
from marshmallow import utils

from inspirehep.accounts.roles import Roles


def test_experiments_json_without_login(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = orjson.loads((datadir / "1108739.json").read_text())

    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    expected_metadata = deepcopy(record.json)
    del expected_metadata["_collections"]
    del expected_metadata["_private_notes"]
    expected_metadata["number_of_papers"] = 0
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}", headers=headers)

    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_experiments_json_with_loggedin_cataloger(inspire_app, datadir):
    user = create_user(role=Roles.cataloger.value)

    headers = {"Accept": "application/json"}

    data = orjson.loads((datadir / "1108739.json").read_text())

    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    expected_metadata = deepcopy(record.json)
    expected_metadata["number_of_papers"] = 0
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/experiments/{record_control_number}", headers=headers)

    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_experiments_json_search(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = orjson.loads((datadir / "1108739.json").read_text())

    record = create_record("exp", data=data)

    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    del expected_result["_collections"]
    del expected_result["_private_notes"]
    expected_result["number_of_papers"] = 0
    expected_result["normalized_name_variants"] = ["CERN-EMU11", "EMU11"]
    with inspire_app.test_client() as client:
        response = client.get("/experiments", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_experiments_detail(inspire_app, datadir):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = orjson.loads((datadir / "1108739.json").read_text())

    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    expected_metadata = deepcopy(record.json)
    del expected_metadata["_collections"]
    del expected_metadata["_private_notes"]
    expected_metadata["number_of_papers"] = 0
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}", headers=headers)

    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_parent_experiments_in_detail_page(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_name": "Exp Parent"}
    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/experiments/{record_control_number}"
                },
                "relation": "parent",
                "curated_relation": True,
            },
            {
                "record": {"$ref": "https://inspirebeta.net/api/experiments/123"},
                "reation": "successor",
            },
        ]
    }

    expected_parent_institutions_data = [
        {"control_number": record_control_number, "legacy_name": "Exp Parent"}
    ]
    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}", headers=headers)
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["parent_experiments"]
        == expected_parent_institutions_data
    )


def test_successor_experiments_in_detail_page(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_name": "Experiment 1"}
    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/experiments/{record_control_number}"
                },
                "relation": "successor",
                "curated_relation": True,
            }
        ]
    }

    expected_successor_experiments_data = [
        {"control_number": record_control_number, "legacy_name": "Experiment 1"}
    ]
    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}", headers=headers)
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["successor_experiments"]
        == expected_successor_experiments_data
    )


def test_predecessor_experiments_in_detail_page(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_name": "Experiment 1"}
    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/experiments/{record_control_number}"
                },
                "relation": "predecessor",
                "curated_relation": True,
            }
        ]
    }

    expected_predecessor_experiments_data = [
        {"control_number": record_control_number, "legacy_name": "Experiment 1"}
    ]
    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}", headers=headers)
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["predecessor_experiments"]
        == expected_predecessor_experiments_data
    )


def test_subsidiary_experiments_in_detail_page(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_name": "Experiment 1"}
    record = create_record("exp", data=data)
    record_control_number = record["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/experiments/{record_control_number}"
                },
                "relation": "parent",
                "curated_relation": True,
            }
        ],
        "legacy_name": "Subsidiary experiment",
    }

    record_with_parent_relation = create_record("exp", data=data)
    record_with_parent_relation_control_number = record_with_parent_relation[
        "control_number"
    ]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/experiments/{record_control_number}"
                },
                "relation": "predecessor",
                "curated_relation": True,
            }
        ]
    }

    create_record("exp", data=data)
    expected_subsidiary_records = [
        {
            "control_number": record_with_parent_relation_control_number,
            "legacy_name": "Subsidiary experiment",
        }
    ]
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record_control_number}", headers=headers)
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["subsidiary_experiments"] == expected_subsidiary_records
    )


def test_experiments_detail_links(inspire_app):
    expected_status_code = 200
    record = create_record("exp")
    expected_links = {
        "json": f"http://localhost:5000/experiments/{record['control_number']}?format=json"
    }
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record['control_number']}")
    assert response.status_code == expected_status_code
    assert response.json["links"] == expected_links


def test_experiments_detail_json_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("exp")
    expected_content_type = "application/json"
    with inspire_app.test_client() as client:
        response = client.get(f"/experiments/{record['control_number']}?format=json")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type
