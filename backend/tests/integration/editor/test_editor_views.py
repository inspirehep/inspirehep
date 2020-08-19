# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import json
import os

import pkg_resources
import requests_mock
from helpers.utils import create_user
from inspire_schemas.api import load_schema, validate
from inspire_utils.record import get_value
from invenio_accounts.testutils import login_user_via_session
from invenio_cache import current_cache
from mock import patch

from inspirehep.accounts.roles import Roles


@patch("inspirehep.editor.views.tickets")
def test_create_rt_ticket(mock_tickets, inspire_app):
    mock_tickets.create_ticket.return_value = 1
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            f""""api/editor/literature/1497201/rt/tickets/create""",
            content_type="application/json",
            data=json.dumps(
                {
                    "description": "description",
                    "owner": "owner",
                    "queue": "queue",
                    "recid": "4328",
                    "subject": "subject",
                }
            ),
        )

    assert response.status_code == 200


@patch("inspirehep.editor.views.tickets")
def test_create_rt_ticket_only_needs_queue_and_recid(
    mock_tickets, inspire_app,
):
    mock_tickets.create_ticket.return_value = 1
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/literature/1497201/rt/tickets/create",
            content_type="application/json",
            data=json.dumps({"queue": "queue", "recid": "4328",}),
        )

    assert response.status_code == 200


@patch("inspirehep.editor.views.tickets")
def test_create_rt_ticket_returns_500_on_error(mock_tickets, inspire_app):
    mock_tickets.create_ticket.return_value = -1
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/literature/1497201/rt/tickets/create",
            content_type="application/json",
            data=json.dumps(
                {
                    "description": "description",
                    "owner": "owner",
                    "queue": "queue",
                    "recid": "4328",
                    "subject": "subject",
                }
            ),
        )

    assert response.status_code == 500

    expected = {"success": False}
    result = json.loads(response.data)

    assert expected == result


def test_create_rt_ticket_returns_403_on_authentication_error(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post("api/editor/literature/1497201/rt/tickets/create")

    assert response.status_code == 403


@patch("inspirehep.editor.views.tickets")
def test_resolve_rt_ticket(mock_tickets, inspire_app):
    mock_tickets.create_ticket.return_value = 1
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/literature/1497201/rt/tickets/4328/resolve")

    assert response.status_code == 200

    expected = {"success": True}
    result = json.loads(response.data)

    assert expected == result


def test_resolve_rt_ticket_returns_403_on_authentication_error(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/literature/1497201/rt/tickets/4328/resolve")

    assert response.status_code == 403


@patch("inspirehep.editor.views.tickets")
def test_get_tickets_for_record(mock_tickets, inspire_app):
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/literature/1497201/rt/tickets")

    assert response.status_code == 200


def test_get_tickets_for_record_returns_403_on_authentication_error(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/literature/1497201/rt/tickets")

    assert response.status_code == 403


@patch("inspirehep.editor.views.tickets")
def test_get_rt_users(mock_tickets, inspire_app):
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/users")

    assert response.status_code == 200


@patch("inspirehep.rt.tickets._get_all_of")
def test_rt_users_are_cached(mock_get_all_of, inspire_app):
    mock_get_all_of.return_value = [
        {"id": "10309", "name": "atkinson"},
        {"id": "1125438", "name": "bhecker"},
        {"id": "460354", "name": "Catherine"},
    ]
    current_cache.delete("rt_users")
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/users")
    assert current_cache.get("rt_users") == json.loads(response.data)


def test_get_rt_users_returns_403_on_authentication_error(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/users")

    assert response.status_code == 403


@patch("inspirehep.editor.views.tickets")
def test_get_rt_queues(mock_tickets, inspire_app):
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/queues")

    assert response.status_code == 200


@patch("inspirehep.rt.tickets._get_all_of")
def test_rt_queues_are_cached(mock_get_all_of, inspire_app):
    mock_get_all_of.return_value = [
        {"id": "35", "name": "Admin"},
        {"id": "63", "name": "Admin-curator"},
        {"id": "60", "name": "Admin-Dev"},
    ]
    current_cache.delete("rt_queues")
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/queues")
    assert current_cache.get("rt_queues") == json.loads(response.data)


def test_get_rt_queues_returns_403_on_authentication_error(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/queues")

    assert response.status_code == 403


def test_refextract_text(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/refextract/text",
            content_type="application/json",
            data=json.dumps(
                {
                    "text": (
                        "J. M. Maldacena. “The Large N Limit of Superconformal Field "
                        "Theories and Supergravity”. Adv. Theor. Math. Phys. 2 (1998), "
                        "pp. 231–252."
                    ),
                }
            ),
        )
    references = json.loads(response.data)

    assert response.status_code == 200
    assert validate(references, subschema) is None
    assert get_value(
        {"references": references},
        "references.reference.publication_info.journal_title",
    )


def test_refextract_url(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]
    user = create_user(role=Roles.cataloger.value)
    es_response = {
        "_shards": {"failed": 0, "skipped": 0, "successful": 5, "total": 5},
        "hits": {"hits": [], "max_score": None, "total": 0},
        "timed_out": False,
        "took": 4,
    }

    with requests_mock.Mocker() as requests_mocker:
        requests_mocker.register_uri(
            "GET",
            "https://arxiv.org/pdf/1612.06414.pdf",
            content=pkg_resources.resource_string(
                __name__, os.path.join("fixtures", "1612.06414.pdf")
            ),
        )
        requests_mocker.register_uri(
            "GET",
            "http://test-indexer:9200/records-hep/hep/_search?_source=control_number",
            json=es_response,
        )

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.post(
                "api/editor/refextract/url",
                content_type="application/json",
                data=json.dumps({"url": "https://arxiv.org/pdf/1612.06414.pdf"}),
            )
        references = json.loads(response.data)

    assert response.status_code == 200
    assert validate(references, subschema) is None
    assert get_value(
        {"references": references},
        "references.reference.publication_info.journal_title",
    )
