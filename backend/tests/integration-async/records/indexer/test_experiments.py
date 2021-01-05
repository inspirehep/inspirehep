# -*- coding: utf-8 -*-
#
# Copyright (C) 2020-2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from helpers.utils import es_search, retry_until_matched, retry_until_pass
from invenio_db import db
from invenio_search import current_search

from inspirehep.records.api import ConferencesRecord, LiteratureRecord
from inspirehep.records.api.experiments import ExperimentsRecord
from inspirehep.search.api import ExperimentsSearch


def test_experiment_record_updates_in_es_when_lit_rec_refers_to_it(
    inspire_app, celery_app_with_context, celery_session_worker
):
    experiment_1 = ExperimentsRecord.create(faker.record("exp"))
    experiment_1_control_number = experiment_1["control_number"]
    ref_1 = f"http://localhost:8000/api/experiments/{experiment_1_control_number}"
    db.session.commit()
    expected_number_of_papers = 0
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-experiments"]},
        {
            "step": es_search,
            "args": ["records-experiments"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
        {
            "step": es_search,
            "args": ["records-experiments"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_papers",
                "expected_result": expected_number_of_papers,
            },
        },
    ]
    retry_until_matched(steps)

    data = {
        "accelerator_experiments": [{"legacy_name": "LIGO", "record": {"$ref": ref_1}}]
    }

    LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()
    expected_number_of_papers = 1
    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-experiments"]},
        {
            "step": es_search,
            "args": ["records-experiments"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.number_of_papers",
                "expected_result": expected_number_of_papers,
            },
        },
    ]

    retry_until_matched(steps)


def test_indexer_deletes_record_from_es(inspire_app, datadir):
    def assert_record_is_deleted_from_es():
        current_search.flush_and_refresh("records-experiments")
        expected_records_count = 0
        record_lit_es = ExperimentsSearch().get_record(str(record.id)).execute().hits
        assert expected_records_count == len(record_lit_es)

    record = ExperimentsRecord.create(faker.record("exp"))
    db.session.commit()

    record.delete()
    db.session.commit()

    retry_until_pass(assert_record_is_deleted_from_es)
