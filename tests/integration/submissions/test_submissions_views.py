# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from invenio_accounts.testutils import login_user_via_session
from mock import patch

from inspirehep.submissions.views import AuthorSubmissionsResource


def test_author_submit_requires_authentication(api_client):
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


def test_author_update_requires_authentication(api_client):
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


def test_author_get_requires_authentication(api_client):
    response = api_client.get(
        "/submissions/authors/123", content_type="application/json"
    )
    assert response.status_code == 401


def test_new_author_submit(app, api_client, create_user, requests_mock):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors",
        json={"workflow_object_id": 30},
    )
    user = create_user()
    login_user_via_session(api_client, email=user.email)
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

    assert response.status_code == 200
    assert requests_mock.call_count == 1
    history = requests_mock.request_history[0]
    post_data = history.json()
    assert (
        "Authorization" in history.headers
        and f"Bearer {app.config['AUTHENTICATION_TOKEN']}"
        == history.headers["Authorization"]
    )
    assert history.url == f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors"
    assert "datetime" in post_data["data"]["acquisition_source"]
    del post_data["data"]["acquisition_source"]["datetime"]
    assert post_data == {
        "data": {
            "_collections": ["Authors"],
            "acquisition_source": {
                "email": user.email,
                "method": "submitter",
                "source": "submitter",
                "submission_number": "None",
                "internal_uid": user.id,
            },
            "name": {"value": "John", "preferred_name": "John Doe"},
            "status": "active",
        }
    }


def test_new_author_submit_with_workflows_error(
    app, api_client, create_user_and_token, requests_mock
):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors", status_code=500
    )
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


def test_new_author_submit_works_with_session_login(
    app, api_client, create_user, requests_mock
):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors",
        json={"workflow_object_id": 30},
    )
    user = create_user()
    login_user_via_session(api_client, email=user.email)
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
    assert response.status_code == 200


def test_get_author_update_data(app, api_client, create_user, create_record_factory):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    author_data = {
        "control_number": 123,
        "name": {"value": "John", "preferred_name": "John Doe"},
        "email_addresses": [
            {"value": "public@john.ch"},
            {"value": "private@john.ch", "hidden": True},
        ],
        "status": "active",
    }
    create_record_factory("aut", data=author_data)

    expected_data = {
        "data": {
            "given_name": "John",
            "display_name": "John Doe",
            "status": "active",
            "emails": [{"value": "public@john.ch"}],
        }
    }

    response = api_client.get(
        "/submissions/authors/123", headers={"Accept": "application/json"}
    )
    response_data = json.loads(response.data)

    assert response_data == expected_data


def test_get_author_update_data_of_same_author(
    app, api_client, create_user, create_record_factory
):
    orcid = "0000-0001-5109-3700"
    user = create_user(orcid=orcid)
    login_user_via_session(api_client, email=user.email)

    author_data = {
        "control_number": 123,
        "name": {"value": "John", "preferred_name": "John Doe"},
        "ids": [{"schema": "ORCID", "value": orcid}],
        "email_addresses": [
            {"value": "public@john.ch"},
            {"value": "private@john.ch", "hidden": True},
        ],
        "status": "active",
    }
    create_record_factory("aut", data=author_data)

    expected_data = {
        "data": {
            "given_name": "John",
            "display_name": "John Doe",
            "status": "active",
            "orcid": orcid,
            "emails": [
                {"value": "public@john.ch"},
                {"value": "private@john.ch", "hidden": True},
            ],
        }
    }

    response = api_client.get(
        "/submissions/authors/123", headers={"Accept": "application/json"}
    )
    response_data = json.loads(response.data)

    assert response_data == expected_data


