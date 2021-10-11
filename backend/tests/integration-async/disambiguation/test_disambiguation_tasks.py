# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.providers.faker import faker
from helpers.utils import create_user, retry_until_pass
from inspire_utils.record import get_values_for_schema
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from invenio_search import current_search

from inspirehep.disambiguation.tasks import disambiguate_signatures
from inspirehep.records.api import AuthorsRecord, InspireRecord
from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.search.api import AuthorsSearch, InspireSearch


def test_signature_linked_by_disambiguation_has_correct_facet_author_name(
    inspire_app, clean_celery_session
):
    data = faker.record("lit")
    data["authors"] = [
        {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
    ]
    record = LiteratureRecord.create(data)
    db.session.commit()
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": record["control_number"],
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [],
        }
    ]
    disambiguate_signatures(clusters)
    author_pids = PersistentIdentifier.query.filter_by(pid_type="aut").all()
    assert len(author_pids) == 1

    pid_value = author_pids[0].pid_value
    author = AuthorsRecord.get_record_by_pid_value(pid_value)
    author_control_number = author.pop("control_number")

    expected_facet_author_name = [f"{author_control_number}_John Doe"]
    expected_record_ref = f"http://localhost:5000/api/authors/{pid_value}"

    def assert_references():
        current_search.flush_and_refresh("records-hep")
        record_from_es = InspireSearch.get_record_data_from_es(record)
        assert expected_facet_author_name == record_from_es["facet_author_name"]
        assert expected_record_ref == record_from_es["authors"][0]["record"]["$ref"]

    retry_until_pass(assert_references, retry_interval=2)


def test_disambiguation_runs_after_record_creation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Brian Gross",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert (
            str(author_data["control_number"])
            in literature_record_from_es["authors"][0]["record"]["$ref"]
        )

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


def test_disambiguate_many_authors_runs_after_record_creation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_1 = faker.record("aut", with_control_number=True)
    author_1.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
                {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_2 = faker.record("aut", with_control_number=True)
    author_2.update(
        {
            "name": {"value": "Donald Matthews"},
            "ids": [{"schema": "INSPIRE BAI", "value": "H.Khalfoun.1"}],
            "email_addresses": [
                {"current": True, "value": "test1@test.pl"},
                {"current": True, "value": "test1.1@test.pl"},
            ],
        }
    )

    author_record_1 = InspireRecord.create(author_1)
    author_record_2 = InspireRecord.create(author_2)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_1_from_es = InspireSearch.get_record_data_from_es(author_record_1)
        author_record_2_from_es = InspireSearch.get_record_data_from_es(author_record_2)
        assert author_record_1_from_es and author_record_2_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Brian Gross",
                    "ids": [
                        {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
                        {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"},
                    ],
                    "emails": ["test@test.com"],
                },
                {
                    "full_name": "Donald Matthews",
                    "ids": [{"schema": "INSPIRE BAI", "value": "H.Khalfoun.1"}],
                    "emails": ["test1@test.pl", "test1.1@test.pl"],
                },
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

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

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


def test_disambiguate_authors_doesnt_match_when_author_is_ambiguous(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_1 = faker.record("aut", with_control_number=True)
    author_1.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
                {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.2"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
            "control_number": 90_676_330,
        }
    )
    author_2 = faker.record("aut", with_control_number=True)
    author_2.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [
                {"schema": "INSPIRE ID", "value": "INSPIRE-00300003"},
                {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"},
            ],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
            "control_number": 90_676_331,
        }
    )

    author_record_1 = InspireRecord.create(author_1)
    author_record_2 = InspireRecord.create(author_2)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record_1)
        author_2_from_es = InspireSearch.get_record_data_from_es(author_record_2)
        assert author_record_from_es
        assert author_2_from_es

    retry_until_pass(assert_authors_records_exist_in_es, retry_interval=2)

    authors = [{"full_name": "Brian Gross", "emails": ["test@test.com"]}]

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update({"authors": authors})
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

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

    retry_until_pass(assert_disambiguation_task, retry_interval=5)


