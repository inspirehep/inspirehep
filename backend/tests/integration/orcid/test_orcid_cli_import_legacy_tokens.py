# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from flask import current_app
from helpers.factories.db.invenio_records import TestRecordMetadata
from helpers.utils import get_index_alias, orcid_app_cli_runner
from invenio_db import db
from invenio_oauthclient.models import RemoteAccount, RemoteToken, User, UserIdentity
from mock import patch
from pytest import fixture, mark
from redis import StrictRedis
from simplejson import dumps

from inspirehep.orcid import push_access_tokens
from inspirehep.orcid.cli import import_legacy_orcid_tokens
from inspirehep.orcid.tasks import (
    USER_EMAIL_EMPTY_PATTERN,
    _find_user_matching,
    _register_user,
    legacy_orcid_arrays,
)

# The tests are written in a specific order, disable random
pytestmark = mark.random_order(disabled=True)

SAMPLE_USER = {
    "orcid": "0000-0002-1825-0097",
    "token": "3d25a708-dae9-48eb-b676-80a2bfb9d35c",
    "email": "j.carberry@orcid.org",
    "name": "Josiah Carberry",
}
SAMPLE_USER_2 = {
    "orcid": "0000-0001-1234-1234",
    "token": "12345678-9abc-def1-2345-6789abcdef12",
    "email": "j.doe@orcid.org",
    "name": "John Doe",
}
SAMPLE_USER_EDITED = {
    "orcid": "0000-0002-1825-0097",
    "token": "00000000-0000-0000-0000-000000000000",
    "email": "j.carberry@orcid.org",
    "name": "Josiah Carberry",
}


def record_dict_to_array(user_record):
    """Convert user record to an array, like ones received through redis."""
    key_ordering = ["orcid", "token", "email", "name"]
    return list(user_record[key] for key in key_ordering)


def push_to_redis(user_record):
    """Push a user record to redis."""
    user_record_json = dumps(record_dict_to_array(user_record))
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    r = StrictRedis.from_url(redis_url)
    r.lpush("legacy_orcid_tokens", user_record_json)


def assert_db_has_n_legacy_tokens(n, record):
    assert n == User.query.filter_by(email=record["email"]).count()
    assert (
        n
        == RemoteAccount.query.join(User)
        .join(UserIdentity)
        .filter(UserIdentity.id == record["orcid"])
        .count()
    )

    tokens = RemoteToken.query.filter_by(access_token=record["token"]).all()
    assert n == len(tokens)
    for token in tokens:
        assert token.remote_account.extra_data["allow_push"] is True

    assert n == UserIdentity.query.filter_by(id=record["orcid"]).count()


def cleanup_record(record):
    RemoteToken.query.filter_by(access_token=record["token"]).delete()
    user_id = (
        db.session.query(UserIdentity.id_user)
        .filter(UserIdentity.id == record["orcid"])
        .subquery()
    )
    RemoteAccount.query.filter(RemoteAccount.user_id.in_(user_id)).delete(
        synchronize_session="fetch"
    )
    UserIdentity.query.filter_by(id=record["orcid"]).delete()
    User.query.filter_by(email=record["email"]).delete()


@fixture(scope="function")
def teardown_sample_user(inspire_app):
    yield

    cleanup_record(SAMPLE_USER)
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)


@fixture(scope="function")
def teardown_sample_user_2(inspire_app):
    yield

    cleanup_record(SAMPLE_USER_2)
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER_2)


@fixture(scope="function")
def teardown_sample_user_edited(inspire_app):
    yield

    cleanup_record(SAMPLE_USER_EDITED)
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER_EDITED)


@fixture(scope="function")
def redis_setup(inspire_app):
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    r = StrictRedis.from_url(redis_url)

    yield r

    r.delete("legacy_orcid_tokens")


@fixture(scope="function")
def app_with_config(inspire_app, override_config):
    config = {"ORCID_APP_CREDENTIALS": {"consumer_key": "0000-0000-0000-0000"}}
    with override_config(**config):
        yield inspire_app


