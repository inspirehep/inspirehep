# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_accounts.testutils import login_user_via_session


def test_me_returns_error_when_not_logged_in(api_client):
    response = api_client.get("/accounts/me", content_type="application/json")
    assert response.status_code == 401


def test_me_returns_user_data_if_logged_in(api_client, create_user):
    user = create_user(role="user")
    login_user_via_session(api_client, email=user.email)
    expected = {"data": {"email": user.email, "roles": ["user"]}}
    response = api_client.get("/accounts/me", content_type="application/json")
    assert response.json == expected
