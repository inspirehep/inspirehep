# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import sentry_sdk
import structlog
from flask import request, request_started, request_tearing_down
from flask.logging import default_handler
from prometheus_flask_exporter import PrometheusMetrics
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.flask import FlaskIntegration

LOGGER = structlog.getLogger()


def log_request_info(*args, **kwargs):
    structlog.threadlocal.bind_threadlocal(request_path=request.path)


def remove_request_logging(*args, **kwargs):
    structlog.threadlocal.clear_threadlocal()


def url_rule(request):
    if not request.url_rule:
        return "NOT_FOUND"
    # Pretty-printing adapted from werkzeug.routing.Route.__repr__
    return "".join(
        f"<{data}>" if is_dynamic else data
        for (is_dynamic, data) in request.url_rule._trace
    ).lstrip("|")


class InspireLogger:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.init_sentry(app)
        self.init_prometheus_flask_exporter(app)
        self.init_flask_structlog(app)
        app.extensions["inspirehep-logger"] = self
        # https://flask.palletsprojects.com/en/1.0.x/logging/#removing-the-default-handler
        app.logger.removeHandler(default_handler)
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
            release=os.environ.get("VERSION"),
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
        metrics_flask = PrometheusMetrics(
            app=None, defaults_prefix=prefix, group_by=url_rule
        )
        metrics_flask.init_app(app)
        LOGGER.debug(f"Prometheus Flask exporter is initialized with prefix {prefix}.")

    def init_flask_structlog(self, app):
        request_started.connect(log_request_info, app)
        request_tearing_down.connect(remove_request_logging, app)
