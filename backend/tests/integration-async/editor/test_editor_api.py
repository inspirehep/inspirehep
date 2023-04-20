# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import orjson
import pytest
from celery.app.annotations import MapAnnotation, resolve_all
from helpers.utils import create_record_async, create_user, logout, retry_test
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed

from inspirehep.accounts.roles import Roles
from inspirehep.records.api import LiteratureRecord


@pytest.fixture(scope="function")
def record_with_two_revisions(inspire_app, clean_celery_session):
    record_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "control_number": 111,
        "document_type": ["article"],
        "titles": [{"title": "record rev0"}],
        "self": {"$ref": "http://localhost:5000/api/literature/1243"},
        "_collections": ["Literature"],
    }

    record = create_record_async("lit", data=record_data, with_control_number=False)

    record_data["titles"][0]["title"] = "record rev1"

    record.update(record_data)
    db.session.commit()


@pytest.fixture(scope="function")
def hidden_record_with_two_revisions(inspire_app, clean_celery_session):
    record_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "control_number": 111,
        "document_type": ["article"],
        "titles": [{"title": "record rev0"}],
        "self": {"$ref": "http://localhost:5000/api/literature/1243"},
        "_collections": ["HEP Hidden"],
    }

    record = create_record_async("lit", data=record_data, with_control_number=False)

    record_data["titles"][0]["title"] = "record rev1"

    record.update(record_data)
    db.session.commit()


def test_get_revisions_requires_authentication(
    inspire_app, clean_celery_session, record_with_two_revisions
):
    with inspire_app.test_client() as client:
        response = client.get(
            "/api/editor/literature/111/revisions", content_type="application/json"
        )

    assert response.status_code == 401


def test_get_revisions_with_error(inspire_app, clean_celery_session):
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/api/editor/literature/555/revisions", content_type="application/json"
        )

    assert response.status_code == 400


def test_get_revisions(inspire_app, clean_celery_session, record_with_two_revisions):
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/api/editor/literature/111/revisions", content_type="application/json"
        )

    assert response.status_code == 200

    result = orjson.loads(response.data)

    assert result[0]["revision_id"] == 1
    assert result[1]["revision_id"] == 0

    assert result[0]["user_email"] == "system"
    assert result[1]["user_email"] == "system"


def test_get_revisions_hidden_collection_user(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user = create_user(role="user")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/api/editor/literature/111/revisions", content_type="application/json"
        )
        assert response.status_code == 403
        logout(client)


def test_get_revisions_hidden_collection_user_read(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user_read = create_user(role="hep-hidden-read")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_read.email)
        response = client.get(
            "/api/editor/literature/111/revisions", content_type="application/json"
        )
        assert response.status_code == 200
        logout(client)


def test_get_revisions_hidden_collection_user_write(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user_readwrite = create_user(role="hep-hidden-read-write")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_readwrite.email)
        response = client.get(
            "/api/editor/literature/111/revisions", content_type="application/json"
        )
        assert response.status_code == 200
        logout(client)


def test_get_revisions_hidden_collection_cataloger_write(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user_readwrite = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_readwrite.email)
        response = client.get(
            "/api/editor/literature/111/revisions", content_type="application/json"
        )
        assert response.status_code == 200
        logout(client)


def test_revert_to_revision_requires_authentication(
    inspire_app, clean_celery_session, record_with_two_revisions
):
    with inspire_app.test_client() as client:
        response = client.put(
            "/api/editor/literature/111/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 2}),
        )

    assert response.status_code == 401


def test_revert_to_revision_with_error(inspire_app, clean_celery_session):
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            "/api/editor/literature/555/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 0}),
        )

    assert response.status_code == 400


def test_revert_to_revision(
    inspire_app, clean_celery_session, record_with_two_revisions
):
    user = create_user(role=Roles.cataloger.value)
    record = LiteratureRecord.get_record_by_pid_value(111)

    assert record["titles"][0]["title"] == "record rev1"
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            "/api/editor/literature/111/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 0}),
        )
    assert response.status_code == 200

    record = LiteratureRecord.get_record_by_pid_value(111)

    assert record["titles"][0]["title"] == "record rev0"


def test_revert_to_revision_hidden_collection_user(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user = create_user(role="user")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            "/api/editor/literature/111/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 0}),
        )
        assert response.status_code == 403
        record = LiteratureRecord.get_record_by_pid_value(111)
        assert record["titles"][0]["title"] == "record rev1"
        logout(client)