def test_disambiguation_doesnt_run_with_feature_flag_disabling_it(
    inspire_app, clean_celery_session
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Brian Gross",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert not literature_record_from_es["authors"][0].get("record")

    retry_until_pass(assert_disambiguation_task, retry_interval=5)


def test_disambiguation_runs_after_lit_record_update(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut")
    author_data.update(
        {
            "control_number": 1,
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@uw.edu.pl"}],
        }
    )
    author_record = InspireRecord.create(author_data)

    author_data_2 = faker.record("aut")
    author_data_2.update(
        {
            "control_number": 2,
            "name": {"value": "Test Author"},
            "email_addresses": [{"current": True, "value": "test123@uw.edu.pl"}],
        }
    )
    author_record_2 = InspireRecord.create(author_data_2)
    author_data_3 = faker.record("aut")
    author_data_3.update(
        {
            "control_number": 3,
            "name": {"value": "Another Author"},
            "email_addresses": [
                {"current": True, "value": "testxx@uw.edu.pl"},
                {"current": True, "hidden": True, "value": "testxx@fuw.edu.pl"},
            ],
        }
    )
    author_record_3 = InspireRecord.create(author_data_3)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        author_2_from_es = InspireSearch.get_record_data_from_es(author_record_2)
        author_3_from_es = InspireSearch.get_record_data_from_es(author_record_3)
        assert author_record_from_es
        assert author_2_from_es
        assert author_3_from_es

    retry_until_pass(assert_authors_records_exist_in_es, retry_interval=5)

    literature_data = faker.record("lit")
    literature_data.update(
        {
            "control_number": 4,
            "authors": [
                {
                    "full_name": "Brian Gross",
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

    def assert_disambiguation_on_update():
        db.session.close()
        literature_record = LiteratureRecord.get_record(literature_record_uuid)
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert literature_record["authors"][0]["record"]["$ref"]
        assert literature_record_from_es["authors"][0]["record"]["$ref"]

    retry_until_pass(assert_disambiguation_on_update, retry_interval=5)

    literature_record = LiteratureRecord.get_record(literature_record_uuid)
    literature_record["authors"].append(
        {"full_name": "Test Author", "emails": ["test123@uw.edu.pl"]}
    )
    literature_record.update(dict(literature_record))
    db.session.commit()

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

    retry_until_pass(assert_disambiguation_on_update, retry_interval=5)


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

    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_1_from_es

    retry_until_pass(assert_lit_records_exist_in_es, retry_interval=3)

    literature_data_2 = faker.record("lit", with_control_number=True)
    literature_data_2.update({"authors": [{"full_name": "'t Hooft, Gerardus"}]})
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert (
            literature_record["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


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
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.2"}],
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
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.1"}],
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es and lit_record_2_from_es

    retry_until_pass(assert_lit_records_exist_in_es, retry_interval=3)

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "'t Hooft, Gerard Antonio"}]})
    literature_record_3 = LiteratureRecord.create(literature_data_3)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_data_2["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


def test_disambiguate_authors_on_collaboration(
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
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.1"}],
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
                    "record": {"$ref": "http://localhost:5000/api/authors/999101"},
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.2"}],
                }
            ],
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es and lit_record_2_from_es

    retry_until_pass(assert_lit_records_exist_in_es, retry_interval=2)

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update(
        {
            "collaborations": [{"value": "CMS"}],
            "authors": [{"full_name": "'t Hooft, Gerard"}],
        }
    )
    literature_record_3 = LiteratureRecord.create(literature_data_3)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_data_2["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


def test_disambiguate_authors_on_affiliation(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "'t Hooft, Gerard",
                    "record": {"$ref": "http://localhost:5000/api/authors/999108"},
                    "curated_relation": True,
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.2"}],
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
                    "record": {"$ref": "http://localhost:5000/api/authors/999101"},
                    "affiliations": [
                        {"value": "UC, Berkeley, CfPA"},
                        {"value": "Warsaw U."},
                    ],
                    "ids": [{"schema": "INSPIRE BAI", "value": "G.Hooft.1"}],
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(literature_data_2)
    db.session.commit()

    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_2_from_es = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_1_from_es and lit_record_2_from_es

    retry_until_pass(assert_lit_records_exist_in_es, retry_interval=2)

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

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_data_2["authors"][0]["record"]
            == literature_record_from_es["authors"][0]["record"]
        )

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


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

    def assert_lit_records_exist_in_es():
        lit_record_1_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_1_from_es

    retry_until_pass(assert_lit_records_exist_in_es, retry_interval=3)

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

    retry_until_pass(assert_disambiguation_task)


def test_disambiguate_authors_create_two_author_with_same_name(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {"authors": [{"full_name": "Michal Kowal"}, {"full_name": "Michal Kowal"}]}
    )
    literature_record = LiteratureRecord.create(data=literature_data)

    db.session.commit()

    def assert_lit_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)

        assert lit_record_from_es

    retry_until_pass(assert_lit_records_exist_in_es, retry_interval=3)

    def assert_disambiguation_task():
        author_records_from_es = AuthorsSearch().query_from_iq("").execute()
        assert len(author_records_from_es.hits) == 2

    retry_until_pass(assert_disambiguation_task)


def test_disambiguation_assigns_bai_when_author_match_based_on_ids(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Brian Gross",
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert {
            "schema": "INSPIRE BAI",
            "value": "J.M.Maldacena.1",
        } in literature_record_from_es["authors"][0]["ids"]

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


def test_disambiguation_doesnt_assign_bai_when_already_in_author(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Brian Gross",
                    "ids": [{"schema": "INSPIRE BAI", "value": "A.Test.1"}],
                    "emails": ["test@test.com"],
                }
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert {
            "schema": "INSPIRE BAI",
            "value": "J.M.Maldacena.1",
        } in literature_record_from_es["authors"][0]["ids"]

    retry_until_pass(assert_disambiguation_task, retry_interval=2)


def test_disambiguation_on_author_record_update(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Kowal, Michal",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "affiliations": [{"value": "Warsaw U."}],
                    "record": {"$ref": "http://localhost:5000/api/authors/999101"},
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
                    "full_name": "Kowal, Michal Jacek",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.2"}],
                    "record": {"$ref": "http://localhost:5000/api/authors/999102"},
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(data=literature_data_2)

    db.session.commit()

    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_from_es_2 = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_from_es
        assert lit_record_from_es_2

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "Kowal, Michal"}]})
    literature_record_3 = LiteratureRecord.create(data=literature_data_3)
    db.session.commit()

    def assert_first_disambiguation_no_match():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )

        assert get_values_for_schema(
            literature_record_from_es["authors"][0]["ids"], "INSPIRE BAI"
        )
        assert (
            literature_record_from_es["authors"][0]["ids"]
            != literature_record["authors"][0]["ids"]
        )
        assert (
            literature_record_from_es["authors"][0]["ids"]
            != literature_record_2["authors"][0]["ids"]
        )

    retry_until_pass(assert_first_disambiguation_no_match, retry_interval=2)

    db.session.expire_all()
    lit_record = InspireRecord.get_record(literature_record_3.id)
    lit_record["authors"][0]["affiliations"] = [{"value": "Warsaw U."}]
    lit_record.update(dict(lit_record))
    db.session.commit()

    def assert_disambiguation_on_record_update():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_record_from_es["authors"][0]["ids"]
            == literature_record["authors"][0]["ids"]
        )

    retry_until_pass(assert_disambiguation_on_record_update, retry_interval=2)


