# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import sentry_sdk
import structlog
from prometheus_flask_exporter import PrometheusMetrics
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.flask import FlaskIntegration

LOGGER = structlog.getLogger()


class InspireLogger:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.init_sentry(app)
        self.init_prometheus_flask_exporter(app)
        app.extensions["inspirehep-logger"] = self
        return self

    def init_sentry(self, app):
        sentry_dsn = app.config.get("SENTRY_DSN")

        if not sentry_dsn:
            LOGGER.debug(f"Sentry is not enabled for {app.name}.")
            return

        send_default_pii = app.config.get("SENTRY_SEND_DEFAULT_PII", False)
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[FlaskIntegration(), CeleryIntegration()],
            send_default_pii=send_default_pii,
        )

        LOGGER.debug("Sentry is initialized.")

    def init_prometheus_flask_exporter(self, app):
        enable_exporter_flask = app.config.get(
            "PROMETHEUS_ENABLE_EXPORTER_FLASK", False
        )

        if not enable_exporter_flask:
            LOGGER.debug(f"Prometheus Flask exporter is not enabled for {app.name}.")
            return

        prefix = app.name
        metrics_flask = PrometheusMetrics(app=None, defaults_prefix=prefix)
        metrics_flask.init_app(app)
        LOGGER.debug(f"Prometheus Flask exporter is initialized with prefix {prefix}.")
