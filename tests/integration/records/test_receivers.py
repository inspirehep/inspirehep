# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2018 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

import json
import os

import mock
import pkg_resources
import pytest
from elasticsearch import NotFoundError
from helpers.factories.models.records import RecordMetadataFactory
from inspire_schemas.readers import LiteratureReader
from invenio_db import db
from invenio_oauthclient.models import RemoteAccount, RemoteToken, User, UserIdentity
from invenio_oauthclient.utils import oauth_link_external_id
from invenio_search import current_search_client as es

from inspirehep.migrator.tasks import migrate_and_insert_record
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.search.api import LiteratureSearch


def override_config(**kwargs):
    """
    Override Flask's current app configuration.
    Note: it's a CONTEXT MANAGER.

    Example:
        from utils import override_config

        with override_config(
            MY_FEATURE_FLAG_ACTIVE=True,
            MY_USERNAME='username',
        ):
            ...
    """
    from flask import current_app

    return mock.patch.dict(current_app.config, kwargs)


@pytest.fixture(scope="function")
def user_with_permission(base_app, db, es_clear):
    _user_data = {
        "orcid": "0000-0001-8829-5461",
        "token": "3d25a708-dae9-48eb-b676-aaaaaaaaaaaa",
        "email": "dummy1@email.com",
        "name": "Franz Kärtner",
        "consumer_key": "0000-0000-0000-0000",
        "allow_push": True,
    }

    create_user(**_user_data)

    yield _user_data

    cleanup_user_record(_user_data)


@pytest.fixture(scope="function")
def two_users_with_permission(base_app, db, es):
    _user1_data = {
        "orcid": "0000-0001-8829-5461",
        "token": "3d25a708-dae9-48eb-b676-aaaaaaaaaaaa",
        "email": "dummy1@email.com",
        "name": "Franz Kärtner",
        "consumer_key": "0000-0000-0000-0000",
        "allow_push": True,
    }
    _user2_data = {
        "orcid": "0000-0002-2174-4493",
        "token": "3d25a708-dae9-48eb-b676-bbbbbbbbbbbb",
        "email": "dummy2@email.com",
        "name": "Kranz Färtner Son",
        "consumer_key": "0000-0000-0000-0000",
        "allow_push": True,
    }

    create_user(**_user1_data)
    create_user(**_user2_data)

    yield _user1_data, _user2_data

    cleanup_user_record(_user1_data)
    cleanup_user_record(_user2_data)


@pytest.fixture(scope="function")
def user_without_permission(base_app, db, es):
    _user_data = {
        "orcid": "0000-0001-8829-5461",
        "token": "3d25a708-dae9-48eb-b676-aaaaaaaaaaaa",
        "email": "dummy1@email.com",
        "name": "Franz Kärtner",
        "consumer_key": "0000-0000-0000-0000",
        "allow_push": False,
    }

    create_user(**_user_data)

    yield _user_data

    cleanup_user_record(_user_data)


@pytest.fixture(scope="function")
def user_without_token(base_app, db, es):
    _user_data = {
        "orcid": "0000-0001-8829-5461",
        "email": "dummy1@email.com",
        "name": "Franz Kärtner",
        "consumer_key": "0000-0000-0000-0000",
        "allow_push": False,
    }

    create_user(**_user_data)

    yield _user_data

    cleanup_user_record(_user_data)


@pytest.fixture(scope="function")
def raw_record(base_app, db, es):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1608652.xml")
    )

    with open(record_fixture_path) as _record_fixture_fd:
        yield _record_fixture_fd.read()


@pytest.fixture(scope="function")
def record(raw_record):
    with mock.patch("inspirehep.orcid.tasks.orcid_push") as mock_orcid_push:
        mock_orcid_push.return_value = mock_orcid_push
        _record = migrate_and_insert_record(raw_record)

    return _record


@pytest.fixture
def enable_orcid_push_feature(base_app, db, es):
    with mock.patch.dict(base_app.config, {"FEATURE_FLAG_ENABLE_ORCID_PUSH": True}):
        yield


def create_user(orcid, email, name, consumer_key, token=None, allow_push=False):
    user = User()
    user.email = email
    with db.session.begin_nested():
        db.session.add(user)

    oauth_link_external_id(user, {"id": orcid, "method": "orcid"})

    if token:
        with db.session.begin_nested():
            db.session.add(
                RemoteToken.create(
                    user_id=user.id,
                    client_id=consumer_key,
                    token=token,
                    secret=None,
                    extra_data={
                        "orcid": orcid,
                        "full_name": name,
                        "allow_push": allow_push,
                    },
                )
            )


def assert_db_has_no_user_record(user_record):
    assert User.query.filter_by(email=user_record["email"]).count() == 0
    assert (
        RemoteAccount.query.join(User)
        .join(UserIdentity)
        .filter(UserIdentity.id == user_record["orcid"])
        .count()
        == 0
    )
    if "token" in user_record:
        assert (
            RemoteToken.query.filter_by(access_token=user_record["token"]).count() == 0
        )

    assert UserIdentity.query.filter_by(id=user_record["orcid"]).count() == 0


def cleanup_user_record(user_record):
    if "token" in user_record:
        RemoteToken.query.filter_by(access_token=user_record["token"]).delete()
    user_id = (
        db.session.query(UserIdentity.id_user)
        .filter(UserIdentity.id == user_record["orcid"])
        .subquery()
    )
    RemoteAccount.query.filter(RemoteAccount.user_id.in_(user_id)).delete(
        synchronize_session="fetch"
    )
    UserIdentity.query.filter_by(id=user_record["orcid"]).delete()
    User.query.filter_by(email=user_record["email"]).delete()
    assert_db_has_no_user_record(user_record)


