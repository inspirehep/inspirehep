# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from flask import Flask

from inspirehep.logger import InspireLogger


@mock.patch("inspirehep.logger.ext.sentry_sdk.init")
def test_ext_with_dsn(mock_sentry_sdk):
    SENTRY_DSN = "TEST_DSN_URL_FOR_SENTRY"
    SENTRY_SEND_DEFAULT_PII = True

    app = Flask("testapp")
    app.config.update(
        {"SENTRY_DSN": SENTRY_DSN, "SENTRY_SEND_DEFAULT_PII": SENTRY_SEND_DEFAULT_PII}
    )
    InspireLogger(app)
    mock_sentry_sdk.assert_called_once()


@mock.patch("inspirehep.logger.ext.sentry_sdk.init")
def test_ext_without_dsn(mock_sentry_sdk):
    SENTRY_DSN = None
    SENTRY_SEND_DEFAULT_PII = True

    app = Flask("testapp")
    app.config.update(
        {"SENTRY_DSN": SENTRY_DSN, "SENTRY_SEND_DEFAULT_PII": SENTRY_SEND_DEFAULT_PII}
    )
    InspireLogger(app)
    mock_sentry_sdk.assert_not_called()


@mock.patch("inspirehep.logger.ext.GunicornInternalPrometheusMetrics.init_app")
def test_ext_with_prometheus_flask_metrics(mock_prometheus_metrics, monkeypatch):
    PROMETHEUS_ENABLE_EXPORTER_FLASK = True
    monkeypatch.setenv("prometheus_multiproc_dir", "/tmp")
    app = Flask("testapp")
    app.config.update(
        {"PROMETHEUS_ENABLE_EXPORTER_FLASK": PROMETHEUS_ENABLE_EXPORTER_FLASK}
    )
    InspireLogger(app)
    mock_prometheus_metrics.assert_called_once()


@mock.patch("inspirehep.logger.ext.GunicornInternalPrometheusMetrics.init_app")
def test_ext_without_prometheus_flask_metrics(mock_prometheus_metrics):
    PROMETHEUS_ENABLE_EXPORTER_FLASK = False

    app = Flask("testapp")
    app.config.update(
        {"PROMETHEUS_ENABLE_EXPORTER_FLASK": PROMETHEUS_ENABLE_EXPORTER_FLASK}
    )
    InspireLogger(app)
    mock_prometheus_metrics.assert_not_called()
