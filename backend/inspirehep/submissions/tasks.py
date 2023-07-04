# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from celery import shared_task
from flask import current_app

from inspirehep.rt.tickets import CreateTicketException, create_ticket_with_template
from inspirehep.snow.api import InspireSnow


@shared_task(ignore_result=False, max_retries=5)
def async_create_ticket_with_template(
    queue,
    requestor,
    template_path,
    template_context,
    title,
    recid=None,
    _override_snow_feature_flag_DO_NOT_USE=False,  # FIXME: temporary hack to allow snow to be used in prod
):
    if (
        current_app.config.get("FEATURE_FLAG_ENABLE_SNOW")
        or _override_snow_feature_flag_DO_NOT_USE
    ):
        ticket = InspireSnow().create_inspire_ticket_with_template(
            functional_category=queue,
            user_email=requestor,
            template_path=template_path,
            template_context=template_context,
            subject=title,
            recid=recid,
        )
    else:
        ticket = create_ticket_with_template(
            queue, requestor, template_path, template_context, title, recid
        )
        # FIXME: create_ticket should raise the error
        if ticket == -1:
            raise CreateTicketException()
