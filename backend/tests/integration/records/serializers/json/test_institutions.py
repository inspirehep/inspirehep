# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from helpers.utils import create_record, create_record_factory, create_user
from invenio_accounts.testutils import login_user_via_session
from marshmallow import utils

from inspirehep.accounts.roles import Roles


def test_institutions_json_without_login(api_client, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "903324.json").read_text())

    record = create_record("ins", data=data)
    record_control_number = record["control_number"]

    expected_metadata = deepcopy(record)
    expected_metadata["addresses"][0]["country"] = "Austria"
    expected_metadata["number_of_papers"] = 0
    del expected_metadata["_collections"]
    del expected_metadata["_private_notes"]
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_institutions_json_with_logged_in_cataloger(api_client, datadir):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "903324.json").read_text())

    record = create_record("ins", data=data)
    record_control_number = record["control_number"]

    expected_metadata = deepcopy(record)
    expected_metadata["addresses"][0]["country"] = "Austria"
    expected_metadata["number_of_papers"] = 0
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_institutions_search_json(api_client, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "903324.json").read_text())

    record = create_record("ins", data=data)

    expected_result = deepcopy(record)
    expected_result["addresses"][0]["country"] = "Austria"
    expected_result["number_of_papers"] = 0
    del expected_result["_collections"]
    del expected_result["_private_notes"]
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get("/institutions", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_institutions_detail(api_client, datadir):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "903324.json").read_text())

    record = create_record("ins", data=data)
    record_control_number = record["control_number"]

    expected_metadata = dict(deepcopy(record))
    expected_metadata.update(
        {
            "addresses": [
                {
                    "country": "Austria",
                    "cities": ["Vienna"],
                    "latitude": 48.187_383_3,
                    "longitude": 16.362_259_3,
                    "postal_code": "1050",
                    "country_code": "AT",
                    "postal_address": ["Nikolsdorfer Gasse 18", "A-1050 Wien"],
                }
            ],
            "grid": "grid.450258.e",
            "ror": "https://ror.org/039shy520",
            "number_of_papers": 0,
        }
    )
    del expected_metadata["_collections"]
    del expected_metadata["_private_notes"]
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_parent_institutions_in_detail_page(api_client):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_ICN": "Ins Parent"}
    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/institutions/{record_control_number}"
                },
                "relation": "parent",
                "curated_relation": True,
            },
            {
                "record": {"$ref": f"https://inspirebeta.net/api/institutions/123"},
                "reation": "successor",
            },
        ],
        "number_of_papers": 0,
    }

    expected_parent_institutions_data = [
        {"control_number": record_control_number, "legacy_ICN": "Ins Parent"}
    ]
    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]
    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["parent_institutions"]
        == expected_parent_institutions_data
    )


def test_successor_institutions_in_detail_page(api_client):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_ICN": "Ins Parent"}
    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/institutions/{record_control_number}"
                },
                "relation": "successor",
                "curated_relation": True,
            }
        ]
    }

    expected_successor_institutions_data = [
        {"control_number": record_control_number, "legacy_ICN": "Ins Parent"}
    ]
    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]
    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["successor_institutions"]
        == expected_successor_institutions_data
    )


def test_predecessor_institutions_in_detail_page(api_client):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_ICN": "Ins Parent"}
    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/institutions/{record_control_number}"
                },
                "relation": "predecessor",
                "curated_relation": True,
            }
        ],
        "number_of_papers": 0,
    }

    expected_predecessor_institutions_data = [
        {"control_number": record_control_number, "legacy_ICN": "Ins Parent"}
    ]
    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]
    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["predecessor_institutions"]
        == expected_predecessor_institutions_data
    )


def test_subsidiary_institutions_in_detail_page(api_client):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = {"legacy_ICN": "Institution"}
    record = create_record("ins", data=data)
    record_control_number = record["control_number"]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/institutions/{record_control_number}"
                },
                "relation": "parent",
                "curated_relation": True,
            }
        ],
        "legacy_ICN": "Subsidiary institution",
    }

    record_with_parent_relation = create_record("ins", data=data)
    record_with_parent_relation_control_number = record_with_parent_relation[
        "control_number"
    ]

    data = {
        "related_records": [
            {
                "record": {
                    "$ref": f"https://inspirebeta.net/api/institutions/{record_control_number}"
                },
                "relation": "predecessor",
                "curated_relation": True,
            }
        ]
    }

    record_with_predecessor_relation = create_record("ins", data=data)
    expected_subsidiary_records = [
        {
            "control_number": record_with_parent_relation_control_number,
            "legacy_ICN": "Subsidiary institution",
        }
    ]
    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    assert (
        response_data_metadata["subsidiary_institutions"] == expected_subsidiary_records
    )
