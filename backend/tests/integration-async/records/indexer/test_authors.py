# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import time

from helpers.factories.models.user_access_token import AccessTokenFactory
from helpers.providers.faker import faker
from helpers.utils import es_search
from invenio_db import db
from invenio_search import current_search
from invenio_search import current_search_client as es

from inspirehep.records.api import AuthorsRecord, LiteratureRecord


def test_aut_record_appear_in_es_when_created(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    db.session.commit()
    expected_id = str(rec.id)
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-authors"]},
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.hits[0]._id",
                "expected_result": expected_id,
            },
        },
    ]
    retry_until_matched(steps)


def test_aut_record_update_when_changed(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    db.session.commit()
    expected_death_date = "1900-01-01"
    data["death_date"] = expected_death_date
    data["control_number"] = rec["control_number"]
    rec.update(data)
    db.session.commit()

    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-authors"]},
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.death_date",
                "expected_result": expected_death_date,
            },
        },
    ]
    retry_until_matched(steps)["hits"]["hits"]


def test_aut_record_removed_form_es_when_deleted(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    db.session.commit()
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-authors"]},
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
    ]
    retry_until_matched(steps)
    rec.delete()
    db.session.commit()
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-authors"]},
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 0,
            },
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

    current_search.flush_and_refresh("records-authors")
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-authors"]},
        {
            "step": es_search,
            "args": ["records-authors"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
    ]
    retry_until_matched(steps)


def test_indexer_updates_authors_papers_when_name_changes(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    author_data = faker.record("aut")
    author = AuthorsRecord.create(author_data)
    db.session.commit()
    current_search.flush_and_refresh("records-authors")
    author_cn = author["control_number"]

    lit_data = {
        "authors": [
            {
                "record": {
                    "$ref": f"https://labs.inspirehep.net/api/authors/{author_cn}"
                },
                "full_name": author["name"]["value"],
            }
        ]
    }
    lit_data = faker.record("lit", data=lit_data)

    lit_1 = LiteratureRecord.create(lit_data)
    db.session.commit()

    expected_hits = 1
    expected_facet_author_name_count = 1
    expected_facet_author_name = f"{author['control_number']}_{author['name']['value']}"
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["*"]},
        {
            "step": es_search,
            "args": ["records-hep"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": expected_hits,
            },
        },
        {
            "expected_key": "hits.hits[0]._source.facet_author_name[0]",
            "expected_result": expected_facet_author_name,
        },
    ]
    results = retry_until_matched(steps)

    assert (
        len(results["hits"]["hits"][0]["_source"]["facet_author_name"])
        == expected_facet_author_name_count
    )

    data = dict(author)
    data["name"]["value"] = "Some other name"
    author.update(data)
    db.session.commit()

    expected_facet_author_name = f"{author['control_number']}_Some other name"

    steps = [
        {"step": current_search.flush_and_refresh, "args": ["*"]},
        {
            "step": es_search,
            "args": ["records-hep"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": expected_hits,
            },
        },
        {
            "expected_key": "hits.hits[0]._source.facet_author_name[0]",
            "expected_result": expected_facet_author_name,
        },
    ]
    results = retry_until_matched(steps)

    assert (
        len(results["hits"]["hits"][0]["_source"]["facet_author_name"])
        == expected_facet_author_name_count
    )
