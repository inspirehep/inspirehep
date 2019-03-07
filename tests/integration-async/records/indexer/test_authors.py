# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import time

from inspirehep.records.api import AuthorsRecord
from helpers.providers.faker import faker
from invenio_search import current_search_client as es
from invenio_db import db


def test_aut_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    rec.commit()
    db.session.commit()
    steps = [
        {"step": es.indices.refresh, "args": ["records-authors"]},
        {
            "step": es.search,
            "args": ["records-authors"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    response = retry_until_matched(steps)

    assert response["hits"]["hits"][0]["_id"] == str(rec.id)


def test_aut_record_update_when_changed(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    rec.commit()
    db.session.commit()
    expected_death_date = "1900-01-01"
    rec["death_date"] = expected_death_date
    rec.commit()
    db.session.commit()

    steps = [
        {"step": es.indices.refresh, "args": ["records-authors"]},
        {
            "step": es.search,
            "args": ["records-authors"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    resp = retry_until_matched(steps)['hits']['hits']
    assert resp[0]["_source"]["death_date"] == expected_death_date


def test_aut_record_removed_form_es_when_deleted(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    rec.commit()
    db.session.commit()
    steps = [
        {"step": es.indices.refresh, "args": ["records-authors"]},
        {
            "step": es.search,
            "args": ["records-authors"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)
    rec.delete()
    rec.commit()
    db.session.commit()
    steps = [
        {"step": es.indices.refresh, "args": ["records-authors"]},
        {
            "step": es.search,
            "args": ["records-authors"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 0},
        },
    ]
    retry_until_matched(steps)
