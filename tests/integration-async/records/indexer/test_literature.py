# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import time

from inspirehep.records.api import LiteratureRecord
from helpers.providers.faker import faker
from invenio_search import current_search_client as es
from invenio_db import db
from inspirehep.records.indexer.base import InspireRecordIndexer  # noqa: F401

# TODO Chenge sleep to something less ugly before merging with master


def test_lit_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    rec.commit()
    db.session.commit()
    time.sleep(5)
    es.indices.refresh("records-hep")
    response = es.search("records-hep")["hits"]
    assert response["total"] == 1
    assert response["hits"][0]["_id"] == str(rec.id)
    assert response["hits"][0]["_source"]["_ui_display"] is not None


def test_lit_record_update_when_changed(
    app, celery_app_with_context, celery_session_worker
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
    time.sleep(5)
    es.indices.refresh("records-hep")
    response = es.search("records-hep")["hits"]
    assert response["total"] == 1
    assert response["hits"][0]["_source"]["titles"][0]["title"] == expected_title


def test_lit_record_removed_form_es_when_deleted(
    app, celery_app_with_context, celery_session_worker
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    rec.commit()
    db.session.commit()
    time.sleep(5)
    es.indices.refresh("records-hep")
    response = es.search("records-hep")["hits"]
    assert response["total"] == 0
    rec.delete()
    rec.commit()
    db.session.commit()
    time.sleep(5)
    es.indices.refresh("records-hep")
    response = es.search("records-hep")["hits"]
    assert response["total"] == 0


def test_lit_records_with_citations_updates(
    app, celery_app_with_context, celery_session_worker
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)

    data_2 = faker.record("lit")
