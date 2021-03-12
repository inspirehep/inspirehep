# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from flask import jsonify
from invenio_cache import current_cache
from mock import patch

from inspirehep.editor.views import _simplify_ticket_response
from inspirehep.rt.errors import NoUsersFound
from inspirehep.rt.tickets import (
    _get_from_cache,
    create_ticket,
    create_ticket_with_template,
    get_rt_user_by_email,
    get_tickets_by_recid,
)


@pytest.mark.xfail(reason="RT cannot be initialized without valid creds.")
@pytest.mark.vcr()
def test_app_extension(inspire_app):
    assert inspire_app.extensions["inspire-rt"]


@pytest.mark.xfail(reason="RT cannot be initialized without valid creds.")
@pytest.mark.vcr()
def test_create_ticket_without_template(inspire_app):
    control_number = 1
    rt_queue = "TEST"
    ticket_id = create_ticket(
        rt_queue,
        "jessica@jones.com",
        "This is a test description by Jessica Jones.",
        "This is a test subject by Jessica Jones.",
        control_number,
    )

    assert ticket_id != -1


@pytest.mark.xfail(reason="RT cannot be initialized without valid creds.")
@pytest.mark.vcr()
def test_create_ticket_with_template(inspire_app):
    control_number = 1

    rt_template = "rt/dummy.html"
    rt_queue = "TEST"
    rt_template_context = {"email": "jessica@jones.com"}
    ticket_id = create_ticket_with_template(
        rt_queue,
        "jessica@jones.com",
        rt_template,
        rt_template_context,
        "This is a test subject by Jessica Jones with template.",
        control_number,
    )

    assert ticket_id != -1


@pytest.mark.vcr()
def test_tickets_are_deserialized_to_str(inspire_app):
    tickets = get_tickets_by_recid("1839571")
    simplified_tickets = [_simplify_ticket_response(ticket) for ticket in tickets]
    # Check that this won't fail anymore
    jsonify(simplified_tickets)


def test_get_from_cache(inspire_app):
    def _test_generator():
        return [1, 2, 3]

    def _second_generator_which_should_not_run():
        raise AssertionError

    expected = [1, 2, 3]

    current_cache.delete("test")
    # Cache empty, so run generator and return data
    result = _get_from_cache("test", _test_generator)
    assert result == expected
    assert expected == current_cache.get("test")

    # Cache set so generator should not run
    result = _get_from_cache("test", _second_generator_which_should_not_run)
    assert result == expected
    assert expected == current_cache.get("test")


def test_get_from_cache_when_forced(inspire_app):
    def _test_generator():
        return [1, 2, 3]

    def _second_generator_which_should_run():
        return [4, 5, 6]

    expected = [1, 2, 3]

    current_cache.delete("test")
    # Cache empty, so run generator and return data
    result = _get_from_cache("test", _test_generator)
    assert result == expected
    assert expected == current_cache.get("test")

    # Forcing so generator should run again
    expected = [4, 5, 6]
    result = _get_from_cache(
        "test", _second_generator_which_should_run, force_update=True
    )
    assert result == expected
    assert expected == current_cache.get("test")

    # Cache is set and not forcing so cached data should be returned
    result = _get_from_cache("test", _test_generator)
    assert result == expected
    assert expected == current_cache.get("test")


@patch("inspirehep.rt.tickets.query_rt")
def test_get_user_by_email(mock_query_rt, inspire_app):
    mock_query_rt.return_value = [
        "id: user/1",
        "Name: user1",
        "EmailAddress: user1@cern.ch",
        "",
        "--",
        "",
        "id: user/2",
        "Name: user2",
        "EmailAddress: user2@cern.ch",
    ]
    expected_user = {"Name": "user2", "EmailAddress": "user2@cern.ch"}
    current_cache.delete("rt_users_with_emails")
    user = get_rt_user_by_email("user2@cern.ch")
    del user["id"]
    assert user == expected_user


@patch("inspirehep.rt.tickets.query_rt")
def test_get_user_by_email_forces_to_refresh_cache_when_nothing_found_first_time(
    mock_query_rt, inspire_app
):
    mock_query_rt.side_effect = [
        ["id: user/1", "Name: user1", "EmailAddress: user1@cern.ch"],
        [
            "id: user/1",
            "Name: user1",
            "EmailAddress: user1@cern.ch",
            "",
            "--",
            "",
            "id: user/2",
            "Name: user2",
            "EmailAddress: user2@cern.ch",
        ],
    ]

    expected_user = {"id": "user/2", "Name": "user2", "EmailAddress": "user2@cern.ch"}
    current_cache.delete("rt_users_with_emails")
    user = get_rt_user_by_email("user2@cern.ch")
    assert user == expected_user
    assert mock_query_rt.call_count == 2


@patch("inspirehep.rt.tickets.query_rt")
def test_get_user_by_email_forces_to_refresh_only_once_per_call(
    mock_query_rt, inspire_app
):
    mock_query_rt.return_value = [
        "id: user/1",
        "Name: user1",
        "EmailAddress: user1@cern.ch",
    ]
    current_cache.delete("rt_users_with_emails")
    with pytest.raises(NoUsersFound):
        get_rt_user_by_email("user2@cern.ch")

    assert mock_query_rt.call_count == 2
