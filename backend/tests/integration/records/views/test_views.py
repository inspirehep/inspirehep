# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.providers.faker import faker
from helpers.utils import (
    create_record,
    create_record_factory,
    create_user,
    create_user_and_token,
)
from invenio_accounts.testutils import login_user_via_session


def test_error_message_on_pid_already_exists(inspire_app):
    create_record_factory("lit", data={"control_number": 666})
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    record = faker.record("lit", data={"control_number": 666})
    with inspire_app.test_client() as client:
        response = client.post(
            "/literature",
            headers=headers,
            content_type="application/json",
            data=orjson.dumps(record),
        )

    response_status_code = response.status_code
    response_message = response.json["message"]

    expected_status_code = 400
    expected_message = "PIDAlreadyExists: pid_type:'lit', pid_value:'666'."
    assert expected_status_code == response_status_code
    assert expected_message == response_message


def test_does_not_return_deleted_pid_error_if_cataloger(inspire_app):
    cataloger = create_user(role="cataloger")
    record = create_record("con")
    record.delete()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.get(f"/conferences/{record['control_number']}")

    response_status_code = response.status_code
    response_json = response.json

    assert response_status_code == 200


def test_returns_deleted_pid_error_if_not_cataloger(inspire_app):
    user = create_user(role="user")
    record = create_record("con")
    record.delete()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/conferences/{record['control_number']}")

    response_status_code = response.status_code
    response_json = response.json

    assert response_status_code == 410


def test_does_not_update_stale(inspire_app):
    cataloger = create_user(role="cataloger")
    record = create_record("con")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        get_response = client.get(f"/conferences/{record_control_number}")
        etag = get_response.headers["ETag"]

        first_put_response = client.put(
            "/conferences/{}".format(record_control_number),
            content_type="application/json",
            data=orjson.dumps(
                faker.record("con", data={"control_number": record_control_number})
            ),
            headers={"If-Match": etag},
        )

        assert first_put_response.status_code == 200

        stale_put_response = client.put(
            f"/conferences/{record_control_number}",
            content_type="application/json",
            data=orjson.dumps(
                faker.record("con", data={"control_number": record_control_number})
            ),
            headers={"If-Match": etag},
        )

    assert stale_put_response.status_code == 412


def test_returns_304_if_not_modified(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        first_get_response = client.get(f"/literature/{record_control_number}")
        last_modified = first_get_response.headers["Last-Modified"]

        second_get_response = client.get(
            f"/literature/{record_control_number}",
            headers={"If-Modified-Since": last_modified},
        )

        assert second_get_response.status_code == 304


def test_returns_301_with_proper_location_when_record_redirected(inspire_app):
    record_redirected = create_record("lit")
    record = create_record("lit", data={"deleted_records": [record_redirected["self"]]})

    redirected_cn = record_redirected["control_number"]
    new_cn = str(record["control_number"])

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{redirected_cn}")

    assert response.status_code == 301
    assert response.location.split("/")[-1] == new_cn


def test_returns_301_with_proper_location_when_record_redirected_in_chain(inspire_app):
    record_redirected_1 = create_record("lit")
    record_redirected_2 = create_record(
        "lit", data={"deleted_records": [record_redirected_1["self"]]}
    )
    record = create_record(
        "lit", data={"deleted_records": [record_redirected_2["self"]]}
    )

    redirected_cn = record_redirected_1["control_number"]
    new_cn = str(record["control_number"])

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{redirected_cn}")

    assert response.status_code == 301
    assert response.location.split("/")[-1] == new_cn
