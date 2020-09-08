# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy

import mock
from freezegun import freeze_time
from helpers.utils import create_record, create_user, logout
from invenio_accounts.testutils import login_user_via_session
from invenio_oauthclient import current_oauthclient
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
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

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


@mock.patch("flask_login.utils._get_user")
def test_jobs_json_author_can_edit_but_random_user_cant(
    mock_current_user, inspire_app, datadir
):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    user_orcid = "0000-0002-9127-1687"
    current_oauthclient.signup_handlers["orcid"] = {"view": True}
    jobs_author = create_user(role="user", orcid=user_orcid, allow_push=True)
    mock_current_user.return_value = jobs_author

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    expected_result["can_edit"] = True

    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

        response_status_code = response.status_code
        response_data_metadata = json.loads(response.data)["metadata"]

        assert expected_status_code == response_status_code
        assert expected_result == response_data_metadata

        random_user = create_user(email="random@user.com", orcid="not_valid")
        mock_current_user.return_value = random_user

        response = client.get(f"/jobs/{record_control_number}", headers=headers)
        response_data_metadata = json.loads(response.data)["metadata"]

    assert not response_data_metadata["can_edit"]


@freeze_time("2020-02-01")
def test_jobs_json_author_can_edit_if_closed_and_less_than_30_days_after_deadline(
    inspire_app, datadir
):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "955427.json").read_text())
    data["deadline_date"] = "2020-01-15"
    data["status"] = "closed"

    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    expected_result["can_edit"] = True

    jobs_author = create_user(email="test@cern.ch", orcid="0000-0002-9127-1687")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=jobs_author.email)
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data_metadata = json.loads(response.data)["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


@freeze_time("2020-02-01")
@mock.patch("flask_login.utils._get_user")
def test_jobs_json_author_cannot_edit_if_is_closed_and_more_than_30_days_after_deadline(
    mock_current_user, inspire_app, datadir
):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "955427.json").read_text())
    data["deadline_date"] = "2019-06-01"
    data["status"] = "closed"
    record = create_record("job", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    expected_result["can_edit"] = False

    user_orcid = "0000-0002-9127-1687"
    current_oauthclient.signup_handlers["orcid"] = {"view": True}
    jobs_author = create_user(role="user", orcid=user_orcid, allow_push=True)
    mock_current_user.return_value = jobs_author
    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data_metadata = json.loads(response.data)["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


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


@mock.patch("flask_login.utils._get_user")
def test_jobs_search_json_can_edit(mock_current_user, inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    user_orcid = "0000-0002-9127-1687"

    create_record(
        "job", data={"status": "open", "acquisition_source": {"orcid": user_orcid}}
    )
    create_record(
        "job",
        data={"status": "open", "acquisition_source": {"orcid": "0100-0002-9127-1687"}},
    )
    user_orcid = "0000-0002-9127-1687"
    current_oauthclient.signup_handlers["orcid"] = {"view": True}
    jobs_author = create_user(role="user", orcid=user_orcid, allow_push=True)
    mock_current_user.return_value = jobs_author
    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/", headers=headers)

    hits = response.json["hits"]["hits"]

    own_job_metadata = next(
        hit["metadata"]
        for hit in hits
        if hit["metadata"]["acquisition_source"]["orcid"] == user_orcid
    )
    another_job_metadata = next(
        hit["metadata"]
        for hit in hits
        if hit["metadata"]["acquisition_source"]["orcid"] != user_orcid
    )

    assert not another_job_metadata["can_edit"]
    assert own_job_metadata["can_edit"]


def test_jobs_detail_links(inspire_app):
    expected_status_code = 200
    record = create_record("job")
    expected_links = {
        "json": f"http://localhost:5000/jobs/{record['control_number']}?format=json"
    }
    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record['control_number']}")
    assert response.status_code == expected_status_code
    assert response.json["links"] == expected_links


def test_jobs_detail_json_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("job")
    expected_content_type = "application/json"
    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record['control_number']}?format=json")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type


def test_jobs_detail_serialize_experiment_with_referenced_record(inspire_app):
    expected_status_code = 200
    expected_accelerator_experiments = [
        {
            "name": "LIGO",
            "record": {"$ref": "http://localhost:5000/api/experiments/1110623"},
        }
    ]
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record(
        "job",
        data={
            "accelerator_experiments": [
                {
                    "legacy_name": "LIGO",
                    "record": {
                        "$ref": "http://labs.inspirehep.net/api/experiments/1110623"
                    },
                }
            ]
        },
    )

    experiment = create_record(
        "exp", data={"control_number": 1_110_623, "institutions": [{"value": "LIGO"}]}
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/jobs/{record['control_number']}", headers=headers)

    assert response.status_code == expected_status_code
    assert (
        response.json["metadata"]["accelerator_experiments"]
        == expected_accelerator_experiments
    )
