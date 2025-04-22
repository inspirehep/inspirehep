#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import orjson
from flask import current_app
from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from helpers.utils import create_user, retry_test
from inspire_utils.record import get_values_for_schema
from inspirehep.disambiguation.tasks import disambiguate_authors
from inspirehep.editor.editor_soft_lock import EditorSoftLock
from inspirehep.records.api import AuthorsRecord, InspireRecord
from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import AuthorsSearch, InspireSearch
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from redis import StrictRedis
from tenacity import stop_after_delay, wait_fixed


def test_disambiguation_runs_after_record_creation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Gross, Brian"},
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert (
            str(author_data["control_number"])
            in literature_record_from_es["authors"][0]["record"]["$ref"]
        )

    assert_disambiguation_task()


def test_disambiguate_many_authors_runs_after_record_creation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_1 = faker.record("aut", with_control_number=True)
    author_1.update(
        {
            "name": {"value": "Gross, Brian"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_2 = faker.record("aut", with_control_number=True)
    author_2.update(
        {
            "name": {"value": "Matthews, Donald"},
            "email_addresses": [
                {"current": True, "value": "test1@test.pl"},
                {"current": True, "value": "test1.1@test.pl"},
            ],
        }
    )

    author_record_1 = InspireRecord.create(author_1)
    author_record_2 = InspireRecord.create(author_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_1_from_es = InspireSearch.get_record_data_from_es(author_record_1)
        author_record_2_from_es = InspireSearch.get_record_data_from_es(author_record_2)
        assert author_record_1_from_es
        assert author_record_2_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "ids": [
                        {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
                    ],
                    "emails": ["test@test.com"],
                },
                {
                    "full_name": "Matthews, Donald",
                    "emails": ["test1@test.pl", "test1.1@test.pl"],
                },
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        literature_record_from_es_authors = literature_record_from_es.get("authors")
        assert (
            str(author_1["control_number"])
            in literature_record_from_es_authors[0]["record"]["$ref"]
        )
        assert (
            str(author_2["control_number"])
            in literature_record_from_es_authors[1]["record"]["$ref"]
        )

    assert_disambiguation_task()


def test_disambiguate_authors_doesnt_match_when_author_is_ambiguous(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_1 = faker.record("aut", with_control_number=True)
    author_1.update(
        {
            "name": {"value": "Gross, Brian"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
            "control_number": 90_676_330,
        }
    )
    author_2 = faker.record("aut", with_control_number=True)
    author_2.update(
        {
            "name": {"value": "Gross, Brian"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00300003"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
            "control_number": 90_676_331,
        }
    )

    author_record_1 = InspireRecord.create(author_1)
    author_record_2 = InspireRecord.create(author_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record_1)
        author_2_from_es = InspireSearch.get_record_data_from_es(author_record_2)
        assert author_record_from_es
        assert author_2_from_es

    assert_authors_records_exist_in_es()

    authors = [{"full_name": "Gross, Brian", "emails": ["test@test.com"]}]

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update({"authors": authors})
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        # new author is created
        assert (
            literature_record_from_es["authors"][0].get("record")
            != "http://localhost:5000/api/authors/90676330"
        )
        assert (
            literature_record_from_es["authors"][0].get("record")
            != "http://localhost:5000/api/authors/90676331"
        )

    assert_disambiguation_task()


def test_disambiguation_doesnt_run_with_feature_flag_disabling_it(
    inspire_app, clean_celery_session
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Gross, Brian"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert not literature_record_from_es["authors"][0].get("record")

    assert_disambiguation_task()


def test_disambiguation_runs_after_lit_record_update(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Gross, Brian"},
            "email_addresses": [{"current": True, "value": "test@uw.edu.pl"}],
        }
    )
    author_record = InspireRecord.create(author_data)

    author_data_2 = faker.record("aut", with_control_number=True)
    author_data_2.update(
        {
            "name": {"value": "Test Author"},
            "email_addresses": [{"current": True, "value": "test123@uw.edu.pl"}],
        }
    )
    author_record_2 = InspireRecord.create(author_data_2)
    author_data_3 = faker.record("aut", with_control_number=True)
    author_data_3.update(
        {
            "name": {"value": "Another Author"},
            "email_addresses": [
                {"current": True, "value": "testxx@uw.edu.pl"},
                {"current": True, "hidden": True, "value": "testxx@fuw.edu.pl"},
            ],
        }
    )
    author_record_3 = InspireRecord.create(author_data_3)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        author_2_from_es = InspireSearch.get_record_data_from_es(author_record_2)
        author_3_from_es = InspireSearch.get_record_data_from_es(author_record_3)
        assert author_record_from_es
        assert author_2_from_es
        assert author_3_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "emails": ["test@uw.edu.pl"],
                    "uuid": "798d9afe-d3c2-479e-b384-f0aee2573076",
                }
            ],
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    literature_record_uuid = literature_record.id
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_disambiguation_on_update():
        db.session.close()
        literature_record = LiteratureRecord.get_record(literature_record_uuid)
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert literature_record["authors"][0]["record"]["$ref"]
        assert literature_record_from_es["authors"][0]["record"]["$ref"]

    assert_disambiguation_on_update()

    literature_record = LiteratureRecord.get_record(literature_record_uuid)
    literature_record["authors"].append(
        {"full_name": "Test Author", "emails": ["test123@uw.edu.pl"]}
    )
    literature_record.update(dict(literature_record))
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_disambiguation_on_update():
        db.session.close()
        literature_record = LiteratureRecord.get_record(literature_record_uuid)
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert literature_record["authors"][0]["record"]["$ref"]
        assert literature_record["authors"][1]["record"]["$ref"]
        assert literature_record_from_es["authors"][0]["record"]["$ref"]
        assert literature_record_from_es["authors"][1]["record"]["$ref"]

    assert_disambiguation_on_update()


def test_disambiguate_authors_on_first_and_last_name(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerardus",
                    "record": {"$ref": "http://localhost:5000/api/authors/999108"},
                    "curated_relation": True,
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.1"}],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_1_from_es

    assert_lit_records_exist_in_es()

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update({"authors": [{"full_name": "'t Hooft, Gerardus"}]})
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert (
            literature_record["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    assert_disambiguation_task()


def test_disambiguate_authors_on_first_last_name_and_initials(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "curated_relation": True,
                    "record": {"$ref": "http://localhost:5000/api/authors/999108"},
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard Antonio",
                    "curated_relation": True,
                    "record": {"$ref": "http://localhost:5000/api/authors/999105"},
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es
        assert lit_record_2_from_es

    assert_lit_records_exist_in_es()

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "'t Hooft, Gerard Antonio"}]})
    literature_record_3 = LiteratureRecord.create(literature_data_3)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_data_2["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    assert_disambiguation_task()


def test_disambiguate_authors_on_collaboration(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record(
        "aut",
        with_control_number=True,
        data={
            "name": {"value": "'t Hooft, Gerard"},
            "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.1"}],
        },
    )
    author_record = AuthorsRecord.create(author_data)

    author_data_1 = faker.record(
        "aut",
        with_control_number=True,
        data={
            "name": {"value": "'t Hooft, Gerard"},
            "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.2"}],
        },
    )
    author_record_1 = AuthorsRecord.create(author_data_1)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "curated_relation": True,
                    "record": author_record["self"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update(
        {
            "collaborations": [{"value": "CMS"}],
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "curated_relation": True,
                    "record": author_record_1["self"],
                }
            ],
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es
        assert lit_record_2_from_es

    assert_lit_records_exist_in_es()

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update(
        {
            "collaborations": [{"value": "CMS"}],
            "authors": [{"full_name": "'t Hooft, Gerard"}],
        }
    )
    literature_record_3 = LiteratureRecord.create(literature_data_3)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_data_2["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    assert_disambiguation_task()


def test_disambiguate_authors_on_affiliation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record(
        "aut",
        with_control_number=True,
        data={
            "name": {"value": "'t Hooft, Gerard"},
            "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.2"}],
        },
    )
    author_record = AuthorsRecord.create(author_data)

    author_data_1 = faker.record(
        "aut",
        with_control_number=True,
        data={
            "name": {"value": "'t Hooft, Gerard"},
            "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.1"}],
        },
    )
    author_record_1 = AuthorsRecord.create(author_data_1)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "record": author_record["self"],
                    "curated_relation": True,
                },
                {"full_name": "Kowalski, Brian", "curated_relation": True},
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "record": author_record_1["self"],
                    "affiliations": [
                        {"value": "UC, Berkeley, CfPA"},
                        {"value": "Warsaw U."},
                    ],
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es
        assert lit_record_2_from_es

    assert_lit_records_exist_in_es()

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "affiliations": [
                        {"value": "UC, Berkeley, CfPA"},
                        {"value": "Warsaw U."},
                    ],
                }
            ]
        }
    )
    literature_record_3 = LiteratureRecord.create(literature_data_3)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_data_2["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    assert_disambiguation_task()


def test_disambiguate_authors_create_new_author(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {"full_name": "Michal Kowal", "affiliations": [{"value": "Warsaw U."}]}
            ]
        }
    )
    literature_record = LiteratureRecord.create(data=literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_1_from_es

    assert_lit_records_exist_in_es()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        author_record_from_es = AuthorsSearch().query_from_iq("").execute()
        assert author_record_from_es.hits[0].name["value"] == "Michal Kowal"
        assert (
            literature_record_from_es["authors"][0]["recid"]
            == author_record_from_es.hits[0].control_number
        )

    assert_disambiguation_task()


def test_disambiguate_authors_create_two_author_with_same_name(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {"authors": [{"full_name": "Michal Kowal"}, {"full_name": "Michal Kowal"}]}
    )
    literature_record = LiteratureRecord.create(data=literature_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_lit_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)

        assert lit_record_from_es

    assert_lit_records_exist_in_es()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        author_records_from_es = AuthorsSearch().query_from_iq("").execute()
        assert len(author_records_from_es.hits) == 2

    assert_disambiguation_task()


def test_disambiguation_on_author_record_update(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update({"name": {"value": "Kowal, Michal"}})
    aut_record = AuthorsRecord.create(author_data)

    author_data_1 = faker.record("aut", with_control_number=True)
    author_data_1.update(
        {
            "name": {"value": "Kowal, Michal"},
        }
    )
    aut_record_1 = AuthorsRecord.create(author_data_1)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_author_record_exist_in_es():
        aut_record_from_es = InspireSearch.get_record_data_from_es(aut_record)
        assert aut_record_from_es

    assert_author_record_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Kowal, Michal",
                    "affiliations": [{"value": "Warsaw U."}],
                    "record": aut_record["self"],
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(data=literature_data)

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update(
        {
            "authors": [
                {
                    "full_name": "Kowal, Michal",
                    "record": aut_record_1["self"],
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(data=literature_data_2)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_from_es_2 = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_from_es
        assert lit_record_from_es_2

    assert_authors_records_exist_in_es()

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "Kowal, Michal"}]})
    literature_record_3 = LiteratureRecord.create(data=literature_data_3)
    db.session.commit()

    # TODO: other assertions
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_first_disambiguation_no_match():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )

        assert (
            literature_record_from_es["authors"][0]["record"]
            != literature_record["authors"][0]["record"]
        )
        assert "record" in literature_record_from_es["authors"][0]
        assert (
            literature_record_from_es["authors"][0]["record"]
            != literature_record["authors"][0]["record"]
        )
        assert (
            literature_record_from_es["authors"][0]["record"]
            != literature_record_2["authors"][0]["record"]
        )

    assert_first_disambiguation_no_match()

    db.session.expire_all()
    lit_record = InspireRecord.get_record(literature_record_3.id)
    lit_record["authors"][0]["affiliations"] = [{"value": "Warsaw U."}]
    lit_record.update(dict(lit_record))
    db.session.commit()

    # TODO I'm pretty sure this test is not testing what it should
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_on_record_update():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_record_from_es["authors"][0]["record"]
            != literature_record["authors"][0]["record"]
        )

    assert_disambiguation_on_record_update()