@fixture(scope="function")
def app_without_config(inspire_app, override_config):
    config = {"ORCID_APP_CREDENTIALS": {"consumer_key": None}}
    with override_config(**config):
        yield inspire_app


@pytest.fixture
def inspire_record_author():
    factory_author = TestRecordMetadata.create_from_file(
        __name__,
        "test_orcid_tasks_import_legacy_tokens_TestImportLegacyOrcidTokens_author.json",
        pid_type="aut",
    )
    return factory_author.inspire_record


@pytest.fixture
def inspire_record_literature():
    factory_literature = TestRecordMetadata.create_from_file(
        __name__,
        "test_orcid_tasks_import_legacy_tokens_TestImportLegacyOrcidTokens_literature.json",
        index_name=get_index_alias("records-hep"),
    )
    return factory_literature.inspire_record


@pytest.fixture
def assert_user_and_token_models():
    def _assert_user_and_token_models(orcid, token, email, name):
        user = User.query.filter_by(email=email).one_or_none()
        assert user
        assert user.active
        assert len(user.remote_accounts) == 1
        remote_account = user.remote_accounts[0]
        assert UserIdentity.query.filter_by(id_user=user.id).one_or_none()
        assert len(remote_account.remote_tokens) == 1
        remote_token = remote_account.remote_tokens[0]

        assert remote_token.access_token == token
        assert remote_account.extra_data["orcid"] == orcid
        assert remote_account.extra_data["full_name"] == name
        assert remote_account.extra_data["allow_push"]

    return _assert_user_and_token_models


@pytest.fixture
def cache_fixture():
    CACHE_EXPIRE_ORIG = push_access_tokens.CACHE_EXPIRE
    push_access_tokens.CACHE_EXPIRE = 2  # Sec.
    yield
    push_access_tokens.CACHE_PREFIX = None
    push_access_tokens.CACHE_EXPIRE = CACHE_EXPIRE_ORIG


def test_legacy_orcid_arrays(inspire_app, redis_setup):
    """Test the generator functionality."""
    push_to_redis(SAMPLE_USER_2)
    push_to_redis(SAMPLE_USER)

    # Check initial state of queue
    assert redis_setup.llen("legacy_orcid_tokens") == 2

    # Take all the records from the queue
    json_list = list(legacy_orcid_arrays())

    # Check if results are expected, and that redis is empty
    assert json_list == [record_dict_to_array(x) for x in [SAMPLE_USER, SAMPLE_USER_2]]
    assert redis_setup.llen("legacy_orcid_tokens") == 0


def test_import_multiple_orcid_tokens_no_user_exists(
    app_with_config, redis_setup, teardown_sample_user, teardown_sample_user_2
):
    """Create two users and all the associate entries."""
    push_to_redis(SAMPLE_USER_2)
    push_to_redis(SAMPLE_USER)
    # Check initial state
    assert redis_setup.llen("legacy_orcid_tokens") == 2
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER_2)

    # Migrate
    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    # both authors are not found
    output = result.output.split("\n")
    assert output.count("No row was found for one()") == 2

    # Check state after migration
    assert not redis_setup.llen("legacy_orcid_tokens")
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER_2)


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_empty_name(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    assert_user_and_token_models,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
):
    orcid = "0000-0002-0942-3697"
    token = "mytoken"
    email = "myemail@me.com"
    name = ""
    mock_legacy_orcid_arrays.return_value = (
        (orcid, token, email, name),
        ("myotherorcid", "myothertoken", "otheremail@me.com", name),
    )

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    assert "Pushing orcid" in result.output
    mock_orcid_push.apply_async.assert_any_call(
        queue="orcid_push_legacy_tokens",
        kwargs={
            "orcid": orcid,
            "rec_id": inspire_record_literature["control_number"],
            "oauth_token": token,
        },
    )

    assert_user_and_token_models(orcid, token, email, name)
    assert result.output.split("\n").count("No row was found for one()") == 1


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.get_literature_recids_for_orcid")
def test_import_legacy_orcid_tokens_pushes_on_new_user(
    mock_get_literature_recids_for_orcid,
    mock_orcid_push,
    app_with_config,
    redis_setup,
    teardown_sample_user,
):
    mock_get_literature_recids_for_orcid.return_value = [4328]

    push_to_redis(SAMPLE_USER)

    # Check initial state
    assert redis_setup.llen("legacy_orcid_tokens") == 1
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)

    # Migrate
    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    # Check state after migration
    assert not redis_setup.llen("legacy_orcid_tokens")
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)

    # Check that we pushed to ORCID
    assert "Pushing orcid" in result.output
    mock_orcid_push.apply_async.assert_called_with(
        queue="orcid_push_legacy_tokens",
        kwargs={
            "orcid": "0000-0002-1825-0097",
            "rec_id": 4328,
            "oauth_token": "3d25a708-dae9-48eb-b676-80a2bfb9d35c",
        },
    )


