# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import datetime

import requests
import structlog
from flask import current_app
from redis import StrictRedis

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


def mailtrain_update_weekly_campaign_content(html_content):
    """Sends html_content of the campaign to redis WEEKLY_JOBS_EMAIL_REDIS_KEY.

    Args:
        html_content (str): HTML content of the campaign.
    """
    mailtrain_key = current_app.config["WEEKLY_JOBS_EMAIL_REDIS_KEY"]

    redis_url = current_app.config.get("CACHE_REDIS_URL")
    redis = StrictRedis.from_url(redis_url, decode_responses=True)
    date = datetime.datetime.utcnow().timestamp()
    title = current_app.config.get("WEEKLY_JOBS_EMAIL_TITLE", "INSPIRE Jobs listing")
    data = {"timestamp": date, "title": title, "html": html_content}
    result = redis.hmset(mailtrain_key, data)
    if not result:
        LOGGER.error("Redis was not able to store html_content of weekly campaign!")
        return False
    else:
        LOGGER.info("Mailtrain weekly RSS updated successfully.")
        return True
