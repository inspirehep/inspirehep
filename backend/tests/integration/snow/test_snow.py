# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import mock
import pytest
import requests
from helpers.utils import (
    filter_out_authentication,
    filter_out_user_data_and_cookie_headers,
)

from inspirehep.snow.api import InspireSnow
from inspirehep.snow.errors import CreateTicketException


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_create_inspire_ticket(mocked_inspire_snow, inspire_app, teardown_cache):
    control_number = 232381
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        user_email="marcjanna.jedrych@cern.ch",
        recid=control_number,
        assigned_to_email="marcjanna.jedrych@cern.ch",
    )

    assert ticket_id
    ticket = snow_instance.get_ticket(ticket_id)
    assert ticket["assigned_to"]


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_create_inspire_ticket_with_template(
    mocked_inspire_snow, inspire_app, teardown_cache
):
    template = "rt/dummy.html"
    control_number = 121281
    template_context = {"email": "jessica@jones.com"}
    snow_instance = InspireSnow()

    ticket_id = snow_instance.create_inspire_ticket_with_template(
        template_path=template,
        template_context=template_context,
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        recid=control_number,
    )

    assert ticket_id


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_get_ticket(mocked_inspire_snow, inspire_app, teardown_cache):
    ticket_id = InspireSnow().create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
    )
    ticket = InspireSnow().get_ticket(ticket_id)
    assert ticket


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_get_ticket_by_recid(mocked_inspire_snow, inspire_app, teardown_cache):
    required_ticket_keys = [
        "u_functional_category",
        "assigned_to",
        "sys_id",
        "date",
        "link",
        "subject",
        "description",
    ]
    control_number = 33322211
    ticket_id = InspireSnow().create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        recid=control_number,
    )

    assert ticket_id
    found_tickets = InspireSnow().get_tickets_by_recid(control_number)
    assert len(found_tickets) == 1
    assert found_tickets[0]
    for field in required_ticket_keys:
        assert field in found_tickets[0]


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_resolve_ticket(mocked_inspire_snow, inspire_app, teardown_cache):
    ticket_id = InspireSnow().create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
    )

    assert ticket_id
    InspireSnow().resolve_ticket(ticket_id)
    ticket = InspireSnow().get_ticket(ticket_id)
    assert ticket["u_current_task_state"] == "9"


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_get_functional_categories(mocked_inspire_snow, inspire_app, teardown_cache):
    categories = InspireSnow().get_formatted_functional_category_list()
    assert categories

    random_category = categories[0]
    assert "name" in random_category
    assert "id" in random_category


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_get_users(mocked_inspire_snow, inspire_app, teardown_cache):
    users = InspireSnow().get_formatted_user_list()
    assert users

    random_user = users[0]
    assert "name" in random_user
    assert "id" in random_user
    assert "email" in random_user


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_get_user(mocked_inspire_snow, inspire_app, teardown_cache):
    inspire_app_user_id = inspire_app.config["SNOW_INSPIRE_USER_ID"]
    user = InspireSnow().get_user(inspire_app_user_id)
    assert user


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_get_functional_category(mocked_inspire_snow, inspire_app, teardown_cache):
    functional_category_id = "13d64fba1b6dd9107a83dc6a9b4bcb9d"
    category = InspireSnow().get_functional_category(functional_category_id)
    assert category


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_edit_inspire_ticket(mocked_inspire_snow, inspire_app, teardown_cache):
    control_number = 4542221
    ticket_id = InspireSnow().create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        recid=control_number,
        assigned_to_email="marcjanna.jedrych@cern.ch",
    )

    assert ticket_id
    edit_payload = {"assigned_to": ""}
    InspireSnow().edit_ticket(ticket_id, edit_payload)
    ticket = InspireSnow().get_ticket(ticket_id)
    assert ticket["assigned_to"] == ""


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@mock.patch("inspirehep.snow.api.requests.put")
def test_create_ticket_raises_create_ticket_exception(
    mocked_update_ticket_with_inspire_recid,
    mocked_inspire_snow,
    inspire_app,
    teardown_cache,
):
    recid = 111
    mocked_update_ticket_with_inspire_recid.side_effect = requests.exceptions.HTTPError
    with pytest.raises(CreateTicketException):
        InspireSnow().create_inspire_ticket(
            subject="This is a test description by Jessica Jones.",
            description="This is a test subject by Jessica Jones.",
            recid=recid,
        )


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_reply_ticket(mocked_inspire_snow, inspire_app, teardown_cache):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        user_email="marcjanna.jedrych@cern.ch",
    )

    assert ticket_id
    snow_instance.reply_ticket(ticket_id, reply_message="This is a test reply")
    ticket = snow_instance.get_ticket(ticket_id, params="sysparm_display_value=true")
    assert "This is a test reply" in ticket["comments"]


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
def test_reply_ticket_with_template(mocked_inspire_snow, inspire_app, teardown_cache):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        user_email="marcjanna.jedrych@cern.ch",
    )

    assert ticket_id
    template_context = dict(
        user_name="Test, User",
        author_name="Test, Author",
        record_url="https://inspirebeta.net/api/authors/2621784",
    )
    template_path = "rt/user_accepted.html"
    snow_instance.reply_ticket_with_template(
        ticket_id, template_path=template_path, template_context=template_context
    )

    ticket = snow_instance.get_ticket(ticket_id, params="sysparm_display_value=true")
    assert "Thank you very much again for your suggestion" in ticket["comments"]
