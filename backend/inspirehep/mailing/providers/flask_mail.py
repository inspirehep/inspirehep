# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from flask_mail import Message

from inspirehep.mailing.utils import strip_html_tags

LOGGER = structlog.getLogger()


def send_email(sender, recipient, subject, body, cc=None):
    msg = Message(
        subject,
        sender=sender,
        recipients=[recipient],
        html=body,
        body=strip_html_tags(body),
        cc=cc
    )
    client = current_app.extensions['mail']
    if client.suppress:
        LOGGER.warn(
            'Skipping sending email due to config settings',
            key='MAIL_SUPPRESS_SEND',
            value=current_app.config.get('MAIL_SUPPRESS_SEND')
        )
    client.send(msg)
