#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.providers.faker import faker
from helpers.utils import create_user, retry_test
from inspirehep.records.api.base import InspireRecord
from inspirehep.search.api import InspireSearch
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from sqlalchemy.orm.exc import StaleDataError
from tenacity import stop_after_delay, wait_fixed


def test_reference_diff(inspire_app, clean_celery_session):
    user = create_user(role="cataloger")
    literature_data = faker.record("lit")
    raw_ref_text = (
        '3.M. Mentink, "ATLAS circuit breakers update 18-05-20", EP Magnet RD Meeting,'
        " 2020.Show in Context"
    )
    literature_data.update(
        {
            "references": [
                {
                    "raw_refs": [{"value": raw_ref_text, "schema": "text"}],
                    "reference": {
                        "dois": ["10.1103/PhysRev.92.649"],
                        "misc": ["The 7.68MeV state in 12C"],
                        "label": "31",
                        "authors": [
                            {"full_name": "Dunbar, D.N.F."},
                            {"full_name": "Pixley, R.E."},
                            {"full_name": "Wenzel, W.A."},
                            {"full_name": "Whaling, W."},
                        ],
                        "publication_info": {
                            "year": 1953,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    },
                },
            ]
        }
    )
    record = InspireRecord.create(literature_data)
    db.session.commit()
    old_record_revision = str(record.revision_id)

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es

    assert_record_in_es()

    record["references"][0]["reference"]["authors"][0]["full_name"] = "Axelsen, V."
    record.update(dict(record))
    db.session.commit()
    new_record_revision = str(record.revision_id)

    @retry_test(stop=stop_after_delay(15), wait=wait_fixed(2))
    def assert_record_updated():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert (
            literature_record_from_es["references"][0]["reference"]["authors"][0][
                "full_name"
            ]
            == "Axelsen, V."
        )

    assert_record_updated()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/api/literature/{record['control_number']}/diff/{old_record_revision}..{new_record_revision}",
        )
        assert response.status_code == 200
        response_new_reference = orjson.loads(response.json["current_version"])
        response_new_raw_ref = response_new_reference.pop("raw_ref")
        assert response_new_reference["authors"][0]["full_name"] == "Axelsen, V."
        assert response_new_raw_ref == raw_ref_text
        response_old_reference = orjson.loads(response.json["previous_version"])
        response_new_raw_ref = response_old_reference.pop("raw_ref")
        assert response_old_reference["authors"][0]["full_name"] == "Dunbar, D.N.F."
        assert response_new_raw_ref == raw_ref_text
        assert response.json["reference_index"] == 0


