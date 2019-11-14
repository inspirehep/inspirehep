# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search_client as es

from inspirehep.records.api import ConferencesRecord, LiteratureRecord
from inspirehep.records.marshmallow.conferences.common.proceeding_info_item import (
    ProceedingInfoItemSchemaV1,
)


def test_conference_record_updates_in_es_when_lit_rec_reffers_to_it(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"
    db.session.commit()

    steps = [
        {"step": es.indices.refresh, "args": ["records-conferences"]},
        {
            "step": es.search,
            "args": ["records-conferences"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 1},
        },
    ]
    response = retry_until_matched(steps)
    expected_contributions_count = 0
    assert (
        response["hits"]["hits"][0]["_source"]["number_of_contributions"]
        == expected_contributions_count
    )

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }
    record = LiteratureRecord.create(faker.record("lit", data))

    data = {
        "publication_info": [
            {"conference_record": {"$ref": ref_1}, "journal_title": "nice title"}
        ],
        "document_type": ["proceedings"],
    }
    record2 = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    steps = [
        {"step": es.indices.refresh, "args": ["records-conferences"]},
        {
            "step": es.search,
            "args": ["records-conferences"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_contributions",
                "expected_result": 1,
            },
        },
    ]

    retry_until_matched(steps)

    expected_proceedings = [ProceedingInfoItemSchemaV1().dump(record2).data]

    steps = [
        {"step": es.indices.refresh, "args": ["records-conferences"]},
        {
            "step": es.search,
            "args": ["records-conferences"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.proceedings",
                "expected_result": expected_proceedings,
            },
        },
    ]

    retry_until_matched(steps)
