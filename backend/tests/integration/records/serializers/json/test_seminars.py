# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session
from marshmallow import utils

from inspirehep.accounts.roles import Roles


def test_seminars_json_without_login(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1.json").read_text())

    record = create_record("sem", data=data)
    record_control_number = record["control_number"]

    expected_metadata = deepcopy(record)
    del expected_metadata["_collections"]
    del expected_metadata["_private_notes"]
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        response = client.get(f"/seminars/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_seminars_json_with_logged_in_cataloger(inspire_app, datadir):
    user = create_user(role=Roles.cataloger.value)

    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1.json").read_text())

    record = create_record("sem", data=data)
    record_control_number = record["control_number"]

    expected_metadata = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/seminars/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_seminars_search_json(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1.json").read_text())

    record = create_record("sem", data=data)

    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    del expected_result["_collections"]
    del expected_result["_private_notes"]
    with inspire_app.test_client() as client:
        response = client.get("/seminars", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_seminars_logged_in_search_json(inspire_app, datadir):
    with inspire_app.test_client() as client:
        user = create_user(role=Roles.cataloger.value)
        login_user_via_session(client, email=user.email)

        headers = {"Accept": "application/json"}

        data = json.loads((datadir / "1.json").read_text())

        record = create_record("sem", data=data)

        expected_result = deepcopy(record)
        expected_created = utils.isoformat(record.created)
        expected_updated = utils.isoformat(record.updated)

        response = client.get("/seminars", headers=headers)

        response_data_hit = response.json["hits"]["hits"][0]

        response_created = response_data_hit["created"]
        response_updated = response_data_hit["updated"]
        response_metadata = response_data_hit["metadata"]

        assert expected_result == response_metadata
        assert expected_created == response_created
        assert expected_updated == response_updated
