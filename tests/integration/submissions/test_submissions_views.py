# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from flask import url_for
from freezegun import freeze_time
from invenio_accounts.testutils import login_user_via_session
from mock import patch

from inspirehep.accounts.roles import Roles
from inspirehep.records.api import JobsRecord
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
    assert post_data == {
        "data": {
            "_collections": ["Authors"],
            "acquisition_source": {
                "email": user.email,
                "method": "submitter",
                "source": "submitter",
                "submission_number": "None",
                "internal_uid": user.id,
                "datetime": "2019-06-17T00:00:00",
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


@freeze_time("2019-06-17")
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
    assert post_data == {
        "data": {
            "_collections": ["Authors"],
            "acquisition_source": {
                "email": user.email,
                "method": "submitter",
                "source": "submitter",
                "submission_number": "None",
                "internal_uid": user.id,
                "datetime": "2019-06-17T00:00:00",
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
@freeze_time("2019-06-17")
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
            "datetime": "2019-06-17T00:00:00",
        },
    }
    data = AuthorSubmissionsResource().populate_and_serialize_data_for_submission(data)
    assert data == expected


@freeze_time("2019-06-17")
def test_new_literature_submit_no_merge(app, api_client, create_user, requests_mock):
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
            "arxiv_eprints": [{"categories": ["hep-th"], "value": "1701.00006"}],
            "authors": [{"full_name": "Urhan, Harun"}],
            "citeable": True,
            "curated": False,
            "document_type": ["article"],
            "inspire_categories": [{"term": "Other"}],
            "titles": [{"source": "submitter", "title": "Discovery of cool stuff"}],
        },
        "form_data": {"references": "[1] Dude", "url": "https://cern.ch/coolstuff.pdf"},
    }
    assert post_data == expected_data


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


@freeze_time("2019-06-17")
def test_new_literature_submit_arxiv_merges_with_crossref(
    app, api_client, create_user, requests_mock
):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature",
        json={"workflow_object_id": 30},
    )
    requests_mock.get(
        "https://api.crossref.org/works/10.1103%2Fphysrevd.95.084013",
        json={
            "status": "ok",
            "message-type": "work",
            "message-version": "1.0.0",
            "message": {
                "publisher": "American Physical Society (APS)",
                "issue": "8",
                "DOI": "10.1103/physrevd.95.084013",
                "type": "journal-article",
                "source": "Crossref",
                "title": ["Time machines and AdS solitons with negative mass"],
                "prefix": "10.1103",
                "volume": "95",
                "journal-issue": {
                    "published-print": {"date-parts": [[2017, 4]]},
                    "issue": "8",
                },
                "article-number": "084013",
            },
        },
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
                    "doi": "10.1103/physrevd.95.084013",
                    "document_type": "article",
                    "authors": [{"full_name": "Tkachenko, A.S."}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                    "pdf_link": "https://cern.ch/coolstuff.pdf",
                    "references": "[1] Dude",
                }
            }
        ),
    )
    assert response.status_code == 200
    assert requests_mock.call_count == 2

    assert requests_mock.request_history[0].hostname == "api.crossref.org"
    assert (
        requests_mock.request_history[0].url
        == "https://api.crossref.org/works/10.1103%2Fphysrevd.95.084013"
    )

    inspire_next_call = requests_mock.request_history[1]
    post_data = inspire_next_call.json()
    assert (
        "Authorization" in inspire_next_call.headers
        and f"Bearer {app.config['AUTHENTICATION_TOKEN']}"
        == inspire_next_call.headers["Authorization"]
    )

    assert (
        inspire_next_call.url
        == f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature"
    )

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
            "arxiv_eprints": [{"categories": ["hep-th"], "value": "1701.00006"}],
            "authors": [{"full_name": "Tkachenko, A.S."}],
            "citeable": True,
            "curated": False,
            "document_type": ["article"],
            "dois": [
                {
                    "material": "publication",
                    "source": "Crossref",
                    "value": "10.1103/physrevd.95.084013",
                },
                {"value": "10.1103/physrevd.95.084013"},
            ],
            "inspire_categories": [{"term": "Other"}],
            "publication_info": [
                {
                    "artid": "084013",
                    "journal_issue": "8",
                    "journal_volume": "95",
                    "material": "publication",
                }
            ],
            "titles": [
                {
                    "source": "Crossref",
                    "title": "Time machines and AdS solitons with negative mass",
                },
                {"source": "submitter", "title": "Discovery of cool stuff"},
            ],
        },
        "form_data": {"references": "[1] Dude", "url": "https://cern.ch/coolstuff.pdf"},
    }
    assert post_data == expected_data


