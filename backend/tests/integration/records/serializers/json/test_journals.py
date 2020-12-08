# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

import orjson
from helpers.utils import create_record, create_record_factory
from marshmallow import utils


def test_journals_json(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = orjson.loads((datadir / "1212042.json").read_text())

    record = create_record_factory("jou", data=data)
    record_control_number = record.json["control_number"]

    expected_metadata = deepcopy(record.json)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        response = client.get(f"/journals/{record_control_number}", headers=headers)

    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_journals_search_json(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = orjson.loads((datadir / "1212042.json").read_text())

    record = create_record("jou", data=data)

    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        response = client.get("/journals", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_journals_detail_links(inspire_app):
    expected_status_code = 200
    record = create_record("jou")
    expected_links = {
        "json": f"http://localhost:5000/journals/{record['control_number']}?format=json"
    }
    with inspire_app.test_client() as client:
        response = client.get(f"/journals/{record['control_number']}")
    assert response.status_code == expected_status_code
    assert response.json["links"] == expected_links


def test_journals_detail_json_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("jou")
    expected_content_type = "application/json"
    with inspire_app.test_client() as client:
        response = client.get(f"/journals/{record['control_number']}?format=json")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type
