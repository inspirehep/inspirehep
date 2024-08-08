#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from celery import shared_task

from inspirehep.snow.api import InspireSnow


@shared_task(ignore_result=False, max_retries=5)
def async_create_ticket_with_template(
    queue,
    requestor,
    template_path,
    template_context,
    title,
    recid=None,
):
    InspireSnow().create_inspire_ticket_with_template(
        functional_category=queue,
        user_email=requestor,
        template_path=template_path,
        template_context=template_context,
        subject=title,
        recid=recid,
    )
