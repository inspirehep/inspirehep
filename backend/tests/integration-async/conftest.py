#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from contextlib import contextmanager
from functools import partial

import boto3
import mock
import pytest
import structlog
from click.testing import CliRunner
from flask.cli import ScriptInfo
from helpers.cleanups import db_cleanup, es_cleanup
from inspirehep.celery import CeleryTask
from inspirehep.cli import cli as inspire_cli
from inspirehep.factory import create_app as inspire_create_app
from inspirehep.files.api.s3 import S3
from invenio_search import current_search_client as es
from moto import mock_s3
from redis import StrictRedis

LOGGER = structlog.getLogger()


@pytest.fixture(scope="session")
def app():
    app = inspire_create_app()
    app_config = {}
    app_config["DEBUG"] = False
    app_config["CELERY_CACHE_BACKEND"] = "memory"
    app_config["CELERY_TASK_ALWAYS_EAGER"] = False
    app_config["CELERY_TASK_EAGER_PROPAGATES"] = False
    app_config["TESTING"] = True
    app_config["SEARCH_INDEX_PREFIX"] = "test-integration-async-"
    app_config["SQLALCHEMY_DATABASE_URI"] = (
        "postgresql+psycopg2://postgres:postgres@localhost/test-inspirehep-async"
    )
    app.wsgi_app.mounts["/api"].config.update(app_config)
    # We cannot have `api` app with the same SERVER_NAME
    app_config["SERVER_NAME"] = "localhost:5000"
    app.config.update(app_config)
    with app.app_context():
        yield app


@pytest.fixture(scope="session")
def celery_worker_parameters():
    return {
        "queues": [
            "celery",
            "matcher",
            "indexer_task",
            "assign",
            "disambiguation",
            "curation",
            "redirect_references",
        ],
        "perform_ping_check": False,
    }


@pytest.fixture(autouse=True)
def _clear_environment(app):
    from invenio_db import db as db_

    with app.app_context():
        db_cleanup(db_)
        es_cleanup(es)


@pytest.fixture(scope="session")
def celery_session_app(app, celery_session_app):
    """
    This fixtures monkey-patches the Task class in the celery_session_app to
    properly run tasks in a Flask application context.
    Note:
        https://github.com/celery/celery/pull/5652
        https://github.com/celery/celery/blob/master/docs/userguide/application.rst#abstract-tasks
    """

    celery_session_app.Task = CeleryTask
    celery_session_app.flask_app = app

    return celery_session_app


@pytest.fixture
def clean_celery_session(celery_session_app, celery_session_worker):
    celery_session_app.control.purge()
    yield celery_session_worker
    celery_session_app.control.purge()


@pytest.fixture(scope="session")
def celery_config():
    return {}


@pytest.fixture
def cli(inspire_app):
    """Click CLI runner inside the Flask application."""
    runner = CliRunner()
    obj = ScriptInfo(create_app=lambda: inspire_app)
    runner.invoke = partial(runner.invoke, inspire_cli, obj=obj)
    return runner


@pytest.fixture
def redis(inspire_app):
    redis_url = inspire_app.config.get("CACHE_REDIS_URL")
    redis = StrictRedis.from_url(redis_url, decode_responses=True)
    redis.flushall()
    yield redis
    redis.flushall()
    redis.close()


@pytest.fixture
def override_config(inspire_app):
    @contextmanager
    def _override_config(**kwargs):
        """Override Flask's current app configuration.

        Note: it's a CONTEXT MANAGER.from

        Example:

            with override_config(
                MY_FEATURE_FLAG_ACTIVE=True,
                MY_USERNAME='username',
            ):
                ...
        """
        with (
            mock.patch.dict(inspire_app.config, kwargs),
            mock.patch.dict(inspire_app.wsgi_app.mounts["/api"].config, kwargs),
        ):
            yield

    return _override_config


@pytest.fixture
def inspire_app(app, cache):
    return app


@pytest.fixture
def enable_disambiguation(inspire_app, override_config):
    with override_config(
        FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION=True,
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True,
        FEATURE_FLAG_ENABLE_BAI_CREATION=True,
    ):
        yield inspire_app


@pytest.fixture
def enable_files(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_FILES=True):
        yield inspire_app


@pytest.fixture
def s3(inspire_app, enable_files):
    mock = mock_s3()
    mock.start()
    client = boto3.client("s3")
    resource = boto3.resource("s3")
    s3 = S3(client, resource)

    class MockedInspireS3:
        s3_instance = s3

    real_inspirehep_s3 = inspire_app.extensions["inspirehep-s3"]
    inspire_app.extensions["inspirehep-s3"] = MockedInspireS3

    yield s3
    mock.stop()
    inspire_app.extensions["inspirehep-s3"] = real_inspirehep_s3
