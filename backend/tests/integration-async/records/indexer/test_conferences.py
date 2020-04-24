# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from helpers.utils import es_search, retry_until_matched
from invenio_db import db
from invenio_search import current_search
from invenio_search import current_search_client as es

from inspirehep.records.api import ConferencesRecord, LiteratureRecord
from inspirehep.records.marshmallow.conferences.common.proceeding_info_item import (
    ProceedingInfoItemSchemaV1,
)


def test_conference_record_updates_in_es_when_lit_rec_reffers_to_it(
    inspire_app, celery_app_with_context, celery_session_worker
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"
    db.session.commit()
    expected_contributions_count = 0
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-conferences"]},
        {
            "step": es_search,
            "args": ["records-conferences"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
        {
            "step": es_search,
            "args": ["records-conferences"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_contributions",
                "expected_result": expected_contributions_count,
            },
        },
    ]
    retry_until_matched(steps)

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }
    LiteratureRecord.create(faker.record("lit", data))

    data = {
        "publication_info": [
            {"conference_record": {"$ref": ref_1}, "journal_title": "nice title"}
        ],
        "document_type": ["proceedings"],
    }
    record2 = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()
    expected_contributions_count = 1
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-conferences"]},
        {
            "step": es_search,
            "args": ["records-conferences"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_contributions",
                "expected_result": expected_contributions_count,
            },
        },
    ]

    retry_until_matched(steps)

    expected_proceedings = [ProceedingInfoItemSchemaV1().dump(record2).data]

    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-conferences"]},
        {
            "step": es_search,
            "args": ["records-conferences"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.proceedings",
                "expected_result": expected_proceedings,
            },
        },
    ]

    retry_until_matched(steps)