def assert_db_has_no_author_record(author_recid):
    assert InspireRecord.query.filter_by().count() == 0


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_not_trigger_for_author_records(
    mock_orcid_push_task, user_with_permission
):
    mock_orcid_push_task.assert_not_called()


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_not_triggered_on_create_record_without_allow_push(
    mock_orcid_push_task, app, raw_record, user_without_permission
):
    migrate_and_insert_record(raw_record)

    mock_orcid_push_task.assert_not_called()


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_not_triggered_on_create_record_without_token(
    mock_orcid_push_task, app, raw_record, user_without_token
):
    migrate_and_insert_record(raw_record)

    mock_orcid_push_task.assert_not_called()


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_triggered_on_create_record_with_allow_push(
    mock_orcid_push_task,
    app,
    raw_record,
    user_with_permission,
    enable_orcid_push_feature,
):
    migrate_and_insert_record(raw_record)

    expected_kwargs = {
        "kwargs": {
            "orcid": user_with_permission["orcid"],
            "rec_id": 1608652,
            "oauth_token": user_with_permission["token"],
            "kwargs_to_pusher": {"record_db_version": mock.ANY},
        },
        "queue": "orcid_push",
    }

    mock_orcid_push_task.apply_async.assert_called_once_with(**expected_kwargs)


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_triggered_on_record_update_with_allow_push(
    mock_orcid_push_task, app, record, user_with_permission, enable_orcid_push_feature
):
    expected_kwargs = {
        "kwargs": {
            "orcid": user_with_permission["orcid"],
            "rec_id": 1608652,
            "oauth_token": user_with_permission["token"],
            "kwargs_to_pusher": {"record_db_version": mock.ANY},
        },
        "queue": "orcid_push",
    }

    record.commit()

    mock_orcid_push_task.apply_async.assert_called_once_with(**expected_kwargs)


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_triggered_on_create_record_with_multiple_authors_with_allow_push(
    mock_orcid_push_task,
    app,
    raw_record,
    two_users_with_permission,
    enable_orcid_push_feature,
):
    migrate_and_insert_record(raw_record)

    expected_kwargs_user1 = {
        "kwargs": {
            "orcid": two_users_with_permission[0]["orcid"],
            "rec_id": 1608652,
            "oauth_token": two_users_with_permission[0]["token"],
            "kwargs_to_pusher": {"record_db_version": mock.ANY},
        },
        "queue": "orcid_push",
    }
    expected_kwargs_user2 = {
        "kwargs": {
            "orcid": two_users_with_permission[1]["orcid"],
            "rec_id": 1608652,
            "oauth_token": two_users_with_permission[1]["token"],
            "kwargs_to_pusher": {"record_db_version": mock.ANY},
        },
        "queue": "orcid_push",
    }

    mock_orcid_push_task.apply_async.assert_any_call(**expected_kwargs_user1)
    mock_orcid_push_task.apply_async.assert_any_call(**expected_kwargs_user2)
    assert mock_orcid_push_task.apply_async.call_count == 2


@mock.patch("inspirehep.orcid.tasks.orcid_push")
def test_orcid_push_not_triggered_on_create_record_no_feat_flag(
    mocked_Task, app, raw_record, user_with_permission
):
    migrate_and_insert_record(raw_record)

    mocked_Task.assert_not_called()


@pytest.mark.usefixtures("base_app", "db", "es")
class TestPushToOrcid(object):
    def setup(self):
        # record 736770
        record_fixture_path = pkg_resources.resource_filename(
            __name__, os.path.join("fixtures", "736770.json")
        )
        data = json.load(open(record_fixture_path))
        self.record = LiteratureRecord.create(data)

    def test_existing_record(self):
        recid = 736770
        inspire_record = LiteratureRecord.get_record_by_pid_value(recid)
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ), mock.patch(
            "inspirehep.records.receivers.push_access_tokens"
        ) as mock_push_access_tokens, mock.patch(
            "inspirehep.orcid.tasks.orcid_push.apply_async"
        ) as mock_apply_async:
            mock_push_access_tokens.get_access_tokens.return_value = [
                ("myorcid", "mytoken")
            ]
            inspire_record.commit()
            mock_apply_async.assert_called_once_with(
                kwargs={
                    "orcid": "myorcid",
                    "oauth_token": "mytoken",
                    "kwargs_to_pusher": {
                        "record_db_version": inspire_record.model.version_id
                    },
                    "rec_id": recid,
                },
                queue="orcid_push",
            )

    def test_new_record(self):
        recid = 9999912587
        record_json = {
            "$schema": "http://localhost:5000/schemas/records/hep.json",
            "document_type": ["article"],
            "control_number": recid,
            "titles": [{"title": "Jessica Jones"}],
            "_collections": ["Literature"],
            "references": [
                {"record": {"$ref": "http://localhost:5000/api/literature/1498589"}}
            ],
        }
        inspire_record = InspireRecord.create(record_json)
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ), mock.patch(
            "inspirehep.records.receivers.push_access_tokens"
        ) as mock_push_access_tokens, mock.patch(
            "inspirehep.orcid.tasks.orcid_push.apply_async"
        ) as mock_apply_async:
            mock_push_access_tokens.get_access_tokens.return_value = [
                ("myorcid", "mytoken")
            ]
            inspire_record.commit()
            mock_apply_async.assert_called_once_with(
                kwargs={
                    "orcid": "myorcid",
                    "oauth_token": "mytoken",
                    "kwargs_to_pusher": {
                        "record_db_version": inspire_record.model.version_id
                    },
                    "rec_id": recid,
                },
                queue="orcid_push",
            )
