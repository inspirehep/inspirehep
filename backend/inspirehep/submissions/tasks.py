# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from celery import shared_task

from inspirehep.rt.tickets import CreateTicketException, create_ticket_with_template


@shared_task(ignore_result=False, max_retries=5)
def async_create_ticket_with_template(
    queue, requestor, template_path, template_context, title, recid=None
):
    ticket = create_ticket_with_template(
        queue, requestor, template_path, template_context, title, recid
    )
    # FIXME: create_ticket should raise the error
    if ticket == -1:
        raise CreateTicketException()