def test_disambiguation_on_record_update_ambiguous_match(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record(
        "aut",
        with_control_number=True,
        data={
            "name": {"value": "Kowal, Michal"},
        },
    )
    author_record = AuthorsRecord.create(author_data)

    author_data_1 = faker.record(
        "aut",
        with_control_number=True,
        data={
            "name": {"value": "Kowal, Michal"},
        },
    )
    author_record_1 = AuthorsRecord.create(author_data_1)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Kowal, Michal",
                    "affiliations": [{"value": "Warsaw U."}],
                    "record": author_record["self"],
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(data=literature_data)

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update(
        {
            "authors": [
                {
                    "full_name": "Kowal, Michal",
                    "record": author_record_1["self"],
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(data=literature_data_2)

    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_from_es_2 = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_from_es
        assert lit_record_from_es_2

    assert_authors_records_exist_in_es()

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "Kowal, Michal"}]})
    literature_record_3 = LiteratureRecord.create(data=literature_data_3)
    db.session.commit()

    # TODO: other assertions
    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_first_disambiguation_no_match():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert literature_record_from_es["authors"][0]["record"]
        assert (
            literature_record_from_es["authors"][0]["record"]
            != literature_record["authors"][0]["record"]
        )
        assert (
            literature_record_from_es["authors"][0]["record"]
            != literature_record_2["authors"][0]["record"]
        )

    assert_first_disambiguation_no_match()


def test_disambiguation_on_record_update_unambiguous_match(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Kowalczyk, Elisabeth",
                    "ids": [{"schema": "INSPIRE BAI", "value": "E.Kowalczyk.1"}],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(data=literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_first_disambiguation_no_match():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )

        assert get_values_for_schema(
            literature_record_from_es["authors"][0]["ids"], "INSPIRE BAI"
        )

    assert_first_disambiguation_no_match()
    old_bai = get_values_for_schema(
        literature_record["authors"][0]["ids"], "INSPIRE BAI"
    )[0]
    db.session.expire_all()
    lit_record = InspireRecord.get_record(literature_record.id)
    lit_record["authors"][0]["emails"] = ["test.test@com"]
    lit_record.update(dict(lit_record))
    db.session.commit()

    # TODO: fix it
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_on_record_update():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert (
            get_values_for_schema(
                literature_record_from_es["authors"][0]["ids"], "INSPIRE BAI"
            )[0]
            == old_bai
        )

    assert_disambiguation_on_record_update()


def test_disambiguation_handle_deleted_records(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Kowalczyk, Elisabeth",
                    "ids": [{"schema": "INSPIRE BAI", "value": "E.Kowalczyk.1"}],
                }
            ],
            "deleted": True,
        }
    )

    literature_record = LiteratureRecord.create(data=literature_data)
    db.session.commit()

    literature_record["authors"][0]["affiliations"] = [{"value": "test"}]
    literature_record.update(dict(literature_record))

    try:
        db.session.commit()
    except Exception as e:
        raise AssertionError() from e


