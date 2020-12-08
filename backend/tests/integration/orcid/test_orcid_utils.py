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
from helpers.utils import create_record
from inspire_dojson.utils import get_record_ref
from inspire_schemas.api import validate
from invenio_pidstore.errors import PIDAlreadyExists
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.orcid.utils import get_literature_recids_for_orcid, get_orcids_for_push
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


def test_get_literature_recids_for_orcid(inspire_app, datadir):
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
    data = orjson.loads((datadir / "1061000.json").read_text())
    create_record("aut", data=data)
    record = InspireRecord.get_record_by_pid_value(1061000, pid_type="aut")
    record["control_number"] = 1061001

    with pytest.raises(PIDAlreadyExists):
        record = InspireRecord.create_or_update(record)


def test_get_literature_recids_for_orcid_still_works_if_author_has_no_ids(
    inspire_app, datadir
):
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
