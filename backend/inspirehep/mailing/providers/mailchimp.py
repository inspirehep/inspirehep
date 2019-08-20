# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from mailchimp3 import MailChimp

from ..errors import MailChimpMissingAPIToken

LOGGER = structlog.getLogger()


def get_mailchimp_client():
    mailchimp_api_token = current_app.config.get("MAILCHIMP_API_TOKEN")
    mailchimp_client_timeout = current_app.config.get("MAILCHIMP_CLIENT_TIMEOUT", 10)

    if not mailchimp_api_token:
        raise MailChimpMissingAPIToken("Mailchimp API token is not set.")

    return MailChimp(mc_api=mailchimp_api_token, timeout=mailchimp_client_timeout)


def create_mailchimp_campaign(replicate_campaign_id):
    """Create a mailchimp campaign.

    Args:
        replicate_campaign_id (str): the campaign id to replicate.

    Retruns:
        str: the new campaign id.
    Note:
        The campaigns can be retrieved by running:
        > MailChimp(mc_api=MAILCHIMP_API_TOKEN).campaigns.all()
    """
    client = get_mailchimp_client()

    replicate_campaign_id = current_app.config[
        "MAILCHIMP_JOBS_WEEKLY_REPLICATE_CAMPAIGN_ID"
    ]
    campaign = client.campaigns.actions.replicate(campaign_id=replicate_campaign_id)
    campaign_id = campaign["id"]
    LOGGER.info(
        "Campaign has been created.",
        campaign_id=campaign_id,
        replicate_campaign_id=replicate_campaign_id,
    )
    return campaign_id


def send_mailchimp_campaign(campaign_id, html_content, test_emails=None):
    """Send a given mailchimp campaign.

    Args:
        campaign_id (str): the campaign id to send.
        html_content (str): the html content of the campaign.
        test_emails (list): list of test emails.

    Note:
        If ``tests_emails`` is set the campaign will be sent as test only.
    """
    client = get_mailchimp_client()

    LOGGER.info("Updating campaign content.", campaign_id=campaign_id)
    client.campaigns.content.update(
        campaign_id=campaign_id, data={"html": html_content}
    )

    if test_emails:
        LOGGER.info(
            "Testing the campaign.", campaign_id=campaign_id, test_emails=test_emails
        )
        client.campaigns.actions.test(
            campaign_id=campaign_id,
            data={"test_emails": test_emails, "send_type": "html"},
        )
        return
    client.campaigns.actions.send(campaign_id=campaign_id)
    LOGGER.info("Campaign successfuly sent.", campaign_id=campaign_id)
