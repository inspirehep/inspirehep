# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker
from invenio_accounts.testutils import login_user_via_session


def test_error_message_on_pid_already_exists(
    api_client, db, es, create_record_factory, create_user_and_token
):
    create_record_factory("lit", data={"control_number": 666})
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    record = faker.record("lit", data={"control_number": 666})
    response = api_client.post(
        "/literature",
        headers=headers,
        content_type="application/json",
        data=json.dumps(record),
    )

    response_status_code = response.status_code
    response_message = response.json["message"]

    expected_status_code = 400
    expected_message = "PIDAlreadyExists: pid_type:'lit', pid_value:'666'."
    assert expected_status_code == response_status_code
    assert expected_message == response_message


def test_does_not_return_deleted_pid_error_if_cataloger(
    api_client, db, es_clear, create_record, create_user
):
    cataloger = create_user(role="cataloger")
    record = create_record("con")
    record.delete()

    login_user_via_session(api_client, email=cataloger.email)

    response = api_client.get(f"/conferences/{record['control_number']}")

    response_status_code = response.status_code
    response_json = response.json

    assert response_status_code == 200


def test_returns_deleted_pid_error_if_not_cataloger(
    api_client, db, es_clear, create_record, create_user
):
    user = create_user(role="user")
    record = create_record("con")
    record.delete()

    login_user_via_session(api_client, email=user.email)

    response = api_client.get(f"/conferences/{record['control_number']}")

    response_status_code = response.status_code
    response_json = response.json

    assert response_status_code == 410
