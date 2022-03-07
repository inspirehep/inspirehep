# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session
from sqlalchemy.exc import ResourceClosedError

from inspirehep.accounts.roles import Roles
from inspirehep.records.api import AuthorsRecord, LiteratureRecord


def test_assign_without_login(inspire_app):
    from_author = create_record("aut")
    to_author = create_record("aut", data={"stub": True})
    literature = create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Urhan, Harun",
                    "curated_relation": False,
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                }
            ]
        },
    )

    with inspire_app.test_client() as client:
        response = client.post(
            "/assign/author",
            data=orjson.dumps(
                {
                    "literature_recids": [literature["control_number"]],
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert response_status_code == 401

    # assert nothing changes
    literature_after = LiteratureRecord.get_record_by_pid_value(
        literature["control_number"]
    )
    literature_author = literature_after["authors"][0]
    assert literature_author["record"] == {
        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
    }
    assert not literature_author["curated_relation"]

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert to_author_after["stub"]


@mock.patch("inspirehep.assign.views.current_celery_app.send_task")
def test_assign_from_an_author_to_another(mock_assign, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
        "stub": True,
    }
    from_author = create_record("aut")
    to_author = create_record("aut", data=author_data)
    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Urhan, Harun",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )
    literature_2 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Urhan, Harun",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                }
            ]
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/author",
            data=orjson.dumps(
                {
                    "literature_recids": [
                        literature_1["control_number"],
                        literature_2["control_number"],
                    ],
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert response_status_code == 200
    mock_assign.assert_called_once()


@mock.patch("inspirehep.assign.views.current_celery_app.send_task")
def test_assign_from_an_author_to_another_that_is_not_stub(mock_assign, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
        "stub": False,
    }
    from_author = create_record("aut")
    to_author = create_record("aut", data=author_data)
    literature = create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
                {
                    "full_name": "Urhan, Harun",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                },
            ]
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/author",
            data=orjson.dumps(
                {
                    "literature_recids": [literature["control_number"]],
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert response_status_code == 200
    mock_assign.assert_called_once()


@mock.patch("inspirehep.assign.views.current_celery_app.send_task")
def test_assign_without_to_author(mock_assign, inspire_app, override_config):
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        cataloger = create_user(role="cataloger")
        from_author = create_record("aut", data={"name": {"value": "Urhan, Harun"}})
        literature1 = create_record(
            "lit",
            data={
                "authors": [
                    {
                        "curated_relation": False,
                        "full_name": "Urhan, Harun",
                        "record": {
                            "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                        },
                    }
                ]
            },
        )

        literature2 = create_record(
            "lit",
            data={
                "authors": [
                    {
                        "curated_relation": False,
                        "full_name": "Urhan, H",
                        "record": {
                            "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                        },
                    }
                ]
            },
        )

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=cataloger.email)
            response = client.post(
                "/assign/author",
                data=orjson.dumps(
                    {
                        "literature_recids": [
                            literature1["control_number"],
                            literature2["control_number"],
                        ],
                        "from_author_recid": from_author["control_number"],
                    }
                ),
                content_type="application/json",
            )
        response_status_code = response.status_code

    assert response_status_code == 200
    mock_assign.assert_called_once()


def test_assign_conference_view(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    literature1 = create_record("lit")
    literature2 = create_record("lit")
    conference = create_record("con", data={"cnum": "C20-03-01"})

    expected_status_code = 200
    expected_publication_info = [
        {"cnum": conference["cnum"], "conference_record": conference["self"]}
    ]
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/conference",
            data=orjson.dumps(
                {
                    "literature_recids": [
                        literature1.control_number,
                        literature2.control_number,
                    ],
                    "conference_recid": conference.control_number,
                }
            ),
            content_type="application/json",
        )
        response_status_code = response.status_code

    assert response_status_code == expected_status_code

    literature1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    literature2 = LiteratureRecord.get_record_by_pid_value(literature2.control_number)

    assert literature1["publication_info"] == expected_publication_info
    assert literature2["publication_info"] == expected_publication_info


def test_assign_conference_view_missing_parameters(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    literature1 = create_record("lit")
    literature2 = create_record("lit")
    conference = create_record("con", data={"cnum": "C20-03-01"})

    expected_status_code = 422

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/conference",
            data=orjson.dumps(
                {
                    "literature_recids": [
                        literature1.control_number,
                        literature2.control_number,
                    ],
                }
            ),
            content_type="application/json",
        )
        assert response.status_code == expected_status_code

        response = client.post(
            "/assign/conference",
            data=orjson.dumps(
                {
                    "conference_recid": conference.control_number,
                }
            ),
            content_type="application/json",
        )
        assert response.status_code == expected_status_code


def test_literature_export_to_cds_view(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    literature1 = create_record("lit")
    literature2 = create_record(
        "lit", data={"_export_to": {"CDS": False, "HAL": False}}
    )

    expected_status_code = 200

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/export-to-cds",
            data=orjson.dumps(
                {
                    "literature_recids": [
                        literature1.control_number,
                        literature2.control_number,
                    ]
                }
            ),
            content_type="application/json",
        )
        response_status_code = response.status_code

    assert response_status_code == expected_status_code

    literature1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    literature2 = LiteratureRecord.get_record_by_pid_value(literature2.control_number)

    assert literature1["_export_to"] == {"CDS": True}
    assert literature2["_export_to"] == {"CDS": True, "HAL": False}


def test_literature_export_to_cds_view_missing_parameters(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    expected_status_code = 422

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/export-to-cds",
            data=orjson.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == expected_status_code


def test_assign_doesnt_raise_resource_closed_error(inspire_app, override_config):
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        author_record = create_record("aut", data={"name": {"value": "Test, Author"}})
        paper = create_record(
            "lit",
            data={
                "authors": [
                    {
                        "full_name": author_record["name"]["value"],
                        "record": author_record["self"],
                    }
                ]
            },
        )

        create_record(
            "lit",
            {
                "authors": [
                    {
                        "full_name": author_record["name"]["value"],
                        "ids": [{"schema": "INSPIRE BAI", "value": "A.Test.2"}],
                    }
                ]
            },
        )
        cataloger = create_user(role="cataloger")
        try:
            with inspire_app.test_client() as client:
                login_user_via_session(client, email=cataloger.email)
                client.post(
                    "/assign/author",
                    data=orjson.dumps(
                        {
                            "literature_recids": [
                                paper["control_number"],
                            ],
                            "from_author_recid": author_record["control_number"],
                        }
                    ),
                    content_type="application/json",
                )
        except ResourceClosedError:
            assert False


@mock.patch("inspirehep.assign.tasks.async_create_ticket_with_template")
def test_author_assign_view_claimed(mock_create_ticket, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
        "control_number": 1,
    }
    author_data_2 = {
        "name": {"value": "Matczak, Michal", "preferred_name": "Michal Mata"},
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
        "control_number": 2,
    }
    from_author = create_record("aut", data=author_data)
    to_author = create_record("aut", data=author_data_2)
    literature_1 = create_record(
        "lit",
        data={
            "control_number": 3,
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Aad, Georges",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
            ],
        },
    )
    literature_2 = create_record(
        "lit",
        data={
            "control_number": 4,
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Aad, Georges",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                }
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/author",
            data=orjson.dumps(
                {
                    "papers_ids_already_claimed": [
                        literature_2["control_number"],
                    ],
                    "papers_ids_not_matching_name": [
                        literature_1["control_number"],
                    ],
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert mock_create_ticket.mock_calls[0][1] == (
        "AUTHORS_claim_manual",
        None,
        "rt/assign_authors_from_different_profile.html",
        "Claims by user Michal Mata require curator action",
        {
            "to_author_names": ["Matczak, Michal"],
            "from_author_url": "http://localhost:5000/authors/1",
            "to_author_url": "http://localhost:5000/authors/2",
            "incompatibile_names_papers": {
                "http://localhost:5000/literature/3": "Aad, Georges"
            },
            "already_claimed_papers": ["http://localhost:5000/literature/4"],
        },
    )
    assert response_status_code == 200
