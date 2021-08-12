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


import time

import orjson
import pytest
from celery import shared_task
from helpers.factories.db.invenio_oauthclient import (
    TestRemoteAccount,
    TestRemoteToken,
    TestUserIdentity,
)
from helpers.utils import create_record
from inspire_dojson.utils import get_record_ref
from inspire_schemas.api import validate
from inspire_utils.record import get_values_for_schema
from invenio_db import db
from invenio_pidstore.errors import PIDAlreadyExists
from mock import patch
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.orcid.push_access_tokens import get_access_tokens
from inspirehep.orcid.utils import (
    get_literature_recids_for_orcid,
    get_orcids_for_push,
    update_moved_orcid,
)
from inspirehep.records.api import InspireRecord

# The tests are written in a specific order, disable random
pytestmark = pytest.mark.random_order(disabled=True)


@pytest.fixture(scope="function")
def author_in_isolated_app(inspire_app):
    record = {
        "$schema": "http://localhost:5000/schemas/records/authors.json",
        "_collections": ["Authors"],
        "control_number": 123456789,  # FIXME remove when there is an easy way to insert new records
        "ids": [
            {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
            {"schema": "ORCID", "value": "0000-0002-1825-0097"},
        ],
        "name": {"value": "Smith, John"},
    }

    assert validate(record, "authors") is None

    record = InspireRecord.create_or_update(record)
    yield record["control_number"]


@pytest.fixture(scope="function")
def user_remote_account(inspire_app):
    orcid = "0000-0003-4792-9178"
    test_user = TestUserIdentity.create_for_orcid(orcid)
    test_user.user.email = "test-user@cern.ch"
    test_user_remote_account = TestRemoteAccount.create_from_kwargs(
        user_id=test_user.user.id, extra_data={"orcid": orcid, "allow_push": True}
    )
    TestRemoteToken.create_from_kwargs(
        remote_account=test_user_remote_account.remote_account
    ).remote_token
    yield test_user_remote_account


def test_orcids_for_push_no_authors(inspire_app):
    record = {
        "_collections": ["Literature"],
        "corporate_author": ["Corporate Author"],
        "document_type": ["article"],
        "titles": [{"title": "A paper with no authors"}],
    }

    assert validate(record, "hep") is None
    assert list(get_orcids_for_push(record)) == []


def test_orcids_for_push_no_orcids(inspire_app):
    record = {
        "_collections": ["Literature"],
        "authors": [
            {
                "full_name": "Smith, John",
                "ids": [{"schema": "INSPIRE BAI", "value": "J.Smith.1"}],
            }
        ],
        "document_type": ["article"],
        "titles": [{"title": "An interesting paper"}],
    }

    assert validate(record, "hep") is None
    assert list(get_orcids_for_push(record)) == []


def test_orcids_for_push_orcid_in_paper(inspire_app):
    record = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "No Orcid, Jimmy"},
            {
                "full_name": "Smith, John",
                "ids": [
                    {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
                    {"schema": "ORCID", "value": "0000-0002-1825-0097"},
                ],
            },
        ],
        "document_type": ["article"],
        "titles": [{"title": "An interesting paper"}],
    }

    assert validate(record, "hep") is None
    assert list(get_orcids_for_push(record)) == ["0000-0002-1825-0097"]


def test_orcids_for_push_orcid_in_author_no_claim(author_in_isolated_app):
    record = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "No Orcid, Jimmy"},
            {
                "full_name": "Smith, John",
                "ids": [{"schema": "INSPIRE BAI", "value": "J.Smith.1"}],
                "record": get_record_ref(author_in_isolated_app, "authors"),
            },
        ],
        "document_type": ["article"],
        "titles": [{"title": "An interesting paper"}],
    }

    assert validate(record, "hep") is None
    assert list(get_orcids_for_push(record)) == []


def test_orcids_for_push_orcid_in_author_with_claim(author_in_isolated_app):
    record = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "No Orcid, Jimmy"},
            {
                "full_name": "Smith, John",
                "ids": [{"schema": "INSPIRE BAI", "value": "J.Smith.1"}],
                "record": get_record_ref(author_in_isolated_app, "authors"),
                "curated_relation": True,
            },
        ],
        "document_type": ["article"],
        "titles": [{"title": "An interesting paper"}],
    }

    assert validate(record, "hep") is None
    assert list(get_orcids_for_push(record)) == ["0000-0002-1825-0097"]


def test_orcid_for_push_orcid_in_author_with_claim_and_in_paper(author_in_isolated_app):
    record = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "No Orcid, Jimmy"},
            {
                "full_name": "Smith, John",
                "ids": [
                    {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
                    {"schema": "ORCID", "value": "0000-0002-1825-0089"},
                ],
                "record": get_record_ref(author_in_isolated_app, "authors"),
                "curated_relation": True,
            },
        ],
        "document_type": ["article"],
        "titles": [{"title": "An interesting paper"}],
    }

    assert validate(record, "hep") is None
    assert list(get_orcids_for_push(record)) == [
        "0000-0002-1825-0089",
        "0000-0002-1825-0097",
    ]


def test_get_literature_recids_for_orcid(inspire_app, datadir):
    create_record("aut", data={"control_number": 994473})
    data_author = orjson.loads((datadir / "1061000.json").read_text())
    create_record("aut", data=data_author)
    data_literature = orjson.loads((datadir / "1496635.json").read_text())
    create_record("lit", data=data_literature)
    expected = [1496635]
    result = get_literature_recids_for_orcid("0000-0003-4792-9178")

    assert expected == result


def test_get_literature_recids_for_orcid_raises_if_no_author_is_found(inspire_app):
    with pytest.raises(NoResultFound):
        get_literature_recids_for_orcid("THIS-ORCID-DOES-NOT-EXIST")


