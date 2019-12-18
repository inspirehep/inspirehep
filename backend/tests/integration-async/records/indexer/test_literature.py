# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from flask_sqlalchemy import models_committed
from helpers.factories.models.user_access_token import AccessTokenFactory
from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search_client as es

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch


@pytest.fixture
def assert_citation_count(retry_until_matched):
    def _assert_citation_count(cited_record, expected_count):
        steps = [
            {"step": es.indices.refresh, "args": ["records-hep"]},
            {
                "step": LiteratureSearch.get_record_data_from_es,
                "args": [cited_record],
                "expected_result": {
                    "expected_key": "citation_count",
                    "expected_result": expected_count,
                },
            },
        ]
        retry_until_matched(steps)

    return _assert_citation_count


@pytest.fixture
def assert_es_hits_count(retry_until_matched):
    def _assert_es_hits_count(expected_hits_count):
        steps = [
            {"step": es.indices.refresh, "args": ["records-hep"]},
            {
                "step": es.search,
                "args": ["records-hep"],
                "expected_result": {
                    "expected_key": "hits.total.value",
                    "expected_result": expected_hits_count,
                },
            },
        ]
        return retry_until_matched(steps)

    return _assert_es_hits_count


def test_lit_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker, assert_es_hits_count
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    response = assert_es_hits_count(1)

    assert response["hits"]["hits"][0]["_id"] == str(rec.id)
    assert response["hits"]["hits"][0]["_source"]["_ui_display"] is not None


def test_lit_record_update_when_changed(
    app, celery_app_with_context, celery_session_worker, assert_es_hits_count
):
    data = faker.record("lit")
    data["titles"] = [{"title": "Original title"}]
    rec = LiteratureRecord.create(data)
    db.session.commit()
    expected_title = "Updated title"
    data["titles"][0]["title"] = expected_title
    rec.update(data)
    db.session.commit()

    resp = assert_es_hits_count(1)
    assert resp["hits"]["hits"][0]["_source"]["titles"][0]["title"] == expected_title


def test_lit_record_removed_form_es_when_deleted(
    app, celery_app_with_context, celery_session_worker, assert_es_hits_count
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    assert_es_hits_count(1)

    rec.delete()
    db.session.commit()

    assert_es_hits_count(0)


def test_lit_record_removed_form_es_when_hard_deleted(
    app, celery_app_with_context, celery_session_worker, assert_es_hits_count
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    assert_es_hits_count(1)

    rec.hard_delete()
    db.session.commit()

    assert_es_hits_count(0)


def test_index_record_manually(
    app, celery_app_with_context, celery_session_worker, assert_es_hits_count
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    models_committed.disconnect(index_after_commit)
    db.session.commit()
    models_committed.connect(index_after_commit)

    assert_es_hits_count(0)

    rec.index()

    assert_es_hits_count(1)


def test_lit_records_with_citations_updates(
    app, celery_app_with_context, celery_session_worker, assert_citation_count
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    assert_citation_count(rec, 0)

    citations = [rec["control_number"]]
    data_2 = faker.record("lit", literature_citations=citations)
    LiteratureRecord.create(data_2)
    db.session.commit()

    assert_citation_count(rec, 1)


def test_lit_record_updates_references_when_record_is_deleted(
    app, celery_app_with_context, celery_session_worker, assert_citation_count
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record("lit", literature_citations=citations)
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 1)

    data_citing_record.update({"deleted": True})
    citing_record.update(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)


def test_lit_record_updates_references_when_reference_is_deleted(
    app, celery_app_with_context, celery_session_worker, assert_citation_count
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record("lit", literature_citations=citations)
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)

    del data_citing_record["references"]
    citing_record.update(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)


def test_lit_record_updates_references_when_reference_is_added(
    app, celery_app_with_context, celery_session_worker, assert_citation_count
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    data_citing_record = faker.record("lit")
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)

    data_citing_record["references"] = [
        {
            "record": {
                "$ref": f"http://localhost:5000/api/literature/{cited_record['control_number']}"
            }
        }
    ]
    citing_record.update(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 1)


def test_lit_record_reindexes_references_when_earliest_date_changed(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record(
        "lit", literature_citations=citations, data={"preprint_date": "2018-06-28"}
    )
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [cited_record],
            "expected_result": {
                "expected_key": "citations_by_year",
                "expected_result": [{"count": 1, "year": 2018}],
            },
        },
    ]
    retry_until_matched(steps)

    data_citing_record["preprint_date"] = "2019-06-28"
    citing_record.update(data_citing_record)
    db.session.commit()

    es.indices.refresh("records-hep")

    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [cited_record],
            "expected_result": {
                "expected_key": "citations_by_year",
                "expected_result": [{"count": 1, "year": 2019}],
            },
        },
    ]
    retry_until_matched(steps)


def test_many_records_in_one_commit(
    app, celery_app_with_context, celery_session_worker, assert_es_hits_count
):
    for x in range(10):
        data = faker.record("lit")
        LiteratureRecord.create(data)
    db.session.commit()
    es.indices.refresh("records-hep")

    assert_es_hits_count(10)


def test_record_created_through_api_is_indexed(
    app,
    celery_app_with_context,
    celery_session_worker,
    retry_until_matched,
    clear_environment,
    assert_es_hits_count,
):
    data = faker.record("lit")
    token = AccessTokenFactory()
    db.session.commit()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = app.test_client().post(
        "/api/literature", json=data, headers=headers, content_type=content_type
    )
    assert response.status_code == 201
    assert_es_hits_count(1)


def test_literature_citations_superseded_status_change_and_cited_records_are_reindexed(
    app, celery_app_with_context, celery_session_worker, assert_citation_count
):
    data = faker.record("lit")
    record_1 = LiteratureRecord.create(data)
    recid_1 = record_1["control_number"]
    db.session.commit()

    # there is no record citing it
    assert_citation_count(record_1, 0)

    citations = [record_1["control_number"]]
    data_2 = faker.record("lit", literature_citations=citations)
    record_2 = LiteratureRecord.create(data_2)
    db.session.commit()

    # record_2 now cites record_1
    assert_citation_count(record_1, 1)

    data_2["related_records"] = [
        {
            "record": {"$ref": f"http://localhost:5000/api/literature/{recid_1}"},
            "relation": "successor",
        }
    ]
    record_2.update({**data_2, **dict(record_2)})
    db.session.commit()

    # record_2 is superseded, it is not counted in the citations anymore
    assert_citation_count(record_1, 0)

    record_2.pop("related_records")
    record_2.update(dict(record_2))
    db.session.commit()

    # record_2 is not superseded anymore, it is counted again in the citations
    assert_citation_count(record_1, 1)
