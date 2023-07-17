# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import logging
import random
from functools import partial, wraps

import orjson
from click.testing import CliRunner
from flask import current_app
from flask.cli import ScriptInfo
from helpers.factories.models.pidstore import PersistentIdentifierFactory
from helpers.factories.models.records import RecordMetadataFactory
from helpers.factories.models.user_access_token import AccessTokenFactory, UserFactory
from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search
from invenio_search.utils import build_alias_name
from tenacity import retry

from inspirehep.files import current_s3_instance
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.utils import get_inspirehep_url

SENSITIVE_RESPONSE_KEYS = ["user.name", "user.email"]
ENABLED_USER_DATA = ["marcjanna.jedrych@cern.ch", "Marcjanna Jedrych"]


def es_search(index):
    return current_search.client.search(index=get_index_alias(index))


def get_index_alias(index):
    return build_alias_name(index, app=current_app)


def create_pidstore(object_uuid, pid_type, pid_value):
    return PersistentIdentifierFactory(
        object_uuid=object_uuid, pid_type=pid_type, pid_value=pid_value
    )


def create_record_factory(
    record_type, data=None, with_pid=True, with_indexing=False, with_validation=False
):
    control_number = random.randint(1, 999_999_999)
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
    lit_record_without_author_refs = kwargs.pop("without_author_refs", False)
    record_data = faker.record(record_type, data=data, **kwargs)
    if record_type == "lit" and not lit_record_without_author_refs:
        record_data = _update_authors_with_record_ref(record_data)
    record = InspireRecord.create(record_data)
    record._indexing = record.index(delay=False)
    current_search.flush_and_refresh(index)
    return record


def create_s3_file(bucket, key, data, metadata={}, **kwargs):
    current_s3_instance.client.put_object(
        Bucket=bucket, Key=key, Body=data, Metadata=metadata, **kwargs
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
    obj = ScriptInfo(create_app=lambda: inspire_app)
    runner.invoke = partial(runner.invoke, obj=obj)
    return runner


def generate_records(
    count=10,
    record_type=LiteratureRecord,
    data={},
    skip_validation=False,
    with_control_number=True,
):
    for i in range(count):
        record_data = faker.record(
            record_type.pid_type,
            data=data,
            skip_validation=skip_validation,
            with_control_number=with_control_number,
        )
        record_type.create(record_data)
    db.session.commit()


def create_record_async(
    record_type, data=None, skip_validation=False, with_control_number=True
):
    data = faker.record(
        record_type,
        data=data,
        with_control_number=with_control_number,
        skip_validation=skip_validation,
    )
    record = InspireRecord.create(data)
    db.session.commit()
    return record


def _update_authors_with_record_ref(data):
    if "authors" not in data:
        return data
    assigned_recids = set()
    base_url = get_inspirehep_url()
    new_data = data.copy()
    for author in new_data["authors"]:
        if "record" not in author:
            recid = get_random_recid(assigned_recids)
            author["record"] = {"$ref": f"{base_url}/api/authors/{recid}"}
    return new_data


def get_random_recid(recids_to_exclude):
    random_recid = random.randint(1, 2_147_483_647)
    return (
        random_recid
        if random_recid not in recids_to_exclude
        else get_random_recid(recids_to_exclude)
    )


def filter_out_authentication(request):
    if "api-access" in request.path:
        return None
    return request


def filter_out_user_data_and_cookie_headers():
    def before_record_response(response):
        response_headers = response["headers"]
        if response_headers.get("Set-Cookie"):
            del response_headers["Set-Cookie"]
        response["headers"] = response_headers
        response_body = orjson.loads(response["body"]["string"])
        for item in response_body.get("result", []):
            for key in item:
                if (
                    key in SENSITIVE_RESPONSE_KEYS
                    and item[key] not in ENABLED_USER_DATA
                ):
                    item[key] = "XXX"
        response["body"]["string"] = orjson.dumps(response_body)
        return response

    return before_record_response


def disable_low_level_logging(f):
    def wrapper(*args):
        logging.disable(logging.ERROR)
        result = f(*args)
        logging.disable(logging.NOTSET)
        return result

    return wrapper


def retry_test(stop=None, wait=None):
    def inner(func):
        @disable_low_level_logging
        @retry(stop=stop, wait=wait)
        @wraps(func)
        def _retry_test(*args, **kwargs):
            return func(*args, **kwargs)

        return _retry_test

    return inner
