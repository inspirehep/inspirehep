# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
import pytest
from helpers.utils import (
    create_user,
    filter_out_authentication,
    filter_out_user_data_and_cookie_headers,
)
from invenio_accounts.testutils import login_user_via_session

from inspirehep.snow.api import InspireSnow
from inspirehep.snow.errors import CreateTicketException, EditTicketException


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_create_ticket_with_template_view(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/create",
            data=orjson.dumps(
                {
                    "template": "curator_submitted",
                    "functional_category": "Authors",
                    "subject": "test create ticket with template endpoint",
                    "recid": "123",
                    "template_context": dict(
                        email="marcjanna.jedrych@cern.ch",
                        identifier="arxiv:1234",
                        user_comment="test",
                        references="",
                        url="inspirehep.net/submissions/1234",
                    ),
                }
            ),
        )
        assert response.status_code == 200
        assert "ticket_id" in response.json
        assert "ticket_url" in response.json
        assert InspireSnow().get_tickets_by_recid("123")


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_create_ticket_with_template_view_not_authenticated(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/create",
            data=orjson.dumps(
                {
                    "template": "curator_submitted",
                    "functional_category": "Authors",
                    "subject": "test create ticket with template endpoint",
                    "template_context": dict(
                        email="marcjanna.jedrych@cern.ch",
                        identifier="arxiv:1234",
                        user_comment="test",
                        references="",
                        url="inspirehep.net/submissions/1234",
                    ),
                }
            ),
        )
        assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_create_ticket_view(mocked_inspire_snow, teardown_cache, inspire_app):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/create",
            data=orjson.dumps(
                {
                    "functional_category": "Authors",
                    "recid": "123",
                    "subject": "test create ticket endpoint",
                    "description": "test test",
                }
            ),
        )
        assert response.status_code == 200
        assert "ticket_id" in response.json
        assert "ticket_url" in response.json


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_create_ticket_view_not_authenticated(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/create",
            data=orjson.dumps(
                {
                    "functional_category": "Authors",
                    "recid": "123",
                    "subject": "test create ticket endpoint",
                    "description": "test test",
                }
            ),
        )
        assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@mock.patch(
    "inspirehep.snow.api.InspireSnow.create_inspire_ticket",
    side_effect=CreateTicketException,
)
def test_create_ticket_view_when_create_ticket_error(
    mock_create_ticket, mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/create",
            data=orjson.dumps(
                {
                    "functional_category": "Authors",
                    "recid": "123",
                    "subject": "test create ticket endpoint",
                    "description": "test test",
                }
            ),
        )
        assert response.status_code == 500
        assert response.json["message"] == "Can't create SNOW ticket!"


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_reply_ticket_with_template_view(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a reply test",
        description="This is a reply",
    )
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/reply",
            data=orjson.dumps(
                {
                    "ticket_id": ticket_id,
                    "user_email": "test@test.com",
                    "template": "user_accepted",
                    "template_context": dict(
                        user_name="Test, User",
                        author_name="Test, Author",
                        record_url="https://inspirebeta.net/api/authors/2621784",
                    ),
                }
            ),
        )
        assert response.status_code == 200
        assert response.json["message"] == "Ticket was updated with the reply"


