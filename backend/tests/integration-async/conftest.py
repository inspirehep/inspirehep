# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging
import time
from copy import deepcopy
from datetime import datetime, timedelta
from functools import partial

import pytest
import sqlalchemy
from click.testing import CliRunner
from flask.cli import ScriptInfo
from helpers.providers.faker import faker
from inspire_utils.record import get_value
from invenio_db import db
from invenio_search import current_search_client as es
from redis import StrictRedis

from inspirehep.factory import create_app as inspire_create_app
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.fixtures import (
    init_default_storage_path,
    init_records_files_storage_path,
)

logger = logging.getLogger(__name__)


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
    from sqlalchemy_utils.functions import create_database, database_exists

    with app.app_context():
        db_.session.commit()
        db_.session.remove()
        try:
            db_.drop_all()
        except sqlalchemy.exc.OperationalError:
            # Prevent deadlocks on dropping table
            db_.drop_all()
        if not database_exists(str(db_.engine.url)):
            create_database(str(db_.engine.url))
        db_.create_all()

        _es = app.extensions["invenio-search"]
        list(_es.delete(ignore=[404]))
        list(_es.create(ignore=[400]))
        init_default_storage_path()
        init_records_files_storage_path()
        es.indices.refresh("records-hep")
        es.indices.refresh("records-authors")


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


@pytest.fixture(scope="function")
def retry_until_matched():
    """DEPRECATED! DO NOT USE."""

    def _check(steps={}, timeout=15):
        """Allows to wait for task to finish, by doing steps and proper checks assigned
          to them.

        If timeout is reached and not all checks will pass then throws assert on which
        it failed
        Args:
            steps(list): Properly specified steps and checks.
        Returns: result from last step
        Examples:
            >>> steps = [
                    {
                        'step': es.indices.refresh,
                        'args': ["records-hep"],
                        'kwargs': {},
                        'expected_result': 'some_data'

                    },
                    {
                        'step': es.search,
                        'args': ["records-hep"],
                        'kwargs': {}
                        'expected_result': {
                            'expected_key': 'expected_key_name',
                            'expected_result': 'expected_result_data'
                        }
                    }
                ]
        """
        start = datetime.now()
        finished = False
        _current_result = None
        while not finished:
            for step in steps:
                _args = step.get("args", [])
                _kwargs = step.get("kwargs", {})
                _expected_result = step.get("expected_result")
                _fun = step.get("step")
                _expected_key = None
                try:
                    result = _fun(*_args, **_kwargs)
                except:
                    pass
                _current_result = deepcopy(result)
                if _expected_result:
                    if (
                        isinstance(_expected_result, dict)
                        and "expected_key" in _expected_result
                        and "expected_result" in _expected_result
                    ):
                        _expected_key = _expected_result["expected_key"]
                        _expected_result = _expected_result["expected_result"]
                        result = get_value(result, _expected_key)

                    if result == _expected_result:
                        finished = True
                    else:

                        finished = False
                        time.sleep(1)
                        if (datetime.now() - start) > timedelta(seconds=timeout):
                            assert result == _expected_result
                        break
                else:
                    if (datetime.now() - start) > timedelta(seconds=timeout):
                        raise TimeoutError(
                            f"timeout exceeded during checks on step{_fun} "
                            f"{(datetime.now() - start)}"
                        )
        return _current_result

    return _check


@pytest.fixture(scope="class")
def app_cli(app):
    """Click CLI runner inside the Flask application."""
    runner = CliRunner()
    obj = ScriptInfo(create_app=lambda info: app)
    runner._invoke = runner.invoke
    runner.invoke = partial(runner.invoke, obj=obj)
    return runner


@pytest.fixture(scope="function")
def generate_records():
    def _generate(
        count=10, record_type=LiteratureRecord, data={}, skip_validation=False
    ):
        for i in range(count):
            data = faker.record(
                record_type.pid_type, data=data, skip_validation=skip_validation
            )
            rec = record_type.create(data)
        db.session.commit()

    return _generate


@pytest.fixture(scope="function")
def create_record():
    def _create_record(record_type, data=None, skip_validation=False):
        data = faker.record(
            record_type,
            data=data,
            with_control_number=True,
            skip_validation=skip_validation,
        )
        record = InspireRecord.create(data)
        db.session.commit()
        return record

    return _create_record


@pytest.fixture(scope="function")
def cache(app):
    redis_client = StrictRedis.from_url(app.config["CACHE_REDIS_URL"])
    yield redis_client
    redis_client.flushall()
