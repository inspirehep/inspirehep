# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import random
import time
from datetime import datetime, timedelta
from functools import partial

from click.testing import CliRunner
from elasticsearch import NotFoundError
from flask import current_app
from flask.cli import ScriptInfo
from helpers.factories.models.pidstore import PersistentIdentifierFactory
from helpers.factories.models.records import RecordMetadataFactory
from helpers.factories.models.user_access_token import AccessTokenFactory, UserFactory
from helpers.providers.faker import faker
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_search import current_search
from invenio_search.utils import build_alias_name

from inspirehep.files import current_s3_instance
from inspirehep.records.api import InspireRecord, LiteratureRecord


def es_search(index):
    return current_search.client.search(get_index_alias(index))


def get_index_alias(index):
    return build_alias_name(index, app=current_app)


def create_pidstore(object_uuid, pid_type, pid_value):
    return PersistentIdentifierFactory(
        object_uuid=object_uuid, pid_type=pid_type, pid_value=pid_value
    )


def create_record_factory(
    record_type, data=None, with_pid=True, with_indexing=False, with_validation=False
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
        index = current_app.config["PID_TYPE_TO_INDEX"][record_type]
        record._index = current_search.client.index(
            index=get_index_alias(index), id=str(record.id), body=record.json, params={}
        )

        current_search.flush_and_refresh(index)
    return record


def create_record(record_type, data=None, **kwargs):
    """Test helper function to create record from the application level.

    Examples:
        data = {'control_number': 123}
        record = create_record(
            'lit',
            data=data,
        )
    """
    accepted_record_types = current_app.config["PID_TYPE_TO_INDEX"].keys()

    if record_type not in accepted_record_types:
        raise ValueError(f"{record_type} is not supported")
    index = current_app.config["PID_TYPE_TO_INDEX"][record_type]
    record_data = faker.record(record_type, data=data, **kwargs)
    record = InspireRecord.create(record_data)
    record._indexing = record.index(delay=False)
    current_search.flush_and_refresh(index)
    return record


def create_s3_file(bucket, key, data, metadata={}):
    current_s3_instance.client.put_object(
        Bucket=bucket, Key=key, Body=data, Metadata=metadata
    )


def create_s3_bucket(key):
    current_s3_instance.client.create_bucket(
        Bucket=current_s3_instance.get_bucket_for_file_key(key)
    )


def create_user_and_token(user_role="superuser"):
    """Test helper function to create user and authentication token."""
    return AccessTokenFactory(**{"role": user_role})


def create_user(role="user", orcid=None, email=None, allow_push=True, token="token"):
    """Test helper function to create user."""
    return UserFactory(
        role=role, orcid=orcid, email=email, allow_push=allow_push, token=token
    )


def logout(client):
    """Test helper function to logout the current user.

    Example:
        user = create_user('cataloger')
        login_user_via_session(api_client, email=cataloger@cat.com)
        . . .
        logout(api_client)
    """

    with client.session_transaction() as sess:
        if sess["user_id"]:
            del sess["user_id"]


def orcid_app_cli_runner():
    """Click CLI runner inside the Flask application for orcid tests."""
    runner = CliRunner()
    obj = ScriptInfo(create_app=lambda info: current_app)
    runner._invoke = runner.invoke
    runner.invoke = partial(runner.invoke, obj=obj)
    return runner


def retry_until_pass(assert_function, timeout=30, retry_interval=0.3):
    last_raised_assertion_error = None
    start = time.monotonic()
    while True:
        time_passed = time.monotonic() - start
        if time_passed > timeout:
            raise last_raised_assertion_error or TimeoutError(
                f"Timed out after {timeout} seconds"
            )
        try:
            return assert_function()
        # retry on assertion and not found errors
        except (
            AssertionError,
            PIDDoesNotExistError,
            NotFoundError,
            KeyError,
            ValueError,
        ) as error:
            last_raised_assertion_error = error
            time.sleep(retry_interval)


def generate_records(
    count=10, record_type=LiteratureRecord, data={}, skip_validation=False
):
    for i in range(count):
        record_data = faker.record(
            record_type.pid_type,
            data=data,
            skip_validation=skip_validation,
            with_control_number=True,
        )
        rec = record_type.create(record_data)
    db.session.commit()


def create_record_async(record_type, data=None, skip_validation=False):
    data = faker.record(
        record_type,
        data=data,
        with_control_number=True,
        skip_validation=skip_validation,
    )
    record = InspireRecord.create(data)
    db.session.commit()
    return record
