# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import time
from collections import namedtuple
from functools import partial

import pytest
import structlog
from click.testing import CliRunner
from flask.cli import ScriptInfo
from helpers.cleanups import db_cleanup, es_cleanup
from invenio_search import current_search_client as es
from redis import StrictRedis

from inspirehep.factory import create_app as inspire_create_app

LOGGER = structlog.getLogger()


@pytest.fixture(scope="session")
def app():
    app = inspire_create_app()
    app_config = {}
    app_config["DEBUG"] = False
    app_config["CELERY_CACHE_BACKEND"] = "memory"
    app_config["SERVER_NAME"] = "localhost:5000"
    app_config["CELERY_TASK_ALWAYS_EAGER"] = False
    app_config["CELERY_TASK_EAGER_PROPAGATES"] = False
    app_config["TESTING"] = True
    app.config.update(app_config)

    with app.app_context():
        yield app


@pytest.fixture(scope="session")
def celery_worker_parameters():
    return {"queues": ["migrator", "celery"]}


@pytest.fixture(scope="function", autouse=True)
def clear_environment(app):
    from invenio_db import db as db_

    with app.app_context():
        db_cleanup(db_)
        es_cleanup(es)


@pytest.fixture(scope="session")
def celery_app_with_context(app, celery_session_app):
    """
    This fixtures monkey-patches the Task class in the celery_session_app to
    properly run tasks in a Flask application context.
    Note:
        Using `celery_app` and `celery_worker` in the tests will work only
        for the first test, from the second one the worker hangs.
        See: https://github.com/celery/celery/issues/5105
    """
    from flask_celeryext.app import AppContextTask

    celery_session_app.Task = AppContextTask
    celery_session_app.flask_app = app
    return celery_session_app


def _setup_cli(app):
    runner = CliRunner()
    obj = ScriptInfo(create_app=lambda info: app)
    runner._invoke = runner.invoke
    runner.invoke = partial(runner.invoke, obj=obj)
    return runner


_app_ = namedtuple("APP", ["app", "redis", "session_worker", "celery_app", "cli"])


@pytest.fixture(scope="function")
def async_app(
    app, celery_app_with_context, celery_session_worker, cache, clear_environment
):
    redis_client = StrictRedis.from_url(app.config["CACHE_REDIS_URL"])
    redis_client.flushall()

    yield _app_(
        app=app,
        redis=redis_client,
        session_worker=celery_session_worker,
        celery_app=celery_app_with_context,
        cli=_setup_cli(app),
    )

    redis_client.flushall()
    redis_client.close()