def test_get_author_update_data_not_found(api_client, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    response = api_client.get(
        "/submissions/authors/1993", headers={"Accept": "application/json"}
    )

    assert response.status_code == 404


def test_get_author_update_data_requires_auth(api_client):
    response = api_client.get(
        "/submissions/authors/1993", headers={"Accept": "application/json"}
    )

    assert response.status_code == 401


def test_update_author(app, api_client, create_user, requests_mock):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors",
        json={"workflow_object_id": 30},
    )
    user = create_user()
    login_user_via_session(api_client, email=user.email)
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
    assert response.status_code == 200
    assert requests_mock.call_count == 1
    history = requests_mock.request_history[0]
    post_data = history.json()
    assert (
        "Authorization" in history.headers
        and f"Bearer {app.config['AUTHENTICATION_TOKEN']}"
        == history.headers["Authorization"]
    )
    assert history.url == f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors"
    assert "datetime" in post_data["data"]["acquisition_source"]
    del post_data["data"]["acquisition_source"]["datetime"]
    assert post_data == {
        "data": {
            "_collections": ["Authors"],
            "acquisition_source": {
                "email": user.email,
                "method": "submitter",
                "source": "submitter",
                "submission_number": "None",
                "internal_uid": user.id,
            },
            "control_number": 123,
            "name": {"value": "John", "preferred_name": "John Doe"},
            "status": "active",
        }
    }


@patch("inspirehep.submissions.views.current_user", email="johndoe@gmail.com")
@patch("inspirehep.submissions.views.current_user.get_id", return_value=1)
@patch(
    "inspirehep.submissions.views.BaseSubmissionsResource.get_user_orcid",
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
            "source": "submitter",
            "orcid": 2,
            "internal_uid": 1,
        },
    }
    data = AuthorSubmissionsResource().populate_and_serialize_data_for_submission(data)
    del data["acquisition_source"]["datetime"]
    assert data == expected


def test_new_literature_submit(app, api_client, create_user, requests_mock):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature",
        json={"workflow_object_id": 30},
    )
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/literature",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "document_type": "article",
                    "authors": [{"full_name": "Urhan, Harun"}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                    "pdf_link": "https://cern.ch/coolstuff.pdf",
                    "references": "[1] Dude",
                }
            }
        ),
    )
    assert response.status_code == 200
    assert requests_mock.call_count == 1
    history = requests_mock.request_history[0]
    post_data = history.json()
    assert (
        "Authorization" in history.headers
        and f"Bearer {app.config['AUTHENTICATION_TOKEN']}"
        == history.headers["Authorization"]
    )
    assert history.url == f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature"
    assert "datetime" in post_data["data"]["acquisition_source"]
    del post_data["data"]["acquisition_source"]["datetime"]
    assert post_data == {
        "data": {
            "_collections": ["Literature"],
            "curated": False,
            "document_type": ["article"],
            "authors": [{"full_name": "Urhan, Harun"}],
            "titles": [{"title": "Discovery of cool stuff", "source": "submitter"}],
            "inspire_categories": [{"term": "Other"}],
            "acquisition_source": {
                "email": user.email,
                "method": "submitter",
                "source": "submitter",
                "internal_uid": user.id,
            },
        },
        "form_data": {"url": "https://cern.ch/coolstuff.pdf", "references": "[1] Dude"},
    }


def test_new_literature_submit_works_with_session_login(
    app, api_client, create_user, requests_mock
):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature",
        json={"workflow_object_id": 30},
    )
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/literature",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "document_type": "article",
                    "authors": [{"full_name": "Urhan, Harun"}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                }
            }
        ),
    )
    assert response.status_code == 200


def test_new_literature_submit_requires_authentication(api_client):
    response = api_client.post(
        "/submissions/literature",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "document_type": "article",
                    "authors": [{"full_name": "Urhan, Harun"}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                }
            }
        ),
    )
    assert response.status_code == 401


def test_new_literature_submit_with_workflows_api_error(
    app, api_client, create_user_and_token, requests_mock
):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature", status_code=500
    )
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    response = api_client.post(
        "/submissions/literature",
        content_type="application/json",
        data=json.dumps(
            {
                "data": {
                    "document_type": "article",
                    "authors": [{"full_name": "Urhan, Harun"}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                }
            }
        ),
        headers=headers,
    )
    assert response.status_code == 503