def test_import_multiple_orcid_tokens_no_configuration(
    app_without_config, redis_setup, teardown_sample_user, teardown_sample_user_2
):
    """Attempt and fail to create new users when configuration missing."""
    push_to_redis(SAMPLE_USER_2)
    push_to_redis(SAMPLE_USER)

    # Check initial state
    assert redis_setup.llen("legacy_orcid_tokens") == 2
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER_2)

    # Migrate
    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    # Assert state unchanged after migration
    assert "Pushing orcid" not in result.output
    assert redis_setup.llen("legacy_orcid_tokens") == 2
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER_2)


def test_linked_user_with_token_exists(app_with_config, teardown_sample_user):
    """Ignore token, if already has one."""
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)

    # Register sample user
    _register_user(**SAMPLE_USER)
    db.session.commit()

    # Check state after migration
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)

    # Register the same user with another token
    _register_user(**SAMPLE_USER_EDITED)
    db.session.commit()

    # Assert token unchanged
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)
    assert 0 == RemoteToken.query.filter_by(token=SAMPLE_USER_EDITED).count()


def test_linked_user_without_token_exists(app_with_config, teardown_sample_user_edited):
    """Add a token to an existing user with an ORCID paired."""
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)

    # Register sample user
    _register_user(**SAMPLE_USER)
    db.session.commit()

    # Check state after migration
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)

    # Remove token and remote account
    RemoteToken.query.filter_by(access_token=SAMPLE_USER["token"]).delete()
    user_id = (
        db.session.query(UserIdentity.id_user)
        .filter(UserIdentity.id == SAMPLE_USER["orcid"])
        .subquery()
    )
    RemoteAccount.query.filter(RemoteAccount.user_id.in_(user_id)).delete(
        synchronize_session="fetch"
    )

    # Register the same user with another token
    _register_user(**SAMPLE_USER_EDITED)
    db.session.commit()

    # Assert new token
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER_EDITED)


def test_unlinked_user_exists(app_with_config, teardown_sample_user):
    """Add a token to an existing user without a paired ORCID."""
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)

    # Register sample user
    user = User()
    user.email = SAMPLE_USER["email"]
    with db.session.begin_nested():
        db.session.add(user)

    # Register the token
    _register_user(**SAMPLE_USER)
    db.session.commit()

    # Assert new token
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)


