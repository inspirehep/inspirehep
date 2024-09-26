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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_create_inspire_ticket(inspire_app):
    control_number = 232381
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        user_email="marcjanna.jedrych@cern.ch",
        recid=control_number,
        assigned_to_name="Marcjanna Jedrych",
    )

    assert ticket_id
    ticket = snow_instance.get_ticket(ticket_id)
    assert ticket["assigned_to"]


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_create_inspire_ticket_with_template(inspire_app):
    template = "snow/dummy.html"
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_ticket(inspire_app):
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_ticket_by_recid(inspire_app):
    required_ticket_keys = [
        "u_functional_category",
        "assigned_to",
        "sys_id",
        "date",
        "link",
        "subject",
        "description",
    ]
    control_number = 3332203
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_resolve_ticket(inspire_app):
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_functional_categories(inspire_app):
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_users(inspire_app):
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_user(inspire_app):
    inspire_app_user_id = inspire_app.config["SNOW_INSPIRE_USER_ID"]
    user = InspireSnow().get_user(inspire_app_user_id)
    assert user


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_functional_category(inspire_app):
    functional_category_id = "13d64fba1b6dd9107a83dc6a9b4bcb9d"
    category = InspireSnow().get_functional_category(functional_category_id)
    assert category


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_edit_inspire_ticket(inspire_app):
    control_number = 4542221
    ticket_id = InspireSnow().create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        recid=control_number,
        assigned_to_name="Marcjanna Jedrych",
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_create_ticket_raises_create_ticket_exception(
    mocked_update_ticket_with_inspire_recid,
    inspire_app,
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
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_comment_ticket(inspire_app):
    snow_instance = InspireSnow()
    ticket_id = snow_instance.create_inspire_ticket(
        subject="This is a test description by Jessica Jones.",
        description="This is a test subject by Jessica Jones.",
        user_email="marcjanna.jedrych@cern.ch",
    )

    assert ticket_id
    snow_instance.comment_ticket(ticket_id, message="This is a test reply")
    ticket = snow_instance.get_ticket(ticket_id, params="sysparm_display_value=true")
    assert "This is a test reply" in ticket["comments"]


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_comment_ticket_with_template(inspire_app):
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
    template_path = "snow/user_accepted.html"
    snow_instance.comment_ticket_with_template(
        ticket_id, template_path=template_path, template_context=template_context
    )

    ticket = snow_instance.get_ticket(ticket_id, params="sysparm_display_value=true")
    assert "Thank you very much again for your suggestion" in ticket["comments"]
