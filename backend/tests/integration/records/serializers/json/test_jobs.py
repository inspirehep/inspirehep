# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy

from freezegun import freeze_time
from helpers.utils import create_record, create_user, logout
from invenio_accounts.testutils import login_user_via_session
from marshmallow import utils

from inspirehep.accounts.roles import Roles


def test_jobs_json(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_data_uuid = response_data["uuid"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_result == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_jobs_json_cataloger_can_edit(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    expected_result["can_edit"] = True

    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_jobs_json_author_can_edit_but_random_user_cant(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    expected_result["can_edit"] = True

    jobs_author = create_user(email="georgews@ntu.com")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=jobs_author.email)
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

        response_status_code = response.status_code
        response_data_metadata = json.loads(response.data)["metadata"]

        assert expected_status_code == response_status_code
        assert expected_result == response_data_metadata

        logout(client)

        random_user = create_user(email="random@user.com")
        login_user_via_session(client, email=random_user.email)

        response = client.get(f"/jobs/{record_control_number}", headers=headers)
        response_data_metadata = json.loads(response.data)["metadata"]

    assert "can_edit" not in response_data_metadata


@freeze_time("2020-02-01")
def test_jobs_json_author_can_edit_if_closed_and_less_than_30_days_after_deadline(
    inspire_app, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())
    data["deadline_date"] = "2020-01-15"
    data["status"] = "closed"

    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    expected_result["can_edit"] = True

    jobs_author = create_user(email="georgews@ntu.com")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=jobs_author.email)
        response = client.get(f"/jobs/{record_control_number}", headers=headers)
    response_status_code = response.status_code
    response_data_metadata = json.loads(response.data)["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


@freeze_time("2020-02-01")
def test_jobs_json_author_cannot_edit_if_is_closed_and_more_than_30_days_after_deadline(
    inspire_app, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())
    data["deadline_date"] = "2019-06-01"
    data["status"] = "closed"
    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)

    jobs_author = create_user(email="georgews@ntu.com")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=jobs_author.email)
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data_metadata = json.loads(response.data)["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata

    assert "can_edit" not in response_data_metadata


def test_jobs_search_json(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record("job", data=data)

    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    with inspire_app.test_client() as client:
        response = client.get("/jobs", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_jobs_search_json_can_edit(inspire_app):
    headers = {"Accept": "application/json"}

    user = create_user(email="harun@cern.ch")
    create_record(
        "job", data={"status": "open", "acquisition_source": {"email": "harun@cern.ch"}}
    )
    create_record(
        "job", data={"status": "open", "acquisition_source": {"email": "guy@cern.ch"}}
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/jobs", headers=headers)

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