def test_disambiguation_races_assign(
    override_config, inspire_app, clean_celery_session, enable_disambiguation
):
    cataloger = create_user(role="cataloger")
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        author_record_data = faker.record("aut")
        author_record_data.update(
            {
                "name": {"value": "A'Hearn, Michael F."},
            }
        )
        author_record = AuthorsRecord.create(author_record_data)
        lit_data = faker.record("lit")
        lit_data.update(
            {
                "authors": [
                    {
                        "uuid": "ce061c1e-866a-422d-9982-652183bae814",
                        "full_name": "A'Hearn, M.F.",
                        "signature_block": "HARNm",
                        "curated_relation": True,
                        "record": author_record["self"],
                    }
                ]
            }
        )
        lit_record = LiteratureRecord.create(lit_data)
        db.session.commit()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        client.post(
            "/api/assign/literature/unassign",
            data=orjson.dumps(
                {
                    "literature_ids": [
                        lit_record["control_number"],
                    ],
                    "from_author_recid": author_record["control_number"],
                }
            ),
            content_type="application/json",
        )

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
        def assert_disambiguation_on_record_update():
            literature_record_from_es = InspireSearch.get_record_data_from_es(
                lit_record
            )
            assert (
                literature_record_from_es["authors"][0]["record"]
                != author_record["self"]
            )

        assert_disambiguation_on_record_update()


