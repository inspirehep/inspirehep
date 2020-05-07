# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
import os
from collections import namedtuple
from functools import partial

import boto3
import pytest
from click.testing import CliRunner
from flask import current_app
from flask.cli import ScriptInfo
from helpers.cleanups import db_cleanup, es_cleanup
from helpers.factories.models.base import BaseFactory
from helpers.factories.models.migrator import LegacyRecordsMirrorFactory
from helpers.factories.models.pidstore import PersistentIdentifierFactory
from helpers.factories.models.records import RecordMetadataFactory
from helpers.utils import get_test_redis, override_config
from moto import mock_s3

from inspirehep.cli import cli
from inspirehep.factory import create_app as inspire_create_app
from inspirehep.files.api.s3 import S3


@pytest.fixture(scope="module")
def app_config(app_config):
    # add extra global config if you would like to customize the config
    # for a specific test you can change create fixture per-directory
    # using ``conftest.py`` or per-file.
    app_config["DEBUG"] = False
    app_config["JSONSCHEMAS_HOST"] = "localhost:5000"
    app_config["SERVER_NAME"] = "localhost:5000"
    return app_config


@pytest.fixture(scope="module")
def db_uri(instance_path):
    """Database URI (defaults to an SQLite datbase in the instance path).
    Scope: module
    The database can be overwritten by setting the ``SQLALCHEMY_DATABASE_URI``
    environment variable to a SQLAlchemy database URI.
    """
    if "SQLALCHEMY_DATABASE_URI" in os.environ:
        yield os.environ["SQLALCHEMY_DATABASE_URI"]
    else:
        yield "postgresql+psycopg2://inspirehep:inspirehep@localhost/inspirehep"


@pytest.fixture(scope="function")
def enable_files(app_clean):
    with override_config(FEATURE_FLAG_ENABLE_FILES=True):
        yield app_clean


@pytest.fixture(scope="function")
def disable_files(app_clean):
    with override_config(FEATURE_FLAG_ENABLE_FILES=False):
        yield app_clean


@pytest.fixture(scope="function")
def enable_self_citations(app_clean):
    with override_config(FEATURE_FLAG_ENABLE_SELF_CITATIONS=True):
        yield app_clean


@pytest.fixture(scope="module")
def create_app():
    return inspire_create_app


@pytest.fixture(scope="module")
def database(appctx):
    """Setup database."""
    from invenio_db import db as db_

    db_cleanup(db_)
    yield db_
    db_.session.remove()


@pytest.fixture(scope="function")
def db_(database):
    """Creates a new database session for a test.
    Scope: function
    You must use this fixture if your test connects to the database. The
    fixture will set a save point and rollback all changes performed during
    the test (this is much faster than recreating the entire database).
    """
    import sqlalchemy as sa

    connection = database.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = database.create_scoped_session(options=options)

    session.begin_nested()

    # FIXME: attach session to all factories
    # https://github.com/pytest-dev/pytest-factoryboy/issues/11#issuecomment-130521820
    BaseFactory._meta.sqlalchemy_session = session
    RecordMetadataFactory._meta.sqlalchemy_session = session
    PersistentIdentifierFactory._meta.sqlalchemy_session = session
    LegacyRecordsMirrorFactory._meta.sqlalchemy_session = session
    # `session` is actually a scoped_session. For the `after_transaction_end`
    # event, we need a session instance to listen for, hence the `session()`
    # call.
    @sa.event.listens_for(session(), "after_transaction_end")
    def restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            session.expire_all()
            session.begin_nested()

    old_session = database.session
    database.session = session

    yield database
    session.remove()
    transaction.rollback()
    connection.close()
    database.session = old_session


@pytest.fixture(scope="function")
def db(db_):
    yield db_


@pytest.fixture(scope="function")
def es_clear(es):
    es_cleanup(es)
    yield es


_app_ = namedtuple("APP", ["app", "redis", "cli"])


def _setup_cli(app):
    """Click CLI runner inside the Flask application."""
    runner = CliRunner()
    obj = ScriptInfo(create_app=lambda info: current_app)
    runner._invoke = runner.invoke
    runner.invoke = partial(runner._invoke, cli, obj=obj)
    return runner


@pytest.fixture(scope="function")
def app_clean(base_app, db, es_clear, vcr_config):
    redis = get_test_redis()
    redis.flushall()
    yield _app_(app=base_app, redis=redis, cli=_setup_cli(base_app))
    redis.flushall()
    redis.close()


_s3_app_ = namedtuple("APP", ["app", "redis", "cli", "s3"])


@pytest.fixture()
def app_with_s3(app_clean, enable_files):
    mock = mock_s3()
    mock.start()
    client = boto3.client("s3")
    resource = boto3.resource("s3")
    s3 = S3(client, resource)

    class MockedInspireS3:
        s3_instance = s3

    real_inspirehep_s3 = app_clean.app.extensions["inspirehep-s3"]
    app_clean.app.extensions["inspirehep-s3"] = MockedInspireS3

    yield _s3_app_(app=app_clean.app, redis=app_clean.redis, cli=app_clean.cli, s3=s3)
    mock.stop()
    app_clean.app.extensions["inspirehep-s3"] = real_inspirehep_s3
