# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import time

import orjson
from helpers.providers.faker import faker
from helpers.utils import es_search, retry_until_pass
from inspire_utils.record import get_value
from invenio_db import db
from invenio_search import current_search

from inspirehep.records.api import ConferencesRecord, LiteratureRecord
from inspirehep.records.marshmallow.conferences.common.proceeding_info_item import (
    ProceedingInfoItemSchemaV1,
)
from inspirehep.search.api import ConferencesSearch


def test_conference_record_updates_in_es_when_lit_rec_refers_to_it(
    inspire_app, clean_celery_session
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"
    db.session.commit()
    expected_contributions_count = 0

    def assert_record():
        current_search.flush_and_refresh("records-conferences")
        record_from_es = ConferencesSearch().get_record_data_from_es(conference_1)
        assert expected_contributions_count == record_from_es["number_of_contributions"]

    retry_until_pass(assert_record)

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

    def assert_record():
        current_search.flush_and_refresh("records-conferences")
        record_from_es = ConferencesSearch().get_record_data_from_es(conference_1)
        assert expected_contributions_count == record_from_es["number_of_contributions"]

    retry_until_pass(assert_record)

    expected_proceedings = [ProceedingInfoItemSchemaV1().dump(record2).data]

    def assert_record():
        current_search.flush_and_refresh("records-conferences")
        record_from_es = ConferencesSearch().get_record_data_from_es(conference_1)
        assert expected_proceedings == record_from_es["proceedings"]

    retry_until_pass(assert_record)


def test_indexer_updates_conference_papers_when_name_changes(
    inspire_app, clean_celery_session
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

    LiteratureRecord.create(conference_paper_data)
    db.session.commit()

    def assert_literature_has_correct_conference_title():
        current_search.flush_and_refresh("*")
        result = es_search("records-hep")
        total = get_value(result, "hits.total.value")

        assert total == 1

        literature = get_value(result, "hits.hits[0]._source")
        ui_display = orjson.loads(literature["_ui_display"])
        assert conference["titles"] == get_value(
            ui_display, "conference_info[0].titles"
        )

    retry_until_pass(assert_literature_has_correct_conference_title, timeout=45)

    data = dict(conference)
    data["titles"] = [{"title": "Updated Title"}]
    conference.update(data)
    db.session.commit()

    retry_until_pass(assert_literature_has_correct_conference_title, timeout=45)


def test_indexer_deletes_record_from_es(inspire_app, datadir):
    def assert_record_is_deleted_from_es():
        current_search.flush_and_refresh("records-conferences")
        expected_records_count = 0
        record_lit_es = ConferencesSearch().get_record(str(record.id)).execute().hits
        assert expected_records_count == len(record_lit_es)

    record = ConferencesRecord.create(faker.record("con"))
    db.session.commit()

    record.delete()
    db.session.commit()

    retry_until_pass(assert_record_is_deleted_from_es)