def test_get_literature_recids_for_orcid_raises_if_two_authors_are_found(
    inspire_app, datadir
):
    create_record("aut", data={"control_number": 994473})
    data = orjson.loads((datadir / "1061000.json").read_text())
    create_record("aut", data=data)
    record = InspireRecord.get_record_by_pid_value(1061000, pid_type="aut")
    record["control_number"] = 1061001

    with pytest.raises(PIDAlreadyExists):
        record = InspireRecord.create_or_update(record)


def test_get_literature_recids_for_orcid_still_works_if_author_has_no_ids(
    inspire_app, datadir
):
    create_record("aut", data={"control_number": 994473})
    data = orjson.loads((datadir / "1061000.json").read_text())
    create_record("aut", data=data)
    record = InspireRecord.get_record_by_pid_value(1061000, pid_type="aut")
    del record["ids"]
    record = InspireRecord.create_or_update(record)

    with pytest.raises(NoResultFound):
        get_literature_recids_for_orcid("0000-0003-4792-9178")


def test_get_literature_recids_for_orcid_still_works_if_author_has_no_orcid_id(
    inspire_app, datadir
):
    create_record("aut", data={"control_number": 994473})
    data = orjson.loads((datadir / "1061000.json").read_text())
    create_record("aut", data=data)
    record = InspireRecord.get_record_by_pid_value(1061000, pid_type="aut")
    record["ids"] = [{"schema": "INSPIRE BAI", "value": "Maurizio.Martinelli.1"}]
    record = InspireRecord.create_or_update(record)

    with pytest.raises(NoResultFound):
        get_literature_recids_for_orcid("0000-0003-4792-9178")


@shared_task(bind=True)
def get_full_name_test_task(
    self,
    first_name,
    last_name,
    nick_name="",
    fail_until_retry_num=0,
    sleep_time=0,
    sleep_until_retry_num=0,
    original_exc=True,
):
    try:
        # Simulate an exception during the first execution.
        if fail_until_retry_num and self.request.retries < fail_until_retry_num:
            raise AttributeError
        if sleep_time:
            if not sleep_until_retry_num:
                time.sleep(sleep_time)
            if sleep_until_retry_num and self.request.retries < sleep_until_retry_num:
                time.sleep(sleep_time)
    except AttributeError as exc:
        exception = exc
        if not original_exc:
            exception = None
        raise self.retry(max_retries=3, countdown=5, exc=exception)
    return "{} {} {}".format(first_name, nick_name, last_name)


def test_orcid_is_updated_if_was_moved(inspire_app, user_remote_account):
    old_orcid = user_remote_account.remote_account.extra_data["orcid"]
    data = {
        "$schema": "http://localhost:5000/schemas/records/authors.json",
        "_collections": ["Authors"],
        "control_number": 123456789,
        "ids": [
            {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
            {"schema": "ORCID", "value": old_orcid},
        ],
        "name": {"value": "Smith, John"},
    }
    rec = create_record("aut", data=data)
    db.session.commit()
    new_orcid = "0000-0003-4792-9178"
    update_moved_orcid(old_orcid, new_orcid)
    author_record = InspireRecord.get_record_by_pid_value(rec["control_number"], "aut")
    assert new_orcid in get_values_for_schema(author_record.get("ids", []), "ORCID")


def test_orcid_is_not_updated_if_was_moved_but_already_in_ids(
    inspire_app, user_remote_account
):
    old_orcid = user_remote_account.remote_account.extra_data["orcid"]
    new_orcid = "0000-0002-1825-0097"
    data = {
        "$schema": "http://localhost:5000/schemas/records/authors.json",
        "_collections": ["Authors"],
        "control_number": 123456789,
        "ids": [
            {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
            {"schema": "ORCID", "value": new_orcid},
            {"schema": "ORCID", "value": old_orcid},
        ],
        "name": {"value": "Smith, John"},
    }
    rec = create_record("aut", data=data)
    db.session.commit()
    update_moved_orcid(old_orcid, new_orcid)
    author_record = InspireRecord.get_record_by_pid_value(rec["control_number"], "aut")
    assert data["ids"] == author_record.get("ids", [])


def test_push_access_token_is_removed_when_orcid_is_moved(
    inspire_app, override_config, user_remote_account
):
    orcid = user_remote_account.remote_account.extra_data["orcid"]
    data = {
        "ids": [
            {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
            {"schema": "ORCID", "value": orcid},
        ]
    }
    create_record("aut", data=data)
    new_orcid = "0000-0002-1825-0097"
    with override_config(MAIL_SUPPRESS_SEND=False):
        update_moved_orcid(orcid, new_orcid)
    assert not get_access_tokens([orcid])
    assert user_remote_account.remote_account.extra_data["orcid"] == new_orcid
    assert not user_remote_account.remote_account.extra_data["allow_push"]


@patch("inspirehep.orcid.utils.send_orcid_push_disabled_email")
def test_email_is_sent_when_orcid_is_moved(
    mock_send_email, inspire_app, user_remote_account
):
    orcid = user_remote_account.remote_account.extra_data["orcid"]
    data = {
        "ids": [
            {"schema": "INSPIRE BAI", "value": "J.Smith.1"},
            {"schema": "ORCID", "value": "0000-0003-4792-9178"},
        ]
    }
    create_record("aut", data=data)
    new_orcid = "0000-0002-1825-0097"
    update_moved_orcid(orcid, new_orcid)
    assert mock_send_email.call_count == 1
    assert mock_send_email.mock_calls[0][1] == (
        "test-user@cern.ch",
        "0000-0003-4792-9178",
    )
