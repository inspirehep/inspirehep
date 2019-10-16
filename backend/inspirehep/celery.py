# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIREHEP Celery app instantiation."""

import os
import signal

import structlog
from flask_celeryext import AppContextTask, create_celery_app
from psycopg2 import OperationalError as Psycopg2OperationalError
from sqlalchemy.exc import InvalidRequestError, OperationalError

from inspirehep.factory import create_app

LOGGER = structlog.getLogger()


class CeleryTask(AppContextTask):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        if isinstance(exc, (InvalidRequestError, OperationalError, Psycopg2OperationalError)):
            LOGGER.exception('Shutting down celery process')
            try:
                with open('/dev/termination-log', 'w') as term_log:
                    term_log.write(str(exc))
            finally:
                os.kill(os.getppid(), signal.SIGTERM)


celery = create_celery_app(create_app(LOGGING_SENTRY_CELERY=True))
celery.Task = CeleryTask
