# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.factories.models.user_access_token import AccessTokenFactory
from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search_client as es

from inspirehep.records.api import AuthorsRecord


def test_aut_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
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
    db.session.commit()
    expected_death_date = "1900-01-01"
    data["death_date"] = expected_death_date
    rec.update(data)
    db.session.commit()

    steps = [
        {"step": es.indices.refresh, "args": ["records-authors"]},
        {
            "step": es.search,
            "args": ["records-authors"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    resp = retry_until_matched(steps)["hits"]["hits"]
    assert resp[0]["_source"]["death_date"] == expected_death_date


def test_aut_record_removed_form_es_when_deleted(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
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


def test_record_created_through_api_is_indexed(
    app,
    celery_app_with_context,
    celery_session_worker,
    retry_until_matched,
    clear_environment,
):
    data = faker.record("aut")
    token = AccessTokenFactory()
    db.session.commit()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = app.test_client().post(
        "/api/authors", json=data, headers=headers, content_type=content_type
    )
    assert response.status_code == 201

    es.indices.refresh("records-authors")
    steps = [
        {"step": es.indices.refresh, "args": ["records-authors"]},
        {
            "step": es.search,
            "args": ["records-authors"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)
