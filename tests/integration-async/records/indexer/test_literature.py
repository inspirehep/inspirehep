# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import time

from flask_sqlalchemy import models_committed
from helpers.factories.models.user_access_token import AccessTokenFactory
from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search_client as es

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch


def test_lit_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    response = retry_until_matched(steps)

    assert response["hits"]["hits"][0]["_id"] == str(rec.id)
    assert response["hits"]["hits"][0]["_source"]["_ui_display"] is not None


def test_lit_record_update_when_changed(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    data["titles"] = [{"title": "Original title"}]
    rec = LiteratureRecord.create(data)
    db.session.commit()
    expected_title = "Updated title"
    data["titles"][0]["title"] = expected_title
    rec.update(data)
    db.session.commit()

    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    resp = retry_until_matched(steps)
    assert resp["hits"]["hits"][0]["_source"]["titles"][0]["title"] == expected_title


def test_lit_record_removed_form_es_when_deleted(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)
    rec.delete()
    db.session.commit()
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 0},
        },
    ]
    retry_until_matched(steps)


def test_index_record_manually(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    models_committed.disconnect(index_after_commit)
    db.session.commit()
    models_committed.connect(index_after_commit)
    es.indices.refresh("records-hep")
    result = es.search("records-hep")
    assert result["hits"]["total"] == 0

    rec.index()
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)


def test_lit_records_with_citations_updates(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    citations = [rec["control_number"]]
    data_2 = faker.record("lit", literature_citations=citations)
    LiteratureRecord.create(data_2)
    db.session.commit()
    time.sleep(5)

    es.indices.refresh("records-hep")

    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [rec],
            "expected_result": {"expected_key": "citation_count", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)


def test_lit_record_updates_references_when_record_is_updated(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record("lit", literature_citations=citations)
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()
    time.sleep(5)

    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [cited_record],
            "expected_result": {"expected_key": "citation_count", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)

    data_citing_record.update({"deleted": True})
    citing_record.update(data_citing_record)
    db.session.commit()
    time.sleep(5)

    es.indices.refresh("records-hep")

    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [cited_record],
            "expected_result": {"expected_key": "citation_count", "expected_result": 0},
        },
    ]
    retry_until_matched(steps)


def test_many_records_in_one_commit(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    for x in range(10):
        data = faker.record("lit")
        rec = LiteratureRecord.create(data)
    db.session.commit()
    es.indices.refresh("records-hep")
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 10},
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
    data = faker.record("lit")
    token = AccessTokenFactory()
    db.session.commit()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = app.test_client().post(
        f"literature", json=data, headers=headers, content_type=content_type
    )
    assert response.status_code == 201

    es.indices.refresh("records-hep")
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)
