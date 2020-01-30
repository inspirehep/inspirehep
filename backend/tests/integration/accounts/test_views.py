# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import mock
from flask import render_template
from invenio_accounts.testutils import login_user_via_session
from invenio_oauthclient import current_oauthclient
from sqlalchemy.exc import IntegrityError


def test_me_returns_error_when_not_logged_in(api_client):
    response = api_client.get("/accounts/me", content_type="application/json")
    assert response.status_code == 401


def test_me_returns_user_data_if_logged_in(api_client, create_user):
    user = create_user(role="user")
    login_user_via_session(api_client, email=user.email)
    expected = {"data": {"email": user.email, "roles": ["user"]}}
    response = api_client.get("/accounts/me", content_type="application/json")
    assert response.json == expected


def test_login_success_returns_the_correct_template(api_client, create_user):
    user = create_user(role="user")
    login_user_via_session(api_client, email=user.email)
    payload = {"data": {"email": user.email, "roles": ["user"]}}

    expected = render_template("accounts/postmessage.html", payload=payload)
    response = api_client.get("/accounts/login_success")
    assert expected == response.get_data(as_text=True)


def test_sign_up_required_returns_the_correct_template(api_client, create_user):
    user = create_user(role="user")
    login_user_via_session(api_client, email=user.email)
    payload = {"user_needs_sign_up": True}

    expected = render_template("accounts/postmessage.html", payload=payload)
    response = api_client.get("/accounts/signup")
    assert expected == response.get_data(as_text=True)


@mock.patch("flask_login.utils._get_user")
def test_sign_up_user_success(mock_current_user, api_client, create_user):
    """It's mocking current user because invenio handlers need a lot of things to
    setup in order to make it properly work and we don't want to test this functinality."""

    def return_true():
        return True

    previous_current_oauthclient_signup_handlers = current_oauthclient.signup_handlers
    current_oauthclient.signup_handlers["orcid"] = {"view": return_true}
    user = create_user(role="user")
    mock_current_user.return_value = user

    response = api_client.post(
        "/accounts/signup",
        data=json.dumps({"email": user.email}),
        content_type="application/json",
    )
    current_oauthclient.signup_handlers = previous_current_oauthclient_signup_handlers

    expected_data = {"data": {"email": user.email, "roles": ["user"]}}
    expected_status = 200

    assert expected_status == response.status_code
    assert expected_data == response.json


def test_sign_up_user_error_on_duplicate_user(api_client, create_user):
    def raise_error():
        raise IntegrityError("statement", "params", "orig")

    previous_current_oauthclient_signup_handlers = current_oauthclient.signup_handlers
    current_oauthclient.signup_handlers["orcid"] = {"view": raise_error}
    user = create_user(role="user")
    current_user = user
    response = api_client.post(
        "/accounts/signup",
        data=json.dumps({"email": user.email}),
        content_type="application/json",
    )

    current_oauthclient.signup_handlers = previous_current_oauthclient_signup_handlers

    expected_status = 400
    expected_data = {"message": "Email already exists.", "code": 400}

    assert expected_status == response.status_code
    assert expected_data == response.json


def test_sign_up_user_error_on_unexpected_error(api_client, create_user):
    def raise_error():
        raise Exception

    previous_current_oauthclient_signup_handlers = current_oauthclient.signup_handlers

    current_oauthclient.signup_handlers["orcid"] = {"view": raise_error}
    user = create_user(role="user")
    response = api_client.post(
        "/accounts/signup",
        data=json.dumps({"email": user.email}),
        content_type="application/json",
    )

    current_oauthclient.signup_handlers = previous_current_oauthclient_signup_handlers

    expected_status = 400
    expected_data = {"message": "Cannot create user.", "code": 400}

    assert expected_status == response.status_code
    assert expected_data == response.json