def test_reply_ticket_with_template_view_when_user_not_authenticated(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/reply",
            data=orjson.dumps(
                {
                    "ticket_id": "1234",
                    "template": "user_accepted",
                    "user_email": "test@test.com",
                    "template_context": dict(
                        user_name="Test, User",
                        author_name="Test, Author",
                        record_url="https://inspirebeta.net/api/authors/2621784",
                    ),
                }
            ),
        )
        assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@mock.patch(
    "inspirehep.snow.api.InspireSnow.edit_ticket", side_effect=EditTicketException
)
def test_reply_ticket_with_template_view_when_edit_ticket_error(
    mocked_inspire_snow, inspire_app
):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/reply",
            data=orjson.dumps(
                {
                    "ticket_id": "1234",
                    "template": "user_accepted",
                    "template_context": dict(
                        user_name="Test, User",
                        user_email="test@test.com",
                        author_name="Test, Author",
                        record_url="https://inspirebeta.net/api/authors/2621784",
                    ),
                }
            ),
        )
        assert response.status_code == 500
        assert response.json["message"] == "Can't reply SNOW ticket!"


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_reply_ticket_view(mocked_inspire_snow, teardown_cache, inspire_app):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a reply test",
        description="This is a reply",
    )
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/reply",
            data=orjson.dumps(
                {
                    "ticket_id": ticket_id,
                    "reply_message": "This is a test reply",
                    "user_email": "test@test.com",
                }
            ),
        )
        assert response.status_code == 200
        assert response.json["message"] == "Ticket was updated with the reply"


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@mock.patch(
    "inspirehep.snow.api.InspireSnow.edit_ticket", side_effect=EditTicketException
)
def test_reply_ticket_view_when_record_edit_error(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/reply",
            data=orjson.dumps(
                {
                    "ticket_id": "123",
                    "reply_message": "This is a test reply",
                }
            ),
        )
        assert response.status_code == 500
        assert response.json["message"] == "Can't reply SNOW ticket!"


def test_reply_ticket_view_when_user_not_authenticated(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/reply",
            data=orjson.dumps(
                {
                    "ticket_id": "12345",
                    "reply_message": "This is a test reply",
                }
            ),
        )
        assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@mock.patch(
    "inspirehep.snow.api.InspireSnow.edit_ticket", side_effect=EditTicketException
)
def test_resolve_ticket_view_when_edit_ticket_exception(
    mock_edit_ticket, mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/resolve", data=orjson.dumps({"ticket_id": "123"})
        )
        assert response.status_code == 500
        assert response.json["message"] == "Can't resolve SNOW ticket!"


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_resolve_ticket_view(mocked_inspire_snow, teardown_cache, inspire_app):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a reply test",
        description="This is a reply",
    )
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/resolve", data=orjson.dumps({"ticket_id": ticket_id})
        )
        assert response.status_code == 200
        assert response.json["message"] == "Ticket resolved"


def test_resolve_ticket_view_user_not_authenticated(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/resolve", data=orjson.dumps({"ticket_id": "123"})
        )
        assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@mock.patch(
    "inspirehep.snow.api.InspireSnow.edit_ticket", side_effect=EditTicketException
)
def test_resolve_ticket_with_template_view_when_edit_ticket_exception(
    mock_edit_ticket, mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/resolve",
            data=orjson.dumps(
                {
                    "ticket_id": "123",
                    "template": "user_accepted",
                    "template_context": dict(
                        user_name="Test, User",
                        author_name="Test, Author",
                        record_url="https://inspirebeta.net/api/authors/2621784",
                    ),
                }
            ),
        )
        assert response.status_code == 500
        assert response.json["message"] == "Can't resolve SNOW ticket!"


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_resolve_ticket_with_template_view(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a reply test",
        description="This is a reply",
    )
    user = create_user(role="superuser")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/resolve",
            data=orjson.dumps(
                {
                    "ticket_id": ticket_id,
                    "template": "user_accepted",
                    "template_context": dict(
                        user_name="Test, User",
                        author_name="Test, Author",
                        record_url="https://inspirebeta.net/api/authors/2621784",
                    ),
                }
            ),
        )
        assert response.status_code == 200
        assert response.json["message"] == "Ticket resolved"


def test_resolve_ticket_with_template_view_user_not_authenticated(
    mocked_inspire_snow, teardown_cache, inspire_app
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api/tickets/resolve",
            data=orjson.dumps(
                {
                    "ticket_id": "123",
                    "template": "user_accepted",
                    "template_context": dict(
                        user_name="Test, User",
                        user_email="test@test.com",
                        author_name="Test, Author",
                        record_url="https://inspirebeta.net/api/authors/2621784",
                    ),
                }
            ),
        )
        assert response.status_code == 403
