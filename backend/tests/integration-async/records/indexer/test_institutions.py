# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from helpers.utils import es_search
from invenio_db import db
from invenio_search import current_search

from inspirehep.records.api import ConferencesRecord, LiteratureRecord
from inspirehep.records.api.institutions import InstitutionsRecord
from inspirehep.records.marshmallow.conferences.common.proceeding_info_item import (
    ProceedingInfoItemSchemaV1,
)


def test_institutions_record_updates_in_es_when_lit_rec_refers_to_it(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    institution_1 = InstitutionsRecord.create(faker.record("ins"))
    institution_1_control_number = institution_1["control_number"]
    ref_1 = f"http://localhost:8000/api/institutions/{institution_1_control_number}"
    db.session.commit()
    expected_number_of_papers = 0
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-institutions"]},
        {
            "step": es_search,
            "args": ["records-institutions"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
        {
            "step": es_search,
            "args": ["records-institutions"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_papers",
                "expected_result": expected_number_of_papers,
            },
        },
    ]
    retry_until_matched(steps)

    data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref_1}}],
            }
        ]
    }

    LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()
    expected_number_of_papers = 1
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-institutions"]},
        {
            "step": es_search,
            "args": ["records-institutions"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_papers",
                "expected_result": expected_number_of_papers,
            },
        },
    ]

    retry_until_matched(steps)