def test_disambiguation_removes_links_to_authors_records_if_record_moved_to_hidden_collection(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Gross, Brian"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    author_data_2 = faker.record("aut", with_control_number=True)
    author_data_2.update(
        {
            "name": {"value": "Author, Test"},
            "ids": [{"schema": "INSPIRE BAI", "value": "T.Author.1"}],
            "email_addresses": [{"current": True, "value": "author@author.com"}],
        }
    )
    author_record_2 = InspireRecord.create(author_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "emails": ["test@test.com"],
                    "curated_relation": True,
                    "record": author_record["self"],
                },
                {
                    "full_name": "Author, Test",
                    "emails": ["test@test.com"],
                    "curated_relation": True,
                    "record": author_record_2["self"],
                },
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_from_es

    assert_authors_records_exist_in_es()

    literature_record["_collections"] = ["HAL Hidden"]
    literature_record.update(dict(literature_record))
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert not literature_record_from_es["authors"][0].get("record")
        assert not literature_record_from_es["authors"][1].get("curated_relation")
        assert not literature_record_from_es["authors"][1].get("record")

    assert_disambiguation_task()


def test_disambiguation_run_for_every_author_when_record_moved_from_private_collection_to_literature(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Gross, Brian"},
            "email_addresses": [{"current": True, "value": "b.gross@cern.ch"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    author_data_2 = faker.record("aut", with_control_number=True)
    author_data_2.update(
        {
            "name": {"value": "Author, Test"},
            "email_addresses": [{"current": True, "value": "author@author.com"}],
        }
    )
    author_record_2 = InspireRecord.create(author_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "_collections": ["HAL Hidden"],
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "emails": ["b.gross@cern.ch"],
                },
                {
                    "full_name": "Author, Test",
                    "emails": ["author@author.com"],
                },
            ],
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_from_es

    assert_authors_records_exist_in_es()

    literature_record["_collections"] = ["Literature"]
    literature_record.update(dict(literature_record))
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert (
            literature_record_from_es["authors"][0].get("record")
            == author_record["self"]
        )
        assert (
            literature_record_from_es["authors"][1].get("record")
            == author_record_2["self"]
        )

    assert_disambiguation_task()


def test_disambiguation_match_when_initials_not_present_in_matched_author(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data_1 = faker.record("lit", with_control_number=True)
    literature_data_1.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                }
            ]
        }
    )
    literature_record_1 = LiteratureRecord.create(literature_data_1)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_1
        )
        assert author_record_from_es

    assert_authors_records_exist_in_es()

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update({"authors": [{"full_name": "Brian V. Gross"}]})
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert (
            literature_record_from_es["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    assert_disambiguation_task()


def test_disambiguation_reorders_name_after_succesfull_disambiguation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_1 = faker.record("aut", with_control_number=True)
    author_1.update(
        {
            "name": {"value": "Gross Davis, Brian"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
                {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )

    author_record_1 = InspireRecord.create(author_1)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_1_from_es = InspireSearch.get_record_data_from_es(author_record_1)
        assert author_record_1_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian Davis",
                    "ids": [
                        {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
                    ],
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        literature_record_from_es_authors = literature_record_from_es.get("authors")
        assert (
            str(author_1["control_number"])
            in literature_record_from_es_authors[0]["record"]["$ref"]
        )

        assert literature_record_from_es_authors[0]["full_name"] == "Davis Gross, Brian"

    assert_disambiguation_task()


def test_author_disambiguation_manually_when_empty_authors(
    inspire_app, clean_celery_session, enable_disambiguation
):
    data = faker.record("lit", with_control_number=True)
    record = LiteratureRecord.create(data)
    record_version = record.model.version_id

    models_committed.disconnect(index_after_commit)
    db.session.commit()
    models_committed.connect(index_after_commit)
    task = disambiguate_authors.delay(record.id, record.model.version_id)

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        assert task.status == "SUCCESS"
        record_after_disambiguation = InspireRecord.get_record(record.id)
        assert record_after_disambiguation.model.version_id == record_version

    assert_disambiguation_task()


@mock.patch.object(EditorSoftLock, "remove_lock")
def test_editor_lock_is_created_when_disambiguation_runs(
    mocked_remove_lock, inspire_app, clean_celery_session
):
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    redis = StrictRedis.from_url(redis_url)
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Gross, Brian"},
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    assert_authors_records_exist_in_es()

    literature_data = faker.record("lit", data={"control_number": 12345})
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    lock = EditorSoftLock(
        recid=literature_record["control_number"],
        record_version=literature_record.model.version_id,
        task_name="inspirehep.disambiguation.tasks.disambiguate_authors",
    )

    def remove_lock_side_effect(*args, **kwargs):
        if remove_lock_side_effect.counter < 1:
            remove_lock_side_effect.counter += 1
            return None
        else:
            return redis.hdel(lock.hash_name, lock.key)

    remove_lock_side_effect.counter = 0
    mocked_remove_lock.side_effect = remove_lock_side_effect

    disambiguate_authors.delay(literature_record.id, literature_record.model.version_id)

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_lock_created():
        lock_found = redis.hget(lock.hash_name, lock.key)
        assert lock_found

    assert_lock_created()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_remove_lock():
        lock.remove_lock()
        lock_found = redis.hget(lock.hash_name, lock.key)
        assert not lock_found

    assert_remove_lock()


def test_disambiguation_deosnt_create_new_stub_author_if_theres_one(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_1 = faker.record("aut", with_control_number=True)
    author_1.update(
        {
            "name": {
                "value": "'t Hooft, Gerard",
            },
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
            ],
        }
    )

    author_record_1 = InspireRecord.create(author_1)

    author_2 = faker.record("aut", with_control_number=True)
    author_2.update(
        {
            "name": {
                "value": "'t Hooft, Gerard",
            },
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304314"},
            ],
            "stub": True,
        }
    )

    author_record_2 = InspireRecord.create(author_2)
    db.session.commit()

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "curated_relation": True,
                    "record": author_record_1["self"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "curated_relation": True,
                    "record": author_record_2["self"],
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es
        assert lit_record_2_from_es

    assert_lit_records_exist_in_es()

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "'t Hooft, Gerard"}]})
    literature_record_3 = LiteratureRecord.create(literature_data_3)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_disambiguation_task():
        authors_from_es = AuthorsSearch().query_from_iq("'t Hooft, Gerard").execute()
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        # no new stub authors created
        assert len(authors_from_es) == 2
        assert (
            literature_record_from_es["authors"][0]["record"] == author_record_2["self"]
        )

    assert_disambiguation_task()
