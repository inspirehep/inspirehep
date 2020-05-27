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


def test_seminars_detail(inspire_app, datadir):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}

        data = json.loads((datadir / "1.json").read_text())

        record = create_record("sem", data=data)
        record_control_number = record["control_number"]

        expected_metadata = dict(deepcopy(record))

        expected_metadata["can_edit"] = False
        expected_metadata["speakers"][0]["first_name"] = "Frank"
        expected_metadata["speakers"][0]["last_name"] = "Castle"
        expected_metadata["speakers"][1]["first_name"] = "Jane Smith"
        del expected_metadata["_collections"]
        del expected_metadata["_private_notes"]
        expected_created = utils.isoformat(record.created)
        expected_updated = utils.isoformat(record.updated)

        response = client.get(f"/seminars/{record_control_number}", headers=headers)

        response_data = json.loads(response.data)
        response_data_metadata = response_data["metadata"]
        response_created = response_data["created"]
        response_updated = response_data["updated"]

        assert expected_metadata == response_data_metadata
        assert expected_created == response_created
        assert expected_updated == response_updated


def test_seminars_search(inspire_app, datadir):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}

        data = json.loads((datadir / "1.json").read_text())

        record = create_record("sem", data=data)

        expected_metadata = dict(deepcopy(record))

        expected_metadata["can_edit"] = False
        expected_metadata["speakers"][0]["first_name"] = "Frank"
        expected_metadata["speakers"][0]["last_name"] = "Castle"
        expected_metadata["speakers"][1]["first_name"] = "Jane Smith"
        del expected_metadata["_collections"]
        del expected_metadata["_private_notes"]
        expected_created = utils.isoformat(record.created)
        expected_updated = utils.isoformat(record.updated)

        response = client.get(f"/seminars", headers=headers)

        response_data = json.loads(response.data)
        response_data_metadata = response_data["hits"]["hits"][0]["metadata"]
        response_created = response_data["hits"]["hits"][0]["created"]
        response_updated = response_data["hits"]["hits"][0]["updated"]

        assert expected_metadata == response_data_metadata
        assert expected_created == response_created
        assert expected_updated == response_updated


def test_seminars_detail_submitter_can_edit(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}

        user = create_user(email="john@cern.ch", orcid="0000-0002-6665-4934")
        create_record(
            "sem",
            data={
                "acquisition_source": {
                    "email": "john@cern.ch",
                    "orcid": "0000-0002-6665-4934",
                }
            },
        )
        create_record(
            "sem",
            data={
                "acquisition_source": {
                    "email": "guy@cern.ch",
                    "orcid": "0000-0002-6665-1234",
                }
            },
        )

        login_user_via_session(client, email=user.email)

        response = client.get("/seminars", headers=headers)

        hits = response.json["hits"]["hits"]

        own_job_metadata = next(
            hit["metadata"]
            for hit in hits
            if hit["metadata"]["acquisition_source"]["email"] == user.email
        )
        another_job_metadata = next(
            hit["metadata"]
            for hit in hits
            if hit["metadata"]["acquisition_source"]["email"] != user.email
        )

        assert not another_job_metadata["can_edit"]
        assert own_job_metadata["can_edit"]


def test_seminars_detail_superuser_can_edit(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}

        create_record("sem", data={"acquisition_source": {"email": "john@cern.ch"}})

        user = create_user(role=Roles.cataloger.value)
        login_user_via_session(client, email=user.email)

        response = client.get("/seminars", headers=headers)

        response_metadata = response.json["hits"]["hits"][0]["metadata"]

        assert response_metadata["can_edit"]


def test_seminars_detail_links(inspire_app):
    expected_status_code = 200
    record = create_record("sem")
    expected_links = {
        "json": f"http://localhost:5000/seminars/{record['control_number']}?format=json"
    }
    with inspire_app.test_client() as client:
        response = client.get(f"/seminars/{record['control_number']}")
    assert response.status_code == expected_status_code
    assert response.json["links"] == expected_links


def test_seminars_detail_json_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("sem")
    expected_content_type = "application/json"
    with inspire_app.test_client() as client:
        response = client.get(f"/seminars/{record['control_number']}?format=json")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type
