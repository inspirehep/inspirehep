# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy

from invenio_accounts.testutils import login_user_via_session
from marshmallow import utils

from inspirehep.accounts.roles import Roles


def test_jobs_json(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record_factory("job", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_result = deepcopy(record.json)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get(f"/jobs/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_data_uuid = response_data["uuid"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_result == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_jobs_json_cataloger_can_edit(
    api_client, db, create_record_factory, datadir, create_user
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record_factory("job", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    expected_result["can_edit"] = True

    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    response = api_client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_jobs_json_author_can_edit_but_random_user_cant(
    api_client, db, create_record_factory, datadir, create_user, logout
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record_factory("job", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    expected_result["can_edit"] = True

    jobs_author = create_user(email="georgews@ntu.com")
    login_user_via_session(api_client, email=jobs_author.email)

    response = api_client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data_metadata = json.loads(response.data)["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata

    logout(api_client)

    random_user = create_user(email="random@user.com")
    login_user_via_session(api_client, email=random_user.email)

    response = api_client.get(f"/jobs/{record_control_number}", headers=headers)
    response_data_metadata = json.loads(response.data)["metadata"]

    assert "can_edit" not in response_data_metadata


def test_jobs_search_json(api_client, db, create_record, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record("job", data=data)

    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get("/jobs", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_jobs_search_json_can_edit(api_client, db, create_record, create_user):
    headers = {"Accept": "application/json"}

    user = create_user(email="harun@cern.ch")
    create_record(
        "job", data={"status": "open", "acquisition_source": {"email": "harun@cern.ch"}}
    )
    create_record(
        "job", data={"status": "open", "acquisition_source": {"email": "guy@cern.ch"}}
    )

    login_user_via_session(api_client, email=user.email)

    response = api_client.get("/jobs", headers=headers)

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

    assert "can_edit" not in another_job_metadata
    assert own_job_metadata["can_edit"]
