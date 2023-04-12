# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.providers.faker import faker
from helpers.utils import (
    create_record,
    create_record_factory,
    create_user,
    create_user_and_token,
)
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db

from inspirehep.records.models import WorkflowsRecordSources


def test_error_message_on_pid_already_exists(inspire_app):
    create_record_factory("lit", data={"control_number": 666})
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    record = faker.record("lit", data={"control_number": 666})
    with inspire_app.test_client() as client:
        response = client.post(
            "/literature",
            headers=headers,
            content_type="application/json",
            data=orjson.dumps(record),
        )

    response_status_code = response.status_code
    response_message = response.json["message"]

    expected_status_code = 400
    expected_message = "PIDAlreadyExists: pid_type:'lit', pid_value:'666'."
    assert expected_status_code == response_status_code
    assert expected_message == response_message


def test_does_not_return_deleted_pid_error_if_cataloger(inspire_app):
    cataloger = create_user(role="cataloger")
    record = create_record("con")
    record.delete()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.get(f"/conferences/{record['control_number']}")

    response_status_code = response.status_code
    response.json

    assert response_status_code == 200


def test_returns_deleted_pid_error_if_not_cataloger(inspire_app):
    user = create_user(role="user")
    record = create_record("con")
    record.delete()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/conferences/{record['control_number']}")

    response_status_code = response.status_code
    response.json

    assert response_status_code == 410


def test_does_not_update_stale(inspire_app):
    cataloger = create_user(role="cataloger")
    record = create_record("con")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        get_response = client.get(f"/conferences/{record_control_number}")
        etag = get_response.headers["ETag"]

        first_put_response = client.put(
            "/conferences/{}".format(record_control_number),
            content_type="application/json",
            data=orjson.dumps(
                faker.record("con", data={"control_number": record_control_number})
            ),
            headers={"If-Match": etag},
        )

        assert first_put_response.status_code == 200

        stale_put_response = client.put(
            f"/conferences/{record_control_number}",
            content_type="application/json",
            data=orjson.dumps(
                faker.record("con", data={"control_number": record_control_number})
            ),
            headers={"If-Match": etag},
        )

    assert stale_put_response.status_code == 412


