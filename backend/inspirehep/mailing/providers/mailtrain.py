# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import requests
import structlog
from flask import current_app

LOGGER = structlog.getLogger()


def mailtrain_subscribe_user_to_list(list_id, email, first_name, last_name):
    """Subscribe user to a list.

    Args:
        list_id (str): the list id .
        email (str): user email.
        first_name (str): user first name.
        last_name (str): user last name.
    """
    LOGGER.info("Adding user to the mailing list.", list_id=list_id, email=email)
    data = {"FIRST_NAME": first_name, "LAST_NAME": last_name, "EMAIL": email}
    response = requests.post(
        f"{current_app.config.get('MAILTRAIN_URL')}/api/subscribe/{list_id}",
        params={"access_token": current_app.config.get("MAILTRAIN_API_TOKEN")},
        data=data,
    )
    if response.status_code != 200:
        LOGGER.error(
            "Cannot add user to MailTrain! Error: %s. Status_code: %s",
            response.reason,
            response.status_code,
        )
        raise ValueError(response.reason)
    else:
        LOGGER.info(
            "User successfully added to the mailing list.", list_id=list_id, email=email
        )
    return response
