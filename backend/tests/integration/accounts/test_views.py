# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from flask import session
from helpers.utils import create_user
from invenio_accounts.testutils import login_user_via_session
from invenio_oauthclient import current_oauthclient
from invenio_oauthclient.models import RemoteAccount
from sqlalchemy.exc import IntegrityError


def test_me_returns_error_when_not_logged_in(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/accounts/me", content_type="application/json")
    assert response.status_code == 401


def test_me_returns_user_data_if_logged_in(inspire_app):
    user = create_user(role="user", orcid="0000-0001-8829-5461", allow_push=True)
    expected_data = {
        "data": {
            "email": user.email,
            "roles": ["user"],
            "orcid": "0000-0001-8829-5461",
            "allow_orcid_push": True,
        }
    }
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
    response = client.get("/accounts/me", content_type="application/json")
    assert response.json == expected_data


def test_login_sets_next_url(inspire_app):
    with inspire_app.test_client() as client:
        client.get("/accounts/login?next=/jobs")
        assert session["next_url"] == "/jobs"


def test_login_redirects_to_oauthclient_login(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/accounts/login?next=/jobs")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_redirect_url = "http://localhost:5000/api/oauth/login/orcid"
    expected_status_code = 302
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


def test_login_success_redirects_to_next_url(inspire_app):
    next_url = "http://localhost:3000/literature?q=moskovic"
    with inspire_app.test_client() as client:
        with client.session_transaction() as sess:
            sess["next_url"] = next_url
        response = client.get("/accounts/login-success")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_redirect_url = next_url
    expected_status_code = 302
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


# Session is lost in rare occasions due to issues with redis
def test_login_success_redirects_to_home_if_next_url_not_in_session(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/accounts/login-success")

    response_status_code = response.status_code
    response_location_header = response.headers.get("Location")

    expected_redirect_url = "http://localhost:5000/"
    expected_status_code = 302
    assert expected_status_code == response_status_code
    assert response_location_header == expected_redirect_url


@mock.patch("flask_login.utils._get_user")
def test_sign_up_user_success(mock_current_user, inspire_app):
    """It's mocking current user because invenio handlers need a lot of things to
    setup in order to make it properly work and we don't want to test this functinality."""

    def return_true():
        return True

    previous_current_oauthclient_signup_handlers = current_oauthclient.signup_handlers
    current_oauthclient.signup_handlers["orcid"] = {"view": return_true}
    user = create_user(role="user", orcid="0000-0001-8829-5461", allow_push=True)
    mock_current_user.return_value = user
    with inspire_app.test_client() as client:
        response = client.post(
            "/accounts/signup",
            data=orjson.dumps({"email": user.email}),
            content_type="application/json",
        )
    current_oauthclient.signup_handlers = previous_current_oauthclient_signup_handlers

    expected_data = {
        "data": {
            "email": user.email,
            "roles": ["user"],
            "orcid": "0000-0001-8829-5461",
            "allow_orcid_push": True,
        }
    }
    expected_status = 200

    assert expected_status == response.status_code
    assert expected_data == response.json


def test_sign_up_user_error_on_duplicate_user(inspire_app):
    def raise_error():
        raise IntegrityError("statement", "params", "orig")

    previous_current_oauthclient_signup_handlers = current_oauthclient.signup_handlers
    current_oauthclient.signup_handlers["orcid"] = {"view": raise_error}
    user = create_user(role="user")
    with inspire_app.test_client() as client:
        response = client.post(
            "/accounts/signup",
            data=orjson.dumps({"email": user.email}),
            content_type="application/json",
        )

    current_oauthclient.signup_handlers = previous_current_oauthclient_signup_handlers

    expected_status = 400
    expected_data = {"message": "Email already exists.", "code": 400}

    assert expected_status == response.status_code
    assert expected_data == response.json


def test_sign_up_user_error_on_unexpected_error(inspire_app):
    def raise_error():
        raise Exception

    previous_current_oauthclient_signup_handlers = current_oauthclient.signup_handlers

    current_oauthclient.signup_handlers["orcid"] = {"view": raise_error}
    user = create_user(role="user")
    with inspire_app.test_client() as client:
        response = client.post(
            "/accounts/signup",
            data=orjson.dumps({"email": user.email}),
            content_type="application/json",
        )

    current_oauthclient.signup_handlers = previous_current_oauthclient_signup_handlers

    expected_status = 400
    expected_data = {"message": "Cannot create user.", "code": 400}

    assert expected_status == response.status_code
    assert expected_data == response.json


@mock.patch("inspirehep.accounts.views.push_account_literature_to_orcid")
def test_disable_orcid_push(mock_push_account_literature, inspire_app):
    user = create_user(role="user", orcid="0000-0001-8829-5461")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            "/accounts/settings/orcid-push",
            data=orjson.dumps({"value": False}),
            content_type="application/json",
        )

    expected_status = 200
    assert expected_status == response.status_code

    orcid_account = RemoteAccount.query.filter_by(user_id=user.get_id()).one_or_none()

    assert orcid_account.extra_data["allow_push"] == False

    mock_push_account_literature.apply_async.assert_not_called()


@mock.patch("inspirehep.accounts.views.push_account_literature_to_orcid")
def test_enable_orcid_push(mock_push_account_literature, inspire_app):
    orcid = "0000-0001-8829-5461"
    token = "test-orcid-token"
    user = create_user(role="user", orcid=orcid, token=token)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            "/accounts/settings/orcid-push",
            data=orjson.dumps({"value": True}),
            content_type="application/json",
        )

    expected_status = 200
    assert expected_status == response.status_code

    orcid_account = RemoteAccount.query.filter_by(user_id=user.get_id()).one_or_none()

    assert orcid_account.extra_data["allow_push"] == True

    mock_push_account_literature.apply_async.assert_called_with(
        kwargs={"orcid": orcid, "token": token}
    )


def test_orcid_push_setting_without_user(inspire_app):
    with inspire_app.test_client() as client:
        response = client.put(
            "/accounts/settings/orcid-push",
            data=orjson.dumps({"value": True}),
            content_type="application/json",
        )

    expected_status = 401
    assert expected_status == response.status_code
