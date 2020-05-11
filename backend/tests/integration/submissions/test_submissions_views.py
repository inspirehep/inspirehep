# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from flask import url_for
from freezegun import freeze_time
from inspire_utils.record import get_value
from invenio_accounts.testutils import login_user_via_session
from mock import patch

from inspirehep.accounts.roles import Roles
from inspirehep.records.api import ConferencesRecord, JobsRecord, SeminarsRecord
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


@freeze_time("2019-06-17")
def test_new_author_submit(app, api_client, db, create_user, requests_mock):
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
    expected_data = {
        "data": {
            "_collections": ["Authors"],
            "acquisition_source": {
                "email": user.email,
                "method": "submitter",
                "source": "submitter",
                "internal_uid": user.id,
                "datetime": "2019-06-17T00:00:00",
            },
            "name": {"value": "John", "preferred_name": "John Doe"},
            "status": "active",
        }
    }
    assert expected_data == post_data


def test_new_author_submit_with_workflows_error(
    app, api_client, db, create_user_and_token, requests_mock
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
    app, api_client, db, create_user, requests_mock
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


def test_get_author_update_data(api_client, db, create_user, create_record_factory):
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
    api_client, db, create_user, create_record_factory
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


def test_get_author_update_data_not_found(api_client, db, create_user):
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


@freeze_time("2019-06-17")
def test_update_author(app, api_client, db, create_user, requests_mock):
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

    expected_data = {
        "data": {
            "_collections": ["Authors"],
            "name": {"preferred_name": "John Doe", "value": "John"},
            "status": "active",
            "acquisition_source": {
                "email": user.email,
                "datetime": "2019-06-17T00:00:00",
                "method": "submitter",
                "source": "submitter",
                "internal_uid": user.id,
            },
            "control_number": 123,
        }
    }
    assert history.url == f"{app.config['INSPIRE_NEXT_URL']}/workflows/authors"
    assert expected_data == post_data


@freeze_time("2019-06-17")
def test_new_literature_submit_no_merge(
    app, api_client, db, create_user, requests_mock
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
                    "arxiv_id": "1701.00006",
                    "arxiv_categories": ["hep-th"],
                    "preprint_date": "2019-10-15",
                    "document_type": "article",
                    "authors": [{"full_name": "Urhan, Harun"}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                    "pdf_link": "https://cern.ch/coolstuff.pdf",
                    "references": "[1] Dude",
                    "additional_link": "https://cern.ch/other_stuff.pdf",
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
    expected_data = {
        "data": {
            "_collections": ["Literature"],
            "acquisition_source": {
                "email": user.email,
                "internal_uid": user.id,
                "method": "submitter",
                "source": "submitter",
                "datetime": "2019-06-17T00:00:00",
            },
            "preprint_date": "2019-10-15",
            "arxiv_eprints": [{"categories": ["hep-th"], "value": "1701.00006"}],
            "authors": [{"full_name": "Urhan, Harun"}],
            "citeable": True,
            "curated": False,
            "document_type": ["article"],
            "inspire_categories": [{"term": "Other"}],
            "titles": [{"source": "submitter", "title": "Discovery of cool stuff"}],
            "urls": [
                {"value": "https://cern.ch/coolstuff.pdf"},
                {"value": "https://cern.ch/other_stuff.pdf"},
            ],
        },
        "form_data": {"references": "[1] Dude", "url": "https://cern.ch/coolstuff.pdf"},
    }
    assert post_data == expected_data


@freeze_time("2019-06-17")
def test_new_literature_submit_arxiv_urls(
    app, api_client, db, create_user, requests_mock
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
                    "arxiv_id": "1701.00006",
                    "arxiv_categories": ["hep-th"],
                    "preprint_date": "2019-10-15",
                    "document_type": "article",
                    "authors": [{"full_name": "Urhan, Harun"}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                    "pdf_link": "https://arxiv.org/coolstuff.pdf",
                    "references": "[1] Dude",
                    "additional_link": "https://arxiv.org/other_stuff.pdf",
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
    expected_data = {
        "data": {
            "_collections": ["Literature"],
            "acquisition_source": {
                "email": user.email,
                "internal_uid": user.id,
                "method": "submitter",
                "source": "submitter",
                "datetime": "2019-06-17T00:00:00",
            },
            "preprint_date": "2019-10-15",
            "arxiv_eprints": [{"categories": ["hep-th"], "value": "1701.00006"}],
            "authors": [{"full_name": "Urhan, Harun"}],
            "citeable": True,
            "curated": False,
            "document_type": ["article"],
            "inspire_categories": [{"term": "Other"}],
            "titles": [{"source": "submitter", "title": "Discovery of cool stuff"}],
        },
        "form_data": {
            "references": "[1] Dude",
            "url": "https://arxiv.org/coolstuff.pdf",
        },
    }
    assert post_data == expected_data


def test_new_literature_submit_works_with_session_login(
    app, api_client, db, create_user, requests_mock
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
    app, api_client, db, create_user_and_token, requests_mock
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


DEFAULT_EXAMPLE_JOB_DATA = {
    "deadline_date": "2030-01-01",
    "description": "description",
    "field_of_interest": ["q-bio"],
    "reference_letter_contact": {},
    "regions": ["Europe"],
    "status": "pending",
    "title": "Some title",
    "external_job_identifier": "",
}


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_job_submit_requires_authentication(ticket_mock, api_client):
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps(DEFAULT_EXAMPLE_JOB_DATA),
    )

    assert response.status_code == 401


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_job_update_requires_authentication(ticket_mock, api_client):
    response = api_client.post(
        "/submissions/jobs/1234",
        content_type="application/json",
        data=json.dumps(DEFAULT_EXAMPLE_JOB_DATA),
    )

    assert response.status_code == 401


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_job_get_requires_authentication(ticket_mock, api_client):
    response = api_client.get("/submissions/jobs/123", content_type="application/json")
    assert response.status_code == 401


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_job_submit_by_user(create_ticket_mock, api_client, db, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": DEFAULT_EXAMPLE_JOB_DATA}),
    )
    assert response.status_code == 201

    job_id = json.loads(response.data)["pid_value"]
    job_data = JobsRecord.get_record_by_pid_value(job_id)

    assert job_data["status"] == "pending"
    create_ticket_mock.delay.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_job_submit_by_cataloger(ticket_mock, api_client, db, create_user):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    post_data = {**DEFAULT_EXAMPLE_JOB_DATA, "status": "open"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": post_data}),
    )
    assert response.status_code == 201

    job_id = json.loads(response.data)["pid_value"]
    job_data = JobsRecord.get_record_by_pid_value(job_id)

    assert job_data["status"] == "open"


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_job_submit_with_wrong_field_value(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    data = {**DEFAULT_EXAMPLE_JOB_DATA, "deadline_date": "some value"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 400


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_job_submit_with_wrong_status_value(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    data = {**DEFAULT_EXAMPLE_JOB_DATA, "status": "closed"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    record = api_client.get(record_url).json["data"]
    assert record["status"] == "pending"


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job(create_ticket_mock, api_client, db, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )

    assert response.status_code == 201

    create_ticket_mock.reset_mock()

    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    data["title"] = "New test title"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response2.status_code == 200
    record = api_client.get(record_url).json["data"]
    assert record["title"] == "New test title"
    create_ticket_mock.delay.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_status_from_pending_not_curator(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )

    assert response.status_code == 201

    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    data["status"] = "open"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response2.status_code == 400
    record = api_client.get(record_url).json["data"]
    assert record["status"] == "pending"


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_status_from_pending_curator(
    create_ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )

    assert response.status_code == 201

    create_ticket_mock.reset_mock()

    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)

    curator = create_user(role="cataloger")
    login_user_via_session(api_client, email=curator.email)

    data["status"] = "open"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response2.status_code == 200
    record = api_client.get(record_url).json["data"]
    assert record["status"] == "open"
    create_ticket_mock.delay.assert_not_called()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_data_from_different_user(ticket_mock, api_client, db, create_user):
    user = create_user()
    user2 = create_user()
    login_user_via_session(api_client, email=user.email)
    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)

    login_user_via_session(api_client, email=user2.email)
    data["title"] = "Title2"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )
    assert response2.status_code == 403


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_status_from_open(ticket_mock, api_client, db, create_user):
    user = create_user()
    curator = create_user(role="cataloger")
    login_user_via_session(api_client, email=user.email)
    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    #  Login as curator to update job status
    login_user_via_session(api_client, email=curator.email)
    data["status"] = "open"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )
    assert response2.status_code == 200
    #  Login as user again to update job from open to closed
    login_user_via_session(api_client, email=user.email)
    data["status"] = "closed"
    response3 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response3.status_code == 200
    record = api_client.get(record_url).json["data"]
    assert record["status"] == "closed"


@freeze_time("2019-01-31")
def test_job_update_data_30_days_after_deadline(api_client, db, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    data = {**DEFAULT_EXAMPLE_JOB_DATA, "deadline_date": "2019-01-01"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)

    response = api_client.get(record_url).json
    assert response["meta"]["can_modify_status"] == False


@freeze_time("2019-01-31")
def test_job_update_data_30_days_after_deadline_with_cataloger(
    api_client, db, create_user
):
    cataloger = create_user(role="cataloger")
    login_user_via_session(api_client, email=cataloger.email)

    data = {**DEFAULT_EXAMPLE_JOB_DATA, "deadline_date": "2019-01-01"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)

    response = api_client.get(record_url).json
    assert response["meta"]["can_modify_status"] == True


@freeze_time("2019-01-31")
def test_job_update_data_less_than_30_days_after_deadline(api_client, db, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    data = {**DEFAULT_EXAMPLE_JOB_DATA, "deadline_date": "2019-01-02"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)

    response = api_client.get(record_url).json
    assert response["meta"]["can_modify_status"] == True


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_from_closed_by_user(ticket_mock, api_client, db, create_user):
    user = create_user()
    curator = create_user(role="cataloger")
    login_user_via_session(api_client, email=user.email)
    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    #  Login as curator to update job status
    login_user_via_session(api_client, email=curator.email)
    data["status"] = "closed"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )
    assert response2.status_code == 200
    #  Login as user again to update job title
    login_user_via_session(api_client, email=user.email)
    data["title"] = "Another Title"
    response3 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response3.status_code == 403
    record = api_client.get(record_url).json["data"]
    assert record["title"] == DEFAULT_EXAMPLE_JOB_DATA["title"]


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_status_update_30_days_after_deadline_by_user(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    curator = create_user(role="cataloger")
    login_user_via_session(api_client, email=user.email)
    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    assert response.status_code == 201
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    #  Login as curator to update job status
    login_user_via_session(api_client, email=curator.email)
    data["status"] = "closed"
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )
    assert response2.status_code == 200
    #  Login as user again to update job title
    login_user_via_session(api_client, email=user.email)
    data["status"] = "open"
    response3 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response3.status_code == 403
    record = api_client.get(record_url).json["data"]
    assert record["status"] == "closed"


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_remove_not_compulsory_fields(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    data = {
        **DEFAULT_EXAMPLE_JOB_DATA,
        "external_job_identifier": "IDENTIFIER",
        "experiments": [
            {
                "legacy_name": "some legacy_name",
                "record": {"$ref": "http://url_to_record/1234"},
            }
        ],
        "url": "http://something.com",
        "contacts": [
            {"name": "Some name", "email": "some@email.com"},
            {"name": "some other name"},
        ],
        "reference_letters": [
            "email@some.ch",
            "http://url.com",
            "something@somewhere.kk",
        ],
    }
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": data}),
    )
    pid_value = response.json["pid_value"]
    record_url = url_for(".job_submission_view", pid_value=pid_value)
    data = {**DEFAULT_EXAMPLE_JOB_DATA}
    response2 = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )

    assert response2.status_code == 200
    response3 = api_client.get(record_url, content_type="application/json")
    assert response3.status_code == 200
    assert "external_job_identifier" not in response3.json["data"]
    assert "experiments" not in response3.json["data"]
    assert "url" not in response3.json["data"]
    assert "contacts" not in response3.json["data"]
    assert "reference_letters" not in response3.json["data"]


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_regression_update_job_without_acquisition_source_doesnt_give_500(
    ticket_mock, api_client, db, create_user, create_record
):
    data = {
        "status": "open",
        "_collections": ["Jobs"],
        "control_number": 1,
        "deadline_date": "2019-12-31",
        "description": "nice job",
        "position": "junior",
        "regions": ["Europe"],
    }
    create_record("job", data=data)
    pid_value = data["control_number"]
    job_record = JobsRecord.get_record_by_pid_value(pid_value)

    assert "acquisition_source" not in job_record

    user = create_user()
    login_user_via_session(api_client, email=user.email)
    data["title"] = "New Title"
    record_url = url_for(
        "inspirehep_submissions.job_submission_view", pid_value=pid_value
    )

    response = api_client.put(
        record_url, content_type="application/json", data=json.dumps({"data": data})
    )
    assert response.status_code == 403


CONFERENCE_FORM_DATA = {
    "name": "College on Computational Physics",
    "subtitle": "the best conference ever",
    "description": "lorem ipsum",
    "dates": ["1993-05-17", "1993-05-20"],
    "addresses": [{"city": "Trieste", "country": "Italy"}],
    "series_name": "ICFA Seminar on Future Perspectives in High-Energy Physics",
    "series_number": 11,
    "contacts": [
        {"email": "somebody@email.com", "name": "somebody"},
        {"email": "somebodyelse@email.com"},
    ],
    "field_of_interest": ["Accelerators"],
    "acronyms": ["foo", "bar"],
    "websites": ["http://somebody.example.com"],
    "additional_info": "UPDATED",
    "keywords": ["black hole: mass"],
}


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_user_conference_submission_full_form_is_in_db_and_es_and_has_all_fields_correct(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": CONFERENCE_FORM_DATA}),
    )
    assert response.status_code == 201

    payload = json.loads(response.data)
    conference_id = payload["pid_value"]
    conference_cnum = payload["cnum"]

    conference_rec = ConferencesRecord.get_record_by_pid_value(conference_id)
    assert conference_cnum == conference_rec["cnum"]
    assert get_value(conference_rec, "titles[0].title") == CONFERENCE_FORM_DATA["name"]
    assert (
        get_value(conference_rec, "titles[0].subtitle")
        == CONFERENCE_FORM_DATA["subtitle"]
    )
    assert (
        get_value(conference_rec, "short_description.value")
        == CONFERENCE_FORM_DATA["description"]
    )
    assert get_value(conference_rec, "opening_date") == CONFERENCE_FORM_DATA["dates"][0]
    assert get_value(conference_rec, "closing_date") == CONFERENCE_FORM_DATA["dates"][1]
    assert (
        get_value(conference_rec, "series[0].name")
        == CONFERENCE_FORM_DATA["series_name"]
    )
    assert (
        get_value(conference_rec, "series[0].number")
        == CONFERENCE_FORM_DATA["series_number"]
    )
    assert (
        get_value(conference_rec, "contact_details[0].email")
        == CONFERENCE_FORM_DATA["contacts"][0]["email"]
    )
    assert (
        get_value(conference_rec, "contact_details[0].name")
        == CONFERENCE_FORM_DATA["contacts"][0]["name"]
    )
    assert (
        get_value(conference_rec, "contact_details[1].email")
        == CONFERENCE_FORM_DATA["contacts"][1]["email"]
    )
    assert get_value(conference_rec, "acronyms") == CONFERENCE_FORM_DATA["acronyms"]
    assert (
        get_value(conference_rec, "urls[0].value")
        == CONFERENCE_FORM_DATA["websites"][0]
    )
    assert (
        get_value(conference_rec, "inspire_categories[0].term")
        == CONFERENCE_FORM_DATA["field_of_interest"][0]
    )
    assert (
        get_value(conference_rec, "public_notes[0].value")
        == CONFERENCE_FORM_DATA["additional_info"]
    )
    assert (
        get_value(conference_rec, "keywords[0].value")
        == CONFERENCE_FORM_DATA["keywords"][0]
    )
    assert get_value(conference_rec, "addresses[0].country_code") == "IT"
    assert (
        get_value(conference_rec, "addresses[0].cities[0]")
        == CONFERENCE_FORM_DATA["addresses"][0]["city"]
    )
    ticket_mock.delay.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_user_conference_submission_missing_dates_has_no_cnum(
    ticket_mock, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    form_data = deepcopy(CONFERENCE_FORM_DATA)
    form_data.pop("dates")

    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    payload = json.loads(response.data)
    conference_id = payload["pid_value"]
    conference_cnum = payload["cnum"]
    conference_record = ConferencesRecord.get_record_by_pid_value(conference_id)

    assert response.status_code == 201
    assert conference_cnum is None
    assert "cnum" not in conference_record

    ticket_mock.delay.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_non_logged_in_user_tries_to_submit(ticket_mock, api_client):
    form_data = deepcopy(CONFERENCE_FORM_DATA)

    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 401

    ticket_mock.delay.assert_not_called()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_rt_ticket_when_cataloger_submits_conference(
    ticket_mock, api_client, db, create_user
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)
    form_data = deepcopy(CONFERENCE_FORM_DATA)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 201
    ticket_mock.delay.assert_not_called()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_rt_ticket_when_superuser_submits_conference(
    ticket_mock, api_client, db, create_user
):
    user = create_user(role=Roles.superuser.value)
    login_user_via_session(api_client, email=user.email)
    form_data = deepcopy(CONFERENCE_FORM_DATA)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 201
    ticket_mock.delay.assert_not_called()


@patch("inspirehep.submissions.views.send_conference_confirmation_email")
def test_confirmation_email_not_sent_when_user_is_superuser(
    mock_send_confirmation_email, api_client, db, create_user
):
    user = create_user(role=Roles.superuser.value)
    login_user_via_session(api_client, email=user.email)
    form_data = deepcopy(CONFERENCE_FORM_DATA)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 201
    mock_send_confirmation_email.assert_not_called()


@patch("inspirehep.submissions.views.send_conference_confirmation_email")
def test_confirmation_email_not_sent_when_user_is_cataloger(
    mock_send_confirmation_email, api_client, db, create_user
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)
    form_data = deepcopy(CONFERENCE_FORM_DATA)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 201
    mock_send_confirmation_email.assert_not_called()


@patch("inspirehep.submissions.views.send_conference_confirmation_email")
def test_confirmation_email_sent_for_regular_user(
    mock_send_confirmation_email, api_client, db, create_user
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    form_data = deepcopy(CONFERENCE_FORM_DATA)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    conference_rec = ConferencesRecord.get_record_by_pid_value(
        response.json["pid_value"]
    )
    assert response.status_code == 201
    mock_send_confirmation_email.assert_called_once_with(user.email, conference_rec)


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_conference_with_country_official_name(
    ticket_mock, api_client, db, create_user
):
    CZECH_CONFERENCE_FORM_DATA = deepcopy(CONFERENCE_FORM_DATA)
    CZECH_CONFERENCE_FORM_DATA["addresses"][0]["country"] = "Czech Republic"
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": CZECH_CONFERENCE_FORM_DATA}),
    )

    assert response.status_code == 201

    payload = json.loads(response.data)
    conference_id = payload["pid_value"]

    conference_rec = ConferencesRecord.get_record_by_pid_value(conference_id)
    assert get_value(conference_rec, "addresses[0].country_code") == "CZ"
    ticket_mock.delay.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_conference_raise_loader_error(ticket_mock, api_client, db, create_user):
    DATA = deepcopy(CONFERENCE_FORM_DATA)
    DATA["addresses"][0]["country"] = "Graham City"
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/conferences",
        content_type="application/json",
        data=json.dumps({"data": DATA}),
    )
    assert response.status_code == 400


SEMINAR_RECORD_DATA = {
    "title": {"title": "The Cool Seminar"},
    "public_notes": [{"value": "A public note"}],
    "series": [{"name": "A seminar serie", "number": 1}],
    "contact_details": [
        {
            "curated_relation": False,
            "email": "contact1@example",
            "name": "Contact 1",
            "record": {"$ref": "http://authors/1"},
        },
        {"email": "contact2@example"},
    ],
    "inspire_categories": [{"term": "Accelerators"}, {"term": "Math and Math Physics"}],
    "address": {"cities": ["Geneva"], "country_code": "CH"},
    "speakers": [
        {"name": "Urhan, Ahmet", "record": {"$ref": "http://authors/ahmet"}},
        {
            "name": "Urhan, Harun",
            "affiliations": [
                {"value": "CERN", "record": {"$ref": "http://institutions/cern"}}
            ],
            "record": {"$ref": "http://authors/harun"},
        },
    ],
    "join_urls": [
        {"description": "primary", "value": "http://example.com/join/1"},
        {"value": "http://example.com/join/2"},
    ],
    "end_datetime": "2020-05-06T16:30:00.000000",
    "start_datetime": "2020-05-06T10:30:00.000000",
    "timezone": "Europe/Zurich",
}

SEMINAR_FORM_DATA = {
    "name": "The Cool Seminar",
    "timezone": "Europe/Zurich",
    "dates": ["2020-05-06 08:30 AM", "2020-05-06 02:30 PM"],
    "join_urls": SEMINAR_RECORD_DATA["join_urls"],
    "speakers": [
        {"name": "Urhan, Ahmet", "record": {"$ref": "http://authors/ahmet"}},
        {
            "name": "Urhan, Harun",
            "affiliation": "CERN",
            "affiliation_record": {"$ref": "http://institutions/cern"},
            "record": {"$ref": "http://authors/harun"},
        },
    ],
    "address": {"city": "Geneva", "country": "Switzerland"},
    "field_of_interest": ["Accelerators", "Math and Math Physics"],
    "contacts": SEMINAR_RECORD_DATA["contact_details"],
    "series_name": "A seminar serie",
    "series_number": 1,
    "additional_info": "A public note",
}


def test_get_seminar_update_data(api_client, db, create_user, create_record_factory):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    seminar_data = {"control_number": 123, **SEMINAR_RECORD_DATA}
    create_record_factory("sem", data=seminar_data)
    expected_data = {"data": SEMINAR_FORM_DATA}
    response = api_client.get(
        "/submissions/seminars/123", headers={"Accept": "application/json"}
    )
    response_data = json.loads(response.data)

    assert response_data == expected_data


def test_get_seminar_update_data_not_found(api_client, db, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    response = api_client.get(
        "/submissions/seminars/1993", headers={"Accept": "application/json"}
    )

    assert response.status_code == 404


def test_get_seminar_update_data_requires_auth(api_client):
    response = api_client.get(
        "/submissions/seminars/1993", headers={"Accept": "application/json"}
    )

    assert response.status_code == 401


@patch("inspirehep.submissions.views.send_seminar_confirmation_email")
@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_seminar_submission(
    create_ticket_mock, send_confirmation_mock, api_client, db, create_user
):
    orcid = "0000-0001-5109-3700"
    user = create_user(orcid=orcid)
    login_user_via_session(api_client, email=user.email)

    form_data = deepcopy(SEMINAR_FORM_DATA)

    response = api_client.post(
        "/submissions/seminars",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 201

    payload = json.loads(response.data)
    seminar_id = payload["pid_value"]
    seminar_record = SeminarsRecord.get_record_by_pid_value(seminar_id)
    seminar_record_data = {
        key: value
        for (key, value) in seminar_record.items()
        if key in SEMINAR_RECORD_DATA
    }
    assert seminar_record_data == SEMINAR_RECORD_DATA
    assert get_value(seminar_record, "acquisition_source.orcid") == orcid

    create_ticket_mock.delay.assert_called_once()
    send_confirmation_mock.assert_called_once_with(user.email, seminar_record)


@patch("inspirehep.submissions.views.send_seminar_confirmation_email")
@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_seminar_submission_with_cataloger_login(
    create_ticket_mock, send_confirmation_mock, api_client, db, create_user
):
    orcid = "0000-0001-5109-3700"
    cataloger = create_user(role=Roles.cataloger.value, orcid=orcid)
    login_user_via_session(api_client, email=cataloger.email)

    form_data = deepcopy(SEMINAR_FORM_DATA)

    response = api_client.post(
        "/submissions/seminars",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )

    assert response.status_code == 201

    payload = json.loads(response.data)
    seminar_id = payload["pid_value"]
    seminar_record = SeminarsRecord.get_record_by_pid_value(seminar_id)
    seminar_record_data = {
        key: value
        for (key, value) in seminar_record.items()
        if key in SEMINAR_RECORD_DATA
    }
    assert seminar_record_data == SEMINAR_RECORD_DATA
    assert get_value(seminar_record, "acquisition_source.orcid") == orcid

    create_ticket_mock.delay.assert_not_called()
    send_confirmation_mock.assert_not_called()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_seminar_update_submission(
    create_ticket_mock, api_client, db, create_user, create_record_factory
):
    orcid = "0000-0001-5109-3700"
    user = create_user(orcid=orcid)
    login_user_via_session(api_client, email=user.email)

    seminar_data = {
        "control_number": 123,
        "acquisition_source": {"orcid": orcid},
        **SEMINAR_RECORD_DATA,
    }
    create_record_factory("sem", data=seminar_data)

    form_data = deepcopy({**SEMINAR_FORM_DATA, "name": "New name"})
    form_data.pop("address")

    expected_record_data = {**SEMINAR_RECORD_DATA, "title": {"title": "New name"}}
    expected_record_data.pop("address")

    response = api_client.put(
        "/submissions/seminars/123",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )
    assert response.status_code == 200

    payload = json.loads(response.data)
    seminar_id = payload["pid_value"]
    seminar_record = SeminarsRecord.get_record_by_pid_value(seminar_id)
    seminar_record_data = {
        key: value
        for (key, value) in seminar_record.items()
        if key in SEMINAR_RECORD_DATA
    }
    assert seminar_record_data == expected_record_data

    create_ticket_mock.delay.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_seminar_update_submission_with_cataloger_login(
    create_ticket_mock, api_client, db, create_user, create_record_factory
):
    cataloger = create_user(role=Roles.cataloger.value, orcid="0000-0002-6665-4934")
    login_user_via_session(api_client, email=cataloger.email)
    orcid = "0000-0001-5109-3700"

    seminar_data = {
        "control_number": 123,
        "acquisition_source": {"orcid": orcid},
        **SEMINAR_RECORD_DATA,
    }
    create_record_factory("sem", data=seminar_data)

    form_data = deepcopy({**SEMINAR_FORM_DATA, "name": "New name"})
    form_data.pop("address")

    expected_record_data = {**SEMINAR_RECORD_DATA, "title": {"title": "New name"}}
    expected_record_data.pop("address")

    response = api_client.put(
        "/submissions/seminars/123",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )
    assert response.status_code == 200

    payload = json.loads(response.data)
    seminar_id = payload["pid_value"]
    seminar_record = SeminarsRecord.get_record_by_pid_value(seminar_id)
    seminar_record_data = {
        key: value
        for (key, value) in seminar_record.items()
        if key in SEMINAR_RECORD_DATA
    }
    assert seminar_record_data == expected_record_data
    # cataloger's orcid shouldn't override the original submitter's
    assert get_value(seminar_record, "acquisition_source.orcid") == orcid

    create_ticket_mock.assert_not_called()


def test_seminar_update_submission_without_login(api_client, db, create_record_factory):
    seminar_data = {
        "control_number": 123,
        "acquisition_source": {"orcid": "0000-0001-5109-3700"},
        **SEMINAR_RECORD_DATA,
    }
    create_record_factory("sem", data=seminar_data)

    form_data = deepcopy({**SEMINAR_FORM_DATA, "name": "New name"})

    response = api_client.put(
        "/submissions/seminars/123",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )
    assert response.status_code == 401


def test_seminar_update_submission_with_different_user(
    api_client, db, create_user, create_record_factory
):
    user = create_user()
    login_user_via_session(api_client, email=user.email)

    seminar_data = {
        "control_number": 123,
        "acquisition_source": {"orcid": "0000-0001-5109-3700"},
        **SEMINAR_RECORD_DATA,
    }
    create_record_factory("sem", data=seminar_data)

    form_data = deepcopy({**SEMINAR_FORM_DATA, "name": "New name"})

    response = api_client.put(
        "/submissions/seminars/123",
        content_type="application/json",
        data=json.dumps({"data": form_data}),
    )
    assert response.status_code == 403
