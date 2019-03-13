# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import time

from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search_client as es

from inspirehep.records.api import LiteratureRecord, index_after_commit


def test_lit_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    rec.commit()
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
    rec.commit()
    db.session.commit()
    expected_title = "Updated title"
    rec["titles"][0]["title"] = expected_title
    rec.commit()
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
    rec.commit()
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
    rec.commit()
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
    rec.commit()
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
    app, celery_app_with_context, celery_session_worker
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    citations = [rec["control_number"]]
    data_2 = faker.record("lit", citations=citations)
    LiteratureRecord.create(data_2)
    db.session.commit()
    time.sleep(5)
    es.indices.refresh("records-hep")
    es.search("records-hep")["hits"]

    #  Todo: Add check for `process_references_for_record`
    #   when there will be citation_count implemented
    #   because now there is nothing to check...
