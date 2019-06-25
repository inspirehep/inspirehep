# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.flask import FlaskIntegration


class InspireLogger:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        sentry_dsn = app.config.get("SENTRY_DSN")
        if sentry_dsn:
            send_default_pii = app.config.get("SENTRY_SEND_DEFAULT_PII", False)
            sentry_sdk.init(
                dsn=sentry_dsn,
                integrations=[FlaskIntegration(), CeleryIntegration()],
                send_default_pii=send_default_pii,
            )
            app.extensions["inspirehep-logger"] = self
        return self
