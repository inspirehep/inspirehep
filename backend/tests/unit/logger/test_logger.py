#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from unittest import mock

from flask import Flask
from inspirehep.logger.config import log_error
from inspirehep.logger.ext import InspireLogger
from sqlalchemy.orm.exc import StaleDataError


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


@mock.patch("inspirehep.logger.config.send_zulip_notification_async.delay")
def test_log_error_sends_zulip_notification(mock_send_zulip_notification):
    sender = mock.Mock()
    sender.name = "inspirehep.indexer.tasks.index_record"

    log_error(
        sender=sender,
        task_id="123",
        exception=ValueError("boom"),
        args=(),
        kwargs={"uuid": "abc"},
    )

    mock_send_zulip_notification.assert_called_once_with(
        "inspirehep.indexer.tasks.index_record",
        "builtins.ValueError - boom",
        uuid="abc",
    )


@mock.patch("inspirehep.logger.config.send_zulip_notification_async.delay")
def test_log_error_skips_zulip_notification_for_stale_data_error(
    mock_send_zulip_notification,
):
    sender = mock.Mock()
    sender.name = "inspirehep.indexer.tasks.index_record"

    log_error(
        sender=sender,
        task_id="123",
        exception=StaleDataError(),
        args=(),
        kwargs={"uuid": "abc"},
    )

    mock_send_zulip_notification.assert_not_called()