def test_disambiguation_on_record_update_ambiguous_match(
    inspire_app, clean_celery_session, enable_disambiguation
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Kowal, Michal",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "affiliations": [{"value": "Warsaw U."}],
                    "record": {"$ref": "http://localhost:5000/api/authors/999101"},
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
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.2"}],
                    "record": {"$ref": "http://localhost:5000/api/authors/999102"},
                    "curated_relation": True,
                }
            ]
        }
    )
    literature_record_2 = LiteratureRecord.create(data=literature_data_2)

    db.session.commit()

    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        lit_record_from_es_2 = InspireSearch.get_record_data_from_es(
            literature_record_2
        )
        assert lit_record_from_es
        assert lit_record_from_es_2

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data_3 = faker.record("lit", with_control_number=True)
    literature_data_3.update({"authors": [{"full_name": "Kowal, Michal"}]})
    literature_record_3 = LiteratureRecord.create(data=literature_data_3)
    db.session.commit()

    def assert_first_disambiguation_no_match():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )

        assert get_values_for_schema(
            literature_record_from_es["authors"][0]["ids"], "INSPIRE BAI"
        )
        assert (
            literature_record_from_es["authors"][0]["ids"]
            != literature_record["authors"][0]["ids"]
        )
        assert (
            literature_record_from_es["authors"][0]["ids"]
            != literature_record_2["authors"][0]["ids"]
        )

    retry_until_pass(assert_first_disambiguation_no_match, retry_interval=2)

    db.session.expire_all()
    lit_record = InspireRecord.get_record(literature_record_3.id)
    lit_record["authors"][0]["affiliations"] = [{"value": "CERN"}]
    lit_record.update(dict(lit_record))
    db.session.commit()

    def assert_disambiguation_on_record_update():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_3
        )
        assert (
            literature_record_from_es["authors"][0]["ids"]
            == lit_record["authors"][0]["ids"]
        )

        assert (
            literature_record_from_es["authors"][0]["record"]
            == lit_record["authors"][0]["record"]
        )

    retry_until_pass(assert_disambiguation_on_record_update, retry_interval=2)


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

    def assert_first_disambiguation_no_match():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )

        assert get_values_for_schema(
            literature_record_from_es["authors"][0]["ids"], "INSPIRE BAI"
        )

    retry_until_pass(assert_first_disambiguation_no_match, retry_interval=2)
    old_bai = get_values_for_schema(
        literature_record["authors"][0]["ids"], "INSPIRE BAI"
    )[0]
    db.session.expire_all()
    lit_record = InspireRecord.get_record(literature_record.id)
    lit_record["authors"][0]["emails"] = ["test.test@com"]
    lit_record.update(dict(lit_record))
    db.session.commit()

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

    retry_until_pass(assert_disambiguation_on_record_update, retry_interval=2)


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
    except Exception:
        assert False


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
                "name": {"value": "Michael F. A'Hearn"},
                "ids": [{"schema": "INSPIRE BAI", "value": "M.F.A.Hearn.1"}],
            }
        )
        author_record = AuthorsRecord.create(author_record_data)
        lit_data = faker.record("lit")
        lit_data.update(
            {
                "authors": [
                    {
                        "ids": [{"value": "M.F.A.Hearn.1", "schema": "INSPIRE BAI"}],
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
            "/api/assign/author",
            data=orjson.dumps(
                {
                    "literature_recids": [lit_record["control_number"]],
                    "from_author_recid": author_record["control_number"],
                }
            ),
            content_type="application/json",
        )

        def assert_disambiguation_on_record_update():
            literature_record_from_es = InspireSearch.get_record_data_from_es(
                lit_record
            )

            assert (
                get_values_for_schema(
                    literature_record_from_es["authors"][0]["ids"], "INSPIRE BAI"
                )[0]
                != "M.F.A.Hearn.1"
            )

        retry_until_pass(assert_disambiguation_on_record_update, retry_interval=2)


def test_disambiguation_removes_links_to_authors_records_if_record_moved_to_hidden_collection(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
            "email_addresses": [{"current": True, "value": "test@test.com"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    author_data_2 = faker.record("aut", with_control_number=True)
    author_data_2.update(
        {
            "name": {"value": "Test Author"},
            "ids": [{"schema": "INSPIRE BAI", "value": "T.Author.1"}],
            "email_addresses": [{"current": True, "value": "author@author.com"}],
        }
    )
    author_record_2 = InspireRecord.create(author_data_2)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Brian Gross",
                    "ids": [{"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"}],
                    "emails": ["test@test.com"],
                    "curated_relation": True,
                    "record": author_record["self"],
                },
                {
                    "full_name": "Test Author",
                    "ids": [{"schema": "INSPIRE BAI", "value": "T.Author.1"}],
                    "emails": ["test@test.com"],
                    "curated_relation": True,
                    "record": author_record_2["self"],
                },
            ]
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es, retry_interval=3)

    literature_record["_collections"] = ["HAL Hidden"]
    literature_record.update(dict(literature_record))
    db.session.commit()

    def assert_disambiguation_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record
        )
        assert not literature_record_from_es["authors"][0].get("record")
        assert not literature_record_from_es["authors"][1].get("curated_relation")
        assert not literature_record_from_es["authors"][1].get("record")

    retry_until_pass(assert_disambiguation_task, retry_interval=3)


def test_disambiguation_run_for_every_author_when_record_moved_from_private_collection_to_literature(
    inspire_app, clean_celery_session, enable_disambiguation
):
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "name": {"value": "Brian Gross"},
            "ids": [{"schema": "INSPIRE BAI", "value": "B.Gross.1"}],
            "email_addresses": [{"current": True, "value": "b.gross@cern.ch"}],
        }
    )
    author_record = InspireRecord.create(author_data)
    author_data_2 = faker.record("aut", with_control_number=True)
    author_data_2.update(
        {
            "name": {"value": "Test Author"},
            "ids": [{"schema": "INSPIRE BAI", "value": "T.Author.1"}],
            "email_addresses": [{"current": True, "value": "author@author.com"}],
        }
    )
    author_record_2 = InspireRecord.create(author_data_2)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        author_record_from_es = InspireSearch.get_record_data_from_es(author_record)
        assert author_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "_collections": ["HAL Hidden"],
            "authors": [
                {
                    "full_name": "Gross, Brian",
                    "ids": [{"schema": "INSPIRE BAI", "value": "B.Gross.1"}],
                    "emails": ["b.gross@cern.ch"],
                },
                {
                    "full_name": "Author, Test",
                    "ids": [{"schema": "INSPIRE BAI", "value": "T.Author.1"}],
                    "emails": ["author@author.com"],
                },
            ],
        }
    )
    literature_record = LiteratureRecord.create(literature_data)
    db.session.commit()

    def assert_authors_records_exist_in_es():
        lit_record_from_es = InspireSearch.get_record_data_from_es(literature_record)
        assert lit_record_from_es

    retry_until_pass(assert_authors_records_exist_in_es, retry_interval=3)

    literature_record["_collections"] = ["Literature"]
    literature_record.update(dict(literature_record))
    db.session.commit()

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

    retry_until_pass(assert_disambiguation_task, retry_interval=5)
