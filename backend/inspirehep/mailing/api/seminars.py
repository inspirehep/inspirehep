# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app, render_template

from inspirehep.mailing.providers.flask_mail import send_email
from inspirehep.utils import get_inspirehep_url

LOGGER = structlog.getLogger()


def get_submissions_confirmation_email_html_content(seminar):
    hep_url = get_inspirehep_url()
    recid = seminar["control_number"]
    seminar_url = f"{hep_url}/seminars/{recid}"
    seminar_edit_url = f"{hep_url}/submissions/seminars/{recid}"
    return render_template(
        "mailing/seminars/confirmation_new.html",
        seminar_url=seminar_url,
        seminar_edit_url=seminar_edit_url,
    )


def send_seminar_confirmation_email(recipient, seminar):
    if not recipient:
        LOGGER.error(
            "Cannot send confirmation email: no recipient found",
            recid=seminar["control_number"],
        )
        return

    sender = current_app.config["SEMINARS_CONFIRMATION_EMAIL_ADDRESS"]

    subject = (
        f"Your seminar ({seminar['control_number']}) has been successfully submitted!"
    )
    content = get_submissions_confirmation_email_html_content(seminar)

    send_email(sender=sender, recipient=recipient, subject=subject, body=content)