def test_revert_to_revision_hidden_collection_user_read(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user_read = create_user(role="hep-hidden-read")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_read.email)
        response = client.put(
            "/api/editor/literature/111/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 0}),
        )
        assert response.status_code == 403
        record = LiteratureRecord.get_record_by_pid_value(111)
        assert record["titles"][0]["title"] == "record rev1"
        logout(client)


def test_revert_to_revision_hidden_collection_user_write(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user_readwrite = create_user(role="hep-hidden-read-write")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_readwrite.email)
        response = client.put(
            "/api/editor/literature/111/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 0}),
        )
        assert response.status_code == 200
        record = LiteratureRecord.get_record_by_pid_value(111)
        assert record["titles"][0]["title"] == "record rev0"
        logout(client)


def test_revert_to_revision_hidden_collection_cataloger(
    inspire_app, clean_celery_session, hidden_record_with_two_revisions
):
    user_readwrite = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_readwrite.email)
        response = client.put(
            "/api/editor/literature/111/revisions/revert",
            content_type="application/json",
            data=orjson.dumps({"revision_id": 0}),
        )
        assert response.status_code == 200
        record = LiteratureRecord.get_record_by_pid_value(111)
        assert record["titles"][0]["title"] == "record rev0"
        logout(client)


def test_get_revision_requires_authentication(
    inspire_app, clean_celery_session, record_with_two_revisions
):
    record = LiteratureRecord.get_record_by_pid_value(111)

    transaction_id_of_first_rev = record.revisions[1].model.transaction_id
    rec_uuid = record.id
    with inspire_app.test_client() as client:
        response = client.get(
            "/api/editor/revisions/"
            + str(rec_uuid)
            + "/"
            + str(transaction_id_of_first_rev),
            content_type="application/json",
        )

    assert response.status_code == 401


def test_get_revision_with_error(
    inspire_app, clean_celery_session, record_with_two_revisions
):
    user = create_user(role=Roles.cataloger.value)
    record = LiteratureRecord.get_record_by_pid_value(111)
    rec_uuid = record.id

    wrong_transaction_id = 88888
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/api/editor/revisions/" + str(rec_uuid) + "/" + str(wrong_transaction_id),
            content_type="application/json",
        )

    assert response.status_code == 400


def test_get_revision(inspire_app, clean_celery_session, record_with_two_revisions):
    user = create_user(role=Roles.cataloger.value)
    record = LiteratureRecord.get_record_by_pid_value(111)

    transaction_id_of_first_rev = record.revisions[0].model.transaction_id
    rec_uuid = record.id
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/api/editor/revisions/"
            + str(rec_uuid)
            + "/"
            + str(transaction_id_of_first_rev),
            content_type="application/json",
        )

    assert response.status_code == 200

    result = orjson.loads(response.data)

    assert result["titles"][0]["title"] == "record rev0"


def test_editor_locks_are_passed_in_payload_when_another_user_editing(
    inspire_app,
    clean_celery_session,
    enable_disambiguation,
    record_with_two_revisions,
    override_config,
):
    from inspirehep.disambiguation.tasks import disambiguate_authors

    with override_config(FEATURE_FLAG_ENABLE_HAL_PUSH=True):

        celery_task_annotation = MapAnnotation({"countdown": 1.5})

        user = create_user(role=Roles.cataloger.value)

        record = LiteratureRecord.get_record_by_pid_value(111)
        record["authors"] = [{"full_name": "An Author"}]
        record["_export_to"] = {"HAL": True}
        record["external_system_identifiers"] = [
            {"schema": "HAL", "value": "HAL-12345678"}
        ]
        record.update(dict(record))
        db.session.commit()

        @retry_test(stop=stop_after_delay(0.05), wait=wait_fixed(0.3))
        def assert_locks():
            with inspire_app.test_client() as client:
                login_user_via_session(client, email=user.email)
                response = client.get(
                    f'/api/editor/literature/{record["control_number"]}',
                    content_type="application/json",
                )

            assert "task_locks" in response.json
            assert response.json["task_locks"].startswith("Scheduled tasks:")

        assert_locks()
        resolve_all(celery_task_annotation, disambiguate_authors)