def test_reference_diff_multiple_references(inspire_app, clean_celery_session):
    user = create_user(role="cataloger")
    literature_data = faker.record("lit")
    raw_ref_text = (
        "[2] Jedrych, M. INSPIRE-next. A masterpiece of the modern software"
        " engineering."
    )
    literature_data.update(
        {
            "references": [
                {
                    "reference": {
                        "dois": ["10.1103/PhysRev.92.649"],
                        "misc": ["The 7.68MeV state in 12C"],
                        "label": "31",
                        "authors": [
                            {"full_name": "Dunbar, D.N.F."},
                            {"full_name": "Pixley, R.E."},
                            {"full_name": "Wenzel, W.A."},
                            {"full_name": "Whaling, W."},
                        ],
                        "publication_info": {
                            "year": 1953,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    }
                },
                {
                    "raw_refs": [{"value": raw_ref_text, "schema": "text"}],
                    "reference": {
                        "label": "32",
                        "authors": [
                            {"full_name": "Another, Author"},
                        ],
                        "publication_info": {
                            "year": 2023,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    },
                },
            ]
        }
    )
    record = InspireRecord.create(literature_data)
    db.session.commit()
    old_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es

    assert_record_in_es()

    record["references"][1]["reference"]["authors"][0]["full_name"] = "Axelsen, V."
    record.update(dict(record))
    db.session.commit()
    new_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_updated():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert (
            literature_record_from_es["references"][1]["reference"]["authors"][0][
                "full_name"
            ]
            == "Axelsen, V."
        )

    assert_record_updated()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/api/literature/{record['control_number']}/diff/{old_record_revision}..{new_record_revision}",
        )
        assert response.status_code == 200
        response_new_reference = orjson.loads(response.json["current_version"])
        response_new_raw_ref = response_new_reference.pop("raw_ref")
        assert response_new_reference["authors"][0]["full_name"] == "Axelsen, V."
        assert response_new_raw_ref == raw_ref_text
        response_old_reference = orjson.loads(response.json["previous_version"])
        response_old_raw_ref = response_old_reference.pop("raw_ref")
        assert response_old_reference["authors"][0]["full_name"] == "Another, Author"
        assert response_old_raw_ref == raw_ref_text
        assert response.json["reference_index"] == 1


def test_reference_diff_when_no_changed_references(inspire_app, clean_celery_session):
    user = create_user(role="cataloger")
    literature_data = faker.record("lit")
    literature_data.update(
        {
            "references": [
                {
                    "reference": {
                        "dois": ["10.1103/PhysRev.92.649"],
                        "misc": ["The 7.68MeV state in 12C"],
                        "label": "31",
                        "authors": [
                            {"full_name": "Dunbar, D.N.F."},
                            {"full_name": "Pixley, R.E."},
                            {"full_name": "Wenzel, W.A."},
                            {"full_name": "Whaling, W."},
                        ],
                        "publication_info": {
                            "year": 1953,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    }
                },
            ]
        }
    )
    record = InspireRecord.create(literature_data)
    db.session.commit()
    old_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es

        assert_record_in_es()

    record["authors"] = [{"full_name": "Author, A."}]
    record.update(dict(record))
    db.session.commit()
    new_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_updated():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es["authors"][0]["full_name"] == "Author, A."

    assert_record_updated()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/api/literature/{record['control_number']}/diff/{old_record_revision}..{new_record_revision}",
        )
        assert response.status_code == 400
        assert response.json["message"] == "Changed reference not found"


def test_reference_diff_when_wrong_versions_passed(inspire_app, clean_celery_session):
    user = create_user(role="cataloger")
    literature_data = faker.record("lit")
    literature_data.update(
        {
            "references": [
                {
                    "reference": {
                        "dois": ["10.1103/PhysRev.92.649"],
                        "misc": ["The 7.68MeV state in 12C"],
                        "label": "31",
                        "authors": [
                            {"full_name": "Dunbar, D.N.F."},
                            {"full_name": "Pixley, R.E."},
                            {"full_name": "Wenzel, W.A."},
                            {"full_name": "Whaling, W."},
                        ],
                        "publication_info": {
                            "year": 1953,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    }
                },
            ]
        }
    )
    record = InspireRecord.create(literature_data)
    db.session.commit()
    old_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es

    assert_record_in_es()

    record["authors"] = [{"full_name": "Author, A."}]
    record.update(dict(record))
    db.session.commit()
    new_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_updated():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es["authors"][0]["full_name"] == "Author, A."

    assert_record_updated()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/api/literature/{record['control_number']}/diff/{new_record_revision}..{old_record_revision}",
        )
        assert response.status_code == 400
        assert (
            response.json["message"] == "Old revision must be lower than new revision"
        )


def test_reference_diff_when_stale_data(inspire_app, clean_celery_session):
    user = create_user(role="cataloger")
    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "references": [
                {
                    "reference": {
                        "dois": ["10.1103/PhysRev.92.649"],
                        "misc": ["The 7.68MeV state in 12C"],
                        "label": "31",
                        "authors": [
                            {"full_name": "Dunbar, D.N.F."},
                            {"full_name": "Pixley, R.E."},
                            {"full_name": "Wenzel, W.A."},
                            {"full_name": "Whaling, W."},
                        ],
                        "publication_info": {
                            "year": 1953,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    }
                },
            ],
        }
    )

    record = InspireRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(15))
    def assert_record_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es

    assert_record_in_es()
    old_record_revision = record.revision_id

    record["authors"] = [{"full_name": "Author, A."}]
    record.update(dict(record))
    db.session.commit()

    @retry_test(stop=stop_after_delay(15))
    def assert_record_updated():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es["authors"][0]["full_name"] == "Author, A."

    assert_record_updated()
    new_record_revision = record.revision_id

    with (
        inspire_app.test_client() as client,
        mock.patch(
            "inspirehep.records.views.InspireRecord.get_record",
            side_effect=StaleDataError,
        ),
    ):
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/api/literature/{record['control_number']}/diff/{old_record_revision}..{new_record_revision}",
        )
        assert response.status_code == 400
        assert response.json["message"] == "Record in given revision was not found"


def test_reference_diff_when_user_not_authenticated(inspire_app, clean_celery_session):
    user = create_user()
    literature_data = faker.record("lit")
    literature_data.update(
        {
            "references": [
                {
                    "reference": {
                        "dois": ["10.1103/PhysRev.92.649"],
                        "misc": ["The 7.68MeV state in 12C"],
                        "label": "31",
                        "authors": [
                            {"full_name": "Dunbar, D.N.F."},
                            {"full_name": "Pixley, R.E."},
                            {"full_name": "Wenzel, W.A."},
                            {"full_name": "Whaling, W."},
                        ],
                        "publication_info": {
                            "year": 1953,
                            "page_end": "650",
                            "page_start": "649",
                            "journal_title": "Phys.Rev.",
                            "journal_volume": "92",
                        },
                    }
                },
            ]
        }
    )
    record = InspireRecord.create(literature_data)
    db.session.commit()
    old_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es

    assert_record_in_es()

    record["authors"] = [{"full_name": "Author, A."}]
    record.update(dict(record))
    db.session.commit()
    new_record_revision = record.revision_id

    @retry_test(stop=stop_after_delay(15))
    def assert_record_updated():
        literature_record_from_es = InspireSearch.get_record_data_from_es(record)
        assert literature_record_from_es["authors"][0]["full_name"] == "Author, A."

    assert_record_updated()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/api/literature/{record['control_number']}/diff/{new_record_revision}..{old_record_revision}",
        )
        assert response.status_code == 403