@mark.parametrize(
    "orcid,email",
    [
        ("0000-0002-1825-0097", "email.not@in.db"),
        ("9876-5432-0987-6543", "j.carberry@orcid.org"),
        ("0000-0002-1825-0097", "j.carberry@orcid.org"),
    ],
    ids=["verify match on orcid", "verify match on email", "verify match on both"],
)
def test_find_user_matching(app_with_config, teardown_sample_user, orcid, email):
    """Add a token to an existing user with an ORCID paired."""
    assert_db_has_n_legacy_tokens(0, SAMPLE_USER)

    # Register sample user
    _register_user(**SAMPLE_USER)
    db.session.commit()

    # Check state after migration
    assert_db_has_n_legacy_tokens(1, SAMPLE_USER)

    # Remove token and remote account
    user_by_orcid = _find_user_matching(orcid, email)

    # Assert the user found is the one added
    assert user_by_orcid.email == SAMPLE_USER["email"]
    assert User.query.filter_by(email=SAMPLE_USER["email"]).count() == 1


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_orcid_happy_flow(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    assert_user_and_token_models,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
):
    orcid = "0000-0002-0942-3697"
    token = "mytoken"
    email = "myemail@me.com"
    name = "myname"
    mock_legacy_orcid_arrays.return_value = ((orcid, token, email, name),)

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    assert "Pushing orcid" in result.output
    mock_orcid_push.apply_async.assert_any_call(
        queue="orcid_push_legacy_tokens",
        kwargs={
            "orcid": orcid,
            "rec_id": inspire_record_literature["control_number"],
            "oauth_token": token,
        },
    )

    assert_user_and_token_models(orcid, token, email, name)


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_empty_email(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    assert_user_and_token_models,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
):
    orcid = "0000-0002-0942-3697"
    token = "mytoken"
    email = ""
    name = "myname"
    mock_legacy_orcid_arrays.return_value = (
        (orcid, token, email, name),
        ("myotherorcid", "myothertoken", email, "othername"),
    )

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    assert_user_and_token_models(
        orcid, token, USER_EMAIL_EMPTY_PATTERN.format(orcid), name
    )
    assert result.output.split("\n").count("No row was found for one()") == 1


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_print_exception_when_no_author_record(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
):
    orcid = "inexistentorcid"
    token = "mytoken"
    name = "myname"
    email = "myemail@me.com"
    mock_legacy_orcid_arrays.return_value = ((orcid, token, email, name),)

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    # Ensure that when no author record is found with that ORCID
    # the exception is printed out.
    assert result.output.split("\n").count("No row was found for one()") == 1


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_empty_email_w_existing_user_w_empty_email(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    assert_user_and_token_models,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
):
    user = User(email="")
    db.session.add(user)

    orcid = "0000-0002-0942-3697"
    token = "mytoken"
    email = ""
    name = "myname"
    mock_legacy_orcid_arrays.return_value = ((orcid, token, email, name),)

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    assert_user_and_token_models(
        orcid, token, USER_EMAIL_EMPTY_PATTERN.format(orcid), name
    )


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_2_entries_in_legacy_orcid_arrays_but_1_literature(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    assert_user_and_token_models,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
):
    orcid = "0000-0002-0942-3697"
    token = "mytoken"
    email = "myemail@me.com"
    name = "myname"
    mock_legacy_orcid_arrays.return_value = (
        (orcid, token, email, name),
        ("myotherorcid", "myothertoken", "otheremail@me.com", "othername"),
    )

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    mock_orcid_push.apply_async.assert_any_call(
        queue="orcid_push_legacy_tokens",
        kwargs={
            "orcid": orcid,
            "rec_id": inspire_record_literature["control_number"],
            "oauth_token": token,
        },
    )

    assert_user_and_token_models(orcid, token, email, name)
    assert result.output.split("\n").count("No row was found for one()") == 1


@patch("inspirehep.orcid.cli.orcid_push")
@patch("inspirehep.orcid.cli.legacy_orcid_arrays")
def test_invalid_token(
    mock_legacy_orcid_arrays,
    mock_orcid_push,
    redis_setup,
    inspire_record_author,
    inspire_record_literature,
    cache_fixture,
):
    orcid = "0000-0002-0942-3697"
    token = "mytoken"
    email = "myemail@me.com"
    name = "myname"
    cache = push_access_tokens._OrcidInvalidTokensCache(token)
    cache.write_invalid_token(orcid)
    mock_legacy_orcid_arrays.return_value = ((orcid, token, email, name),)

    result = orcid_app_cli_runner().invoke(import_legacy_orcid_tokens)

    mock_orcid_push.apply_async.assert_not_called()

    assert not User.query.filter_by(email=email).one_or_none()
    assert "Token mytoken is invalid. Skipping push" in result.output
