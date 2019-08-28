# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from inspirehep.mailing.errors import SendGridMissingAPIToken

LOGGER = structlog.getLogger()


def send_email(sender, recipient, subject, content, cc=()):
    """Send an email via SendGrid with the provided arguments.

    Args:
        sender (str): email address of the sender.
        recipient (str): email address of the recipient.
        subject (str): email's subject.
        content (str): email's body.
        cc (list): list of email addresses to put in cc.

    Return:
        None
    """
    api_key = current_app.config.get('SENDGRID_API_KEY')
    if not api_key:
        raise SendGridMissingAPIToken('Cannot authenticate to SendGrid. SENDGRID_API_KEY key not found.')

    message = Mail(
        from_email=sender,
        to_emails=recipient,
        subject=subject,
        html_content=content
    )
    for cc_emai_address in cc:
        message.add_cc(cc_emai_address)
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        LOGGER.info('Mail sent successfully', response=response)
    except Exception:
        LOGGER.exception('An error occurred while sending a mail')
