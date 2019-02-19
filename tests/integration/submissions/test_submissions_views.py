# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest
from flask import jsonify
from mock import patch

from inspirehep.submissions.views import AuthorSubmissionsResource


def test_new_author_submit_without_authentication_post(api_client):
    response = api_client.post(
        "/submissions/authors",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "given_name": "John",
                    "display_name": "John Doe",
                    "status": "active",
                }
            }
        ),
    )
    assert response.status_code == 401


def test_new_author_submit_without_authentication_put(api_client):
    response = api_client.put(
        "/submissions/authors/123",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "given_name": "John",
                    "display_name": "John Doe",
                    "status": "active",
                }
            }
        ),
    )
    assert response.status_code == 401


def test_new_author_submit_without_authentication_get(api_client):
    response = api_client.get(
        "/submissions/authors/123", content_type="application/json"
    )
    assert response.status_code == 401


@patch("inspirehep.submissions.views.requests.post")
def test_new_author_submit_with_required_fields(
    mock_requests_post, app, api_client, create_user_and_token
):
    mock_requests_post.return_value.status_code = 200
    mock_requests_post.return_value.content = jsonify({"workflow_object_id": 30})
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    response = api_client.post(
        "/submissions/authors",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "given_name": "John",
                    "display_name": "John Doe",
                    "status": "active",
                }
            }
        ),
        headers=headers,
    )
    assert response.status_code == 200


@patch("inspirehep.submissions.views.requests.post")
def test_new_author_submit_with_error(
    mock_requests_post, app, api_client, create_user_and_token
):
    mock_requests_post.return_value.status_code = 500
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    response = api_client.post(
        "/submissions/authors",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "given_name": "John",
                    "display_name": "John Doe",
                    "status": "active",
                }
            }
        ),
        headers=headers,
    )
    assert response.status_code == 503


@patch("inspirehep.submissions.views.requests.post")
def test_update_author_with_required_fields(
    mock_requests_post, app, api_client, create_user_and_token
):
    mock_requests_post.return_value.status_code = 200
    mock_requests_post.return_value.content = jsonify({"workflow_object_id": 30})
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    response = api_client.put(
        "/submissions/authors/123",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "given_name": "John",
                    "display_name": "John Doe",
                    "status": "active",
                }
            }
        ),
        headers=headers,
    )
    assert response.status_code == 200


@patch("inspirehep.submissions.views.current_user", email="johndoe@gmail.com")
@patch("inspirehep.submissions.views.current_user.get_id", return_value=1)
@patch(
    "inspirehep.submissions.views.AuthorSubmissionsResource." "_get_user_orcid",
    return_value=2,
)
def test_populate_and_serialize_data_for_submission(
    mock_get_user_orcid, mock_get_id, mock_current_user, app
):
    data = {"given_name": "John", "display_name": "John Doe", "status": "active"}

    expected = {
        "_collections": ["Authors"],
        "name": {"preferred_name": "John Doe", "value": "John"},
        "status": "active",
        "acquisition_source": {
            "submission_number": "None",
            "email": "johndoe@gmail.com",
            "method": "submitter",
            "orcid": 2,
            "internal_uid": 1,
        },
    }
    data = AuthorSubmissionsResource().populate_and_serialize_data_for_submission(data)
    del data["acquisition_source"]["datetime"]
    assert data == expected