def test_new_literature_submit_arxiv_does_not_merge_if_crossref_harvest_fails(
    app, api_client, create_user, requests_mock
):
    requests_mock.post(
        f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature",
        json={"workflow_object_id": 30},
    )
    requests_mock.get(
        "https://api.crossref.org/works/10.1103%2Fphysrevd.95.084013", status_code=404
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
                    "doi": "10.1103/physrevd.95.084013",
                    "document_type": "article",
                    "authors": [{"full_name": "Tkachenko, A.S."}],
                    "title": "Discovery of cool stuff",
                    "subjects": ["Other"],
                    "pdf_link": "https://cern.ch/coolstuff.pdf",
                    "references": "[1] Dude",
                }
            }
        ),
    )
    assert response.status_code == 200
    assert requests_mock.call_count == 2

    assert requests_mock.request_history[0].hostname == "api.crossref.org"
    assert (
        requests_mock.request_history[0].url
        == "https://api.crossref.org/works/10.1103%2Fphysrevd.95.084013"
    )

    inspire_next_call = requests_mock.request_history[1]
    post_data = inspire_next_call.json()
    assert (
        "Authorization" in inspire_next_call.headers
        and f"Bearer {app.config['AUTHENTICATION_TOKEN']}"
        == inspire_next_call.headers["Authorization"]
    )

    assert (
        inspire_next_call.url
        == f"{app.config['INSPIRE_NEXT_URL']}/workflows/literature"
    )
    assert "publication_info" not in post_data


DEFAULT_EXAMPLE_JOB_DATA = {
    "deadline_date": "2019-01-01",
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
def test_new_job_submit_by_user(ticket_mock, app, api_client, create_user):
    user = create_user()
    login_user_via_session(api_client, email=user.email)
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": DEFAULT_EXAMPLE_JOB_DATA}),
    )
    assert response.status_code == 201

    job_id = json.loads(response.data)['pid_value']
    job_data = JobsRecord.get_record_by_pid_value(job_id)

    assert job_data['status'] == 'pending'


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_job_submit_by_cataloger(ticket_mock, app, api_client, create_user):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    post_data = {**DEFAULT_EXAMPLE_JOB_DATA, "status": "open"}
    response = api_client.post(
        "/submissions/jobs",
        content_type="application/json",
        data=json.dumps({"data": post_data}),
    )
    assert response.status_code == 201

    job_id = json.loads(response.data)['pid_value']
    job_data = JobsRecord.get_record_by_pid_value(job_id)

    assert job_data['status'] == 'open'


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_new_job_submit_with_wrong_field_value(
    ticket_mock, app, api_client, create_user
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
    ticket_mock, app, api_client, create_user
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
def test_update_job(create_ticket_mock, app, api_client, create_user):
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
    create_ticket_mock.assert_called_once()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_status_from_pending_not_curator(
    ticket_mock, app, api_client, create_user
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
    create_ticket_mock, app, api_client, create_user
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
    create_ticket_mock.assert_not_called()


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_data_from_different_user(ticket_mock, app, api_client, create_user):
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
def test_update_job_status_from_open(ticket_mock, app, api_client, create_user):
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


@patch("inspirehep.submissions.views.async_create_ticket_with_template")
def test_update_job_from_closed_by_user(ticket_mock, app, api_client, create_user):
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
def test_update_job_remove_not_compulsory_fields(
    ticket_mock, app, api_client, create_user
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
