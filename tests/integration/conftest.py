# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

import random
from functools import partial

import pytest
from click.testing import CliRunner
from flask import current_app
from flask.cli import ScriptInfo
from helpers.factories.models.base import BaseFactory
from helpers.factories.models.migrator import LegacyRecordsMirrorFactory
from helpers.factories.models.pidstore import PersistentIdentifierFactory
from helpers.factories.models.records import RecordMetadataFactory
from helpers.factories.models.user_access_token import AccessTokenFactory, UserFactory
from helpers.providers.faker import faker

from inspirehep.factory import create_api as inspire_create_app
from inspirehep.records.api import InspireRecord


@pytest.fixture(scope="module")
def app_config(app_config):
    # add extra global config if you would like to customize the config
    # for a specific test you can chagne create fixture per-directory
    # using ``conftest.py`` or per-file.

    # Due to flask error it has to be False otherwise Alembic __init__ will fail.
    app_config["DEBUG"] = False
    app_config["JSONSCHEMAS_HOST"] = "localhost:5000"
    app_config["SERVER_NAME"] = "localhost:5000"
    app_config["SEARCH_ELASTIC_HOSTS"] = "localhost:9200"
    app_config[
        "SQLALCHEMY_DATABASE_URI"
    ] = "postgresql+psycopg2://inspirehep:inspirehep@localhost/inspirehep"
    return app_config


@pytest.fixture(scope="function")
def enable_files(base_app):
    base_app.config["FEATURE_FLAG_ENABLE_FILES"] = True


@pytest.fixture(scope="function")
def disable_files(base_app):
    base_app.config["FEATURE_FLAG_ENABLE_FILES"] = False


@pytest.fixture(scope="module")
def create_app():
    return inspire_create_app


@pytest.fixture(scope="function")
def db(database):
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
def create_record(base_app, db, es_clear):
    """Fixture to create record from the application level.

    Examples:

        def test_with_record(base_app, create_record)
            data = {'control_number': 123}
            record = create_record(
                'lit',
                data=data,
            )
    """

    def _create_record(record_type, data=None):
        accepted_record_types = base_app.config["PID_TYPE_TO_INDEX"].keys()
        if record_type not in accepted_record_types:
            raise ValueError(f"{record_type} is not supported")
        index = base_app.config["PID_TYPE_TO_INDEX"][record_type]
        record_data = faker.record(record_type, data=data)
        record = InspireRecord.create(record_data)
        record._indexing = record._index()
        es_clear.indices.refresh(index)
        return record

    return _create_record


@pytest.fixture(scope="function")
def create_record_factory(base_app, db, es_clear):
    """Fixtures to create factory record.

    Examples:

        def test_with_record(base_app, create_record_factory)
            record = create_record_factory(
                'lit',
                with_pid=True,
                with_index=False,
            )
    """

    def _create_record_factory(
        record_type,
        data=None,
        with_pid=True,
        with_indexing=False,
        with_validation=False,
    ):
        control_number = random.randint(1, 2_147_483_647)
        if with_validation:
            data = faker.record(record_type, data)
        record = RecordMetadataFactory(
            record_type=record_type, data=data, control_number=control_number
        )

        if with_pid:
            record._persistent_identifier = PersistentIdentifierFactory(
                object_uuid=record.id,
                pid_type=record_type,
                pid_value=record.json["control_number"],
            )

        if with_indexing:
            index = base_app.config["PID_TYPE_TO_INDEX"][record_type]
            record._index = es_clear.index(
                index=index,
                id=str(record.id),
                doc_type=index.split("-")[-1],
                body=record.json,
                params={},
            )
            es_clear.indices.refresh(index)
        return record

    return _create_record_factory


@pytest.fixture(scope="function")
def create_pidstore(db):
    def _create_pidstore(object_uuid, pid_type, pid_value):
        return PersistentIdentifierFactory(
            object_uuid=object_uuid, pid_type=pid_type, pid_value=pid_value
        )

    return _create_pidstore


@pytest.fixture(scope="function")
def api_client(base_app):
    """Test client for the base application fixture.
    Scope: function
    If you need the database and search indexes initialized, simply use the
    Pytest-Flask fixture ``client`` instead. This fixture is mainly useful if
    you need a test client without needing to initialize both the database and
    search indexes.
    """
    with base_app.test_client() as client:
        yield client


@pytest.fixture(scope="function")
def create_user_and_token(base_app, db):
    """Fixtures to create user and authentication token for given user.

    Examples:

        def test_needs_authentication(base_app, create_user_and_token)
            user = create_user_and_token()
    """

    def _create_user_and_token():
        return AccessTokenFactory()

    return _create_user_and_token


@pytest.fixture(scope="function")
def create_user(base_app, db):
    """Fixture to create user.

    Examples:

        def test_needs_user(base_app, create_user)
            user = create_user()
    """

    def _create_user(role="user", orcid=None, email=None):
        return UserFactory(role=role, orcid=orcid, email=email)

    return _create_user


@pytest.fixture
def logout():
    """
    Fixture to logout the current user.

    Example:
        user = create_user('cataloger')
        login_user_via_session(api_client, email=cataloger@cat.com)
        . . .
        logout(api_client)
    """

    def _logout(client):
        with client.session_transaction() as sess:
            if sess["user_id"]:
                del sess["user_id"]

    return _logout


@pytest.fixture(scope="function")
def app_cli_runner(appctx):
    """Click CLI runner inside the Flask application."""
    runner = CliRunner()
    obj = ScriptInfo(create_app=lambda info: current_app)
    runner._invoke = runner.invoke
    runner.invoke = partial(runner.invoke, obj=obj)
    return runner
