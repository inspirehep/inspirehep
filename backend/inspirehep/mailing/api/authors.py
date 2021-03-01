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


def get_orcid_push_disabled_email_html_content(orcid):
    return render_template("mailing/authors/orcid_push_disabled.html", orcid=orcid)


def send_orcid_push_disabled_email(user_email, user_orcid):
    content = get_orcid_push_disabled_email_html_content(user_orcid)
    subject = "Deprecated ORCID in INSPIRE"
    send_email(
        sender=current_app.config["AUTHORS_EMAIL_ADDRESS"],
        recipient=user_email,
        subject=subject,
        body=content,
    )
    LOGGER.info("Access token deleted email sent", recipent=user_email)
