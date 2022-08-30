# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.factories.models.user_access_token import AccessTokenFactory
from helpers.providers.faker import faker
from helpers.utils import es_search, retry_until_pass
from inspire_utils.record import get_value
from invenio_db import db
from invenio_search import current_search

from inspirehep.records.api import AuthorsRecord, LiteratureRecord
from inspirehep.search.api import AuthorsSearch, LiteratureSearch


def test_aut_record_appear_in_es_when_created(inspire_app, clean_celery_session):
    data = faker.record("aut")
    record = AuthorsRecord.create(data)
    db.session.commit()

    expected_control_number = record["control_number"]

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        record_from_es = AuthorsSearch().get_record_data_from_es(record)
        assert expected_control_number == record_from_es["control_number"]

    retry_until_pass(assert_record)


def test_aut_record_update_when_changed(inspire_app, clean_celery_session):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    db.session.commit()
    expected_death_date = "1900-01-01"
    data["death_date"] = expected_death_date
    data["control_number"] = rec["control_number"]
    rec.update(data)
    db.session.commit()

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        record_from_es = AuthorsSearch().get_record_data_from_es(rec)
        assert expected_death_date == record_from_es["death_date"]

    retry_until_pass(assert_record)


def test_aut_record_removed_form_es_when_deleted(inspire_app, clean_celery_session):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)
    db.session.commit()

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        result = es_search("records-authors")
        result_total = get_value(result, "hits.total.value")
        expected_total = 1
        assert expected_total == result_total

    retry_until_pass(assert_record)

    rec.delete()
    db.session.commit()

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        result = es_search("records-authors")
        result_total = get_value(result, "hits.total.value")
        expected_total = 0
        assert expected_total == result_total

    retry_until_pass(assert_record)


def test_record_created_through_api_is_indexed(inspire_app, clean_celery_session):
    data = faker.record("aut")
    token = AccessTokenFactory()
    db.session.commit()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = inspire_app.test_client().post(
        "/api/authors", json=data, headers=headers, content_type=content_type
    )
    assert response.status_code == 201

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        result = es_search("records-authors")
        result_total = get_value(result, "hits.total.value")
        expected_total = 1
        assert expected_total == result_total

    retry_until_pass(assert_record)


def test_indexer_updates_authors_papers_when_name_changes(
    inspire_app, clean_celery_session
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

    expected_facet_author_name = f"{author['control_number']}_{author['name']['value']}"

    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(lit_1)
        assert expected_facet_author_name == record_from_es["facet_author_name"][0]

    retry_until_pass(assert_record)

    data = dict(author)
    data["name"]["value"] = "Some other name"
    author.update(data)
    db.session.commit()

    expected_facet_author_name = f"{author['control_number']}_Some other name"

    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(lit_1)
        assert expected_facet_author_name == record_from_es["facet_author_name"][0]

    retry_until_pass(assert_record)


def test_regression_get_linked_author_records_uuids_if_author_changed_name_does_not_return_none_for_author_which_name_didnt_change(
    app, clean_celery_session
):
    author_data = faker.record("aut")
    author = AuthorsRecord.create(author_data)
    db.session.commit()
    data = dict(author)
    data["birth_date"] = "1950-01-01"
    author.update(data)
    db.session.commit()
    new_author = AuthorsRecord.get_record_by_pid_value(author["control_number"])
    assert set() == new_author.get_linked_author_records_uuids_if_author_changed_name()


def test_indexer_deletes_record_from_es(inspire_app, datadir):
    def assert_record_is_deleted_from_es():
        current_search.flush_and_refresh("records-authors")
        expected_records_count = 0
        record_lit_es = AuthorsSearch().get_record(str(record.id)).execute().hits
        assert expected_records_count == len(record_lit_es)

    record = AuthorsRecord.create(faker.record("aut"))
    db.session.commit()

    record.delete()
    db.session.commit()

    retry_until_pass(assert_record_is_deleted_from_es)


def test_indexer_updates_advisor_when_student_name_changes(
    inspire_app, clean_celery_session
):
    advisor_data = faker.record("aut")
    advisor = AuthorsRecord.create(advisor_data)
    db.session.commit()
    current_search.flush_and_refresh("records-authors")
    student_data = faker.record(
        "aut",
        data={
            "advisors": [
                {
                    "name": advisor["name"]["value"],
                    "record": advisor["self"],
                    "degree_type": "phd",
                }
            ]
        },
    )
    student = AuthorsRecord.create(student_data)
    db.session.commit()

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        records_from_es = AuthorsSearch().query_from_iq("").execute()
        assert len(records_from_es.hits) == 2

    retry_until_pass(assert_record, 3)

    student["name"]["preferred_name"] = "Test Student"
    student.update(dict(student))
    db.session.commit()

    expected_student_name = "Test Student"

    def assert_record():
        current_search.flush_and_refresh("records-authors")
        record_from_es = AuthorsSearch().get_record_data_from_es(advisor)
        assert record_from_es["students"][0]["name"] == expected_student_name

    retry_until_pass(assert_record, retry_interval=3)