def test_returns_200_if_not_modified(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        first_get_response = client.get(f"/literature/{record_control_number}")
        last_modified = first_get_response.headers["Last-Modified"]

        second_get_response = client.get(
            f"/literature/{record_control_number}",
            headers={"If-Modified-Since": last_modified},
        )

        assert second_get_response.status_code == 200


def test_returns_301_with_proper_location_when_record_redirected(inspire_app):
    record_redirected = create_record("lit")
    record = create_record("lit", data={"deleted_records": [record_redirected["self"]]})

    redirected_cn = record_redirected["control_number"]
    new_cn = str(record["control_number"])

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{redirected_cn}")

    assert response.status_code == 301
    assert response.location.split("/")[-1] == new_cn


def test_returns_301_with_proper_location_when_record_redirected_in_chain(inspire_app):
    record_redirected_1 = create_record("lit")
    record_redirected_2 = create_record(
        "lit", data={"deleted_records": [record_redirected_1["self"]]}
    )
    record = create_record(
        "lit", data={"deleted_records": [record_redirected_2["self"]]}
    )

    redirected_cn = record_redirected_1["control_number"]
    new_cn = str(record["control_number"])

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{redirected_cn}")

    assert response.status_code == 301
    assert response.location.split("/")[-1] == new_cn


def test_literature_workflows_record_source(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        data = {"record_uuid": str(record.id), "source": source, "json": dict(record)}
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 1

        # delete record
        response = client.delete(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 0


def test_literature_workflows_record_source_get_record_happy_flow(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        data = {"record_uuid": str(record.id), "source": source, "json": dict(record)}
        response = client.post(
            "/api/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 1
        # get record
        response = client.get(
            "/api/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps({"record_uuid": str(record.id), "source": source}),
        )
        assert response.status_code == 200
        assert "workflow_sources" in response.json
        assert len(response.json["workflow_sources"]) == 1
        assert "created" in response.json["workflow_sources"][0]
        assert "updated" in response.json["workflow_sources"][0]


def test_literature_workflows_record_source_get_not_found(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"

    # get record which is not in the table
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        response = client.get(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps({"record_uuid": str(record.id), "source": source}),
        )
        assert response.status_code == 404
        assert "Workflow source not found" == response.json["message"]


def test_literature_workflows_record_source_post_with_wrong_data(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        data = {"record_uuid": str(record.id), "source": source}
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 400
        assert "Incorrect input for fields:" in response.json["message"]
        assert len(WorkflowsRecordSources.query.all()) == 0


def test_literature_workflows_record_source_post_source(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        data = {"record_uuid": str(record.id), "source": source, "json": dict(record)}
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 1


def test_literature_workflows_record_source_post_update(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        data = {"record_uuid": str(record.id), "source": source, "json": dict(record)}
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 1

        # update record
        record["publication_info"] = [{"journal_title": "JHEP"}]
        record.update(dict(record))
        db.session.commit()

        data = {"record_uuid": str(record.id), "source": source, "json": dict(record)}
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 1


def test_literature_workflows_record_source_post_with_another_source(inspire_app):
    superuser = create_user(role="superuser")
    record = create_record("lit")
    source = "arxiv"
    source2 = "submitter"

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=superuser.email)
        data = {"record_uuid": str(record.id), "source": source, "json": dict(record)}
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 1

        # post with another source
        data["source"] = source2
        response = client.post(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps(data),
        )
        assert response.status_code == 200
        assert len(WorkflowsRecordSources.query.all()) == 2

        # get records for both sources
        response = client.get(
            "/literature/workflows_record_sources",
            content_type="application/json",
            data=orjson.dumps({"record_uuid": str(record.id)}),
        )
        assert response.status_code == 200
        assert "workflow_sources" in response.json
        assert len(response.json["workflow_sources"]) == 2


def test_self_curation_returns_500_when_stale_data(inspire_app):
    user = create_user()
    literature_data = {
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

    record = create_record("lit", data=literature_data)
    record["authors"] = [{"full_name": "An Author"}]
    record.update(dict(record))
    data = {
        "record_id": record.id,
        "revision_id": 0,
        "reference_index": 0,
        "new_reference_recid": 12,
    }

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/literature/reference-self-curation",
            content_type="application/json",
            data=orjson.dumps(data),
        )

    assert response.status_code == 422
    assert response.json["message"] == "Record version doesn't match the latest version"


def test_self_curation_returns_500_when_wrong_index(inspire_app):
    user = create_user()
    literature_data = {
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

    record = create_record("lit", data=literature_data)

    data = {
        "record_id": record.id,
        "revision_id": record.revision_id,
        "reference_index": 10,
        "new_reference_recid": 12,
    }

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/literature/reference-self-curation",
            content_type="application/json",
            data=orjson.dumps(data),
        )

    assert response.status_code == 412
    assert response.json["message"] == "Reference index doesn't exist"


def test_self_curation_returns_401_for_not_authenticated_user(inspire_app):
    record = create_record("lit")

    data = {
        "record_id": record.id,
        "revision_id": 0,
        "reference_index": 0,
        "new_reference_recid": 12,
    }

    with inspire_app.test_client() as client:
        response = client.post(
            "/literature/reference-self-curation",
            content_type="application/json",
            data=orjson.dumps(data),
        )

    assert response.status_code == 401


@mock.patch("inspirehep.records.views.reference_self_curation_task")
def test_reference_self_curation_task_is_called_with_proper_args(
    mock_self_curation_task, inspire_app
):
    user = create_user()
    literature_data = {
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

    record = create_record("lit", data=literature_data)

    data = {
        "record_id": str(record.id),
        "revision_id": int(record.revision_id),
        "reference_index": 0,
        "new_reference_recid": 1,
    }

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        client.post(
            "/literature/reference-self-curation",
            content_type="application/json",
            data=orjson.dumps(data),
        )
    assert mock_self_curation_task.mock_calls[0][1] == (
        str(record.id),
        int(record.revision_id),
        0,
        1,
    )
