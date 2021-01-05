# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from helpers.providers.faker import faker
from invenio_db import db
from sqlalchemy.orm.exc import StaleDataError

from inspirehep.indexer.utils import get_record
from inspirehep.records.api import LiteratureRecord


def test_get_record_default_returns_latest(inspire_app):
    expected_titles = [{"title": "Second Title"}]

    record = LiteratureRecord.create(
        data=faker.record("lit", data={"titles": [{"title": "First Title"}]})
    )
    db.session.commit()
    data = dict(record)
    data["titles"][0]["title"] = "Second Title"
    record.update(data)
    db.session.commit()
    latest_record = get_record(record.id)
    assert latest_record["titles"] == expected_titles


def test_get_record_raise_stale_data(inspire_app):
    record = LiteratureRecord.create(data=faker.record("lit"))
    db.session.commit()
    non_existing_version = record.model.version_id + 1

    with pytest.raises(StaleDataError):
        get_record(record.id, non_existing_version)


def test_get_record_specific_version(inspire_app):
    expected_titles = [{"title": "First Title"}]

    record = LiteratureRecord.create(
        data=faker.record("lit", data={"titles": [{"title": "First Title"}]})
    )
    db.session.commit()
    old_version_id = record.model.version_id

    data = dict(record)
    data["titles"][0]["title"] = "Second Title"
    record.update(data)
    db.session.commit()
    latest_record = get_record(record.id, old_version_id)
    assert latest_record["titles"] == expected_titles
