# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from flask import jsonify

from inspirehep.editor.views import _simplify_ticket_response
from inspirehep.rt.tickets import (
    create_ticket,
    create_ticket_with_template,
    get_tickets_by_recid,
)


@pytest.mark.xfail(reason="RT cannot be initialized without valid creds.")
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
