# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import logging
import random

import pytest

from invenio_db import db
from invenio_search import current_search_client as es

from helpers.factories.models.pidstore import PersistentIdentifierFactory
from helpers.factories.models.records import RecordMetadataFactory
from invenio_app.factory import create_api as invenio_create_app

from inspirehep.records.fixtures import (
    init_default_storage_path,
    init_records_files_storage_path,
)

logger = logging.getLogger(__name__)


@pytest.fixture(scope="session")
def app():
    app = invenio_create_app()
    app_config = {}
    app_config["CELERY_BROKER_URL"] = "pyamqp://guest:guest@localhost:5672"
    app_config["CELERY_CACHE_BACKEND"] = "memory"
    app_config["CELERY_RESULT_BACKEND"] = "cache"
    app_config["CELERY_TASK_ALWAYS_EAGER"] = False
    app_config["CELERY_TASK_EAGER_PROPAGATES"] = False
    app_config["DEBUG"] = True
    app_config["JSONSCHEMAS_HOST"] = "localhost:5000"
    app_config["SEARCH_ELASTIC_HOSTS"] = "localhost:9200"
    app_config[
        "SQLALCHEMY_DATABASE_URI"
    ] = "postgresql+psycopg2://inspirehep:inspirehep@localhost:5432/inspirehep"
    app_config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
    app_config["TESTING"] = True
    app.config.update(app_config)
    return app


@pytest.fixture(scope="function", autouse=True)
def clear_environment(app):
    with app.app_context():
        db.session.close()
        db.drop_all()
        db.init_app(app)
        db.create_all()
        _es = app.extensions["invenio-search"]
        list(_es.delete(ignore=[404]))
        list(_es.create(ignore=[400]))
        init_default_storage_path()
        init_records_files_storage_path()
        es.indices.refresh("records-hep")


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
