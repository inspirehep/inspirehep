# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import time

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


def test_indexer_updates_conference_papers_when_name_changes(
    inspire_app, celery_app_with_context, celery_session_worker
):
    conference_data = faker.record("con", data={"titles": [{"title": "Initial Title"}]})
    conference = ConferencesRecord.create(conference_data)
    db.session.commit()
    current_search.flush_and_refresh("records-conferences")
    conference_id = conference["control_number"]

    conference_paper_data = faker.record(
        "lit",
        data={
            "document_type": ["conference paper"],
            "publication_info": [
                {
                    "conference_record": {
                        "$ref": f"https://labs.inspirehep.net/api/conferences/{conference_id}"
                    }
                }
            ],
        },
    )

    conference_paper = LiteratureRecord.create(conference_paper_data)
    db.session.commit()

    steps = [
        {"step": current_search.flush_and_refresh, "args": ["*"]},
        {
            "step": es_search,
            "args": ["records-hep"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
    ]
    results = retry_until_matched(steps, timeout=45)
    ui_display = json.loads(results["hits"]["hits"][0]["_source"]["_ui_display"])

    assert conference["titles"] == ui_display["conference_info"][0]["titles"]

    data = dict(conference)
    data["titles"] = [{"title": "Updated Title"}]
    conference.update(data)
    db.session.commit()
    time.sleep(10)
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["*"]},
        {
            "step": es_search,
            "args": ["records-hep"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
    ]
    results = retry_until_matched(steps, timeout=45)
    ui_display = json.loads(results["hits"]["hits"][0]["_source"]["_ui_display"])
    assert conference["titles"] == ui_display["conference_info"][0]["titles"]
