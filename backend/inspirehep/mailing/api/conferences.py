# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app, render_template

from inspirehep.mailing.providers.flask_mail import send_email

LOGGER = structlog.getLogger()


def get_submissions_confirmation_email_html_content(conference):
    host = current_app.config["SERVER_NAME"]
    return render_template(
        "mailing/conferences/submission_confirmation/base.html",
        conference=conference,
        host=host,
    )


def send_conference_confirmation_email(recipient, conference):
    """Send a submission confirmation email for the given conference.

    Args:
        recipient (string): email address of the recipient
        conference (dict): a conference record.

    Return:
        None
    """
    if not recipient:
        LOGGER.error(
            "Cannot send confirmation email: no recipient found",
            recid=conference["control_number"],
        )
        return

    sender = current_app.config["CONFERENCES_CONFIRMATION_EMAIL_ADDRESS"]

    subject = f"Your conference({conference['control_number']}) has been successfully submitted!"
    content = get_submissions_confirmation_email_html_content(conference)

    send_email(sender=sender, recipient=recipient, subject=subject, body=content)
    LOGGER.info(
        "Conference confirmation email sent", recid=conference.get("control_number")
    )
