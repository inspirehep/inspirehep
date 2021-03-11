# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIREHEP Celery app instantiation."""

import os
import signal

import flask
import structlog
from celery.signals import worker_process_init
from flask_celeryext import AppContextTask, create_celery_app
from prometheus_client import start_http_server
from psycopg2 import OperationalError as Psycopg2OperationalError
from sqlalchemy.exc import InvalidRequestError, OperationalError

from inspirehep.factory import create_app

LOGGER = structlog.getLogger()


class CeleryTask(AppContextTask):
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        if isinstance(
            exc, (InvalidRequestError, OperationalError, Psycopg2OperationalError)
        ):
            LOGGER.exception("Shutting down celery process")
            try:
                with open("/dev/termination-log", "w") as term_log:
                    term_log.write(str(exc))
            finally:
                os.kill(os.getppid(), signal.SIGTERM)

    def __call__(self, *args, **kwargs):
        """Fix for flask-celeryext __call__ override fail.
        https://github.com/celery/celery/pull/5652
        https://github.com/celery/celery/blob/master/docs/userguide/application.rst#abstract-tasks
        """
        if flask._app_ctx_stack.top is not None:
            return self.run(*args, **kwargs)
        with self.app.flask_app.app_context():
            return self.run(*args, **kwargs)


celery = create_celery_app(create_app(LOGGING_SENTRY_CELERY=True))
celery.Task = CeleryTask


@worker_process_init.connect()
def setup_metrics_server(*args, **kwargs):
    """Expose prometheus metrics.

    Exposes prometheus metrics for worker through prometheus web server on specified port.
    This function assumes that on production there is concurrency set to 1,
    otherwise it will expose metrics only form first worker child.
    We are outside flask app context here, so there is no access to config.
    """
    port = os.environ.get("PROMETHEUS_METRICS_PORT", 9090)
    host = os.environ.get("PROMETHEUS_METRICS_HOST", "")
    try:
        start_http_server(port, host)
        LOGGER.info(message="Exposing prometheus metrics.", port=port, host=host)
    except OSError:
        # Other (than the first one) celery children
        # will fail starting server for metrics
        LOGGER.warning(
            "Cannot serve prometheus metrics from this worker, "
            "probably because concurrency >= 1 "
            "and another worker has already exposed metrics. "
            "This shouldn't happen in production!",
            port=port,
            host=host,
        )
