# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.factories.models.migrator import LegacyRecordsMirrorFactory
from helpers.utils import create_user
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_get_returns_the_records_in_descending_order_by_last_updated(
    app_clean, datadir
):
    user = create_user(role=Roles.cataloger.value)

    data = (datadir / "1674997.xml").read_bytes()
    LegacyRecordsMirrorFactory(
        recid=1674997,
        _marcxml=data,
        collection="HEP",
        _errors="Error: Least recent error.",
        valid=False,
    )
    data = (datadir / "1674989.xml").read_bytes()
    LegacyRecordsMirrorFactory(
        recid=1674989,
        _marcxml=data,
        collection="HEP",
        _errors="Error: Middle error.",
        valid=False,
    )
    data = (datadir / "1674987.xml").read_bytes()
    LegacyRecordsMirrorFactory(
        _marcxml=data,
        recid=1674987,
        collection="HEP",
        _errors="Error: Most recent error.",
        valid=False,
    )
    with app_clean.app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/migrator/errors", content_type="application/json")

    expected_data = {
        "data": [
            {
                "recid": 1674987,
                "collection": "HEP",
                "valid": False,
                "error": "Error: Most recent error.",
            },
            {
                "recid": 1674989,
                "collection": "HEP",
                "valid": False,
                "error": "Error: Middle error.",
            },
            {
                "recid": 1674997,
                "collection": "HEP",
                "valid": False,
                "error": "Error: Least recent error.",
            },
        ]
    }

    response_data = json.loads(response.data)

    assert response.status_code == 200
    assert expected_data == response_data


def test_get_does_not_return_deleted_records(app_clean, datadir):
    user = create_user(role=Roles.cataloger.value)

    data = (datadir / "1674997.xml").read_bytes()
    LegacyRecordsMirrorFactory(
        recid=1674997,
        _marcxml=data,
        collection="HEP",
        _errors="Error: Least recent error.",
        valid=False,
    )
    data = (datadir / "1674989.xml").read_bytes()
    LegacyRecordsMirrorFactory(
        recid=1674989,
        _marcxml=data,
        collection="DELETED",
        _errors="Error: Middle error.",
        valid=False,
    )
    data = (datadir / "1674987.xml").read_bytes()
    LegacyRecordsMirrorFactory(
        recid=1674987,
        _marcxml=data,
        collection="HEPNAMES",
        _errors="Error: Most recent error.",
        valid=False,
    )
    with app_clean.app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/migrator/errors", content_type="application/json")

    expected_data = {
        "data": [
            {
                "recid": 1674987,
                "collection": "HEPNAMES",
                "valid": False,
                "error": "Error: Most recent error.",
            },
            {
                "recid": 1674997,
                "collection": "HEP",
                "valid": False,
                "error": "Error: Least recent error.",
            },
        ]
    }

    response_data = json.loads(response.data)

    assert response.status_code == 200
    assert expected_data == response_data


def test_get_returns_empty_data_because_there_are_no_mirror_records_with_errors(
    app_clean
):
    user = create_user(role=Roles.cataloger.value)
    with app_clean.app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/migrator/errors", content_type="application/json")

    expected_data = {"data": []}

    assert response.status_code == 200
    assert json.loads(response.data) == expected_data


def test_get_returns_permission_denied_if_not_logged_in_as_privileged_user(app_clean):
    with app_clean.app.test_client() as client:
        response = client.get("/migrator/errors", content_type="application/json")

    assert response.status_code == 401
