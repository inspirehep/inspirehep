# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.utils import create_record, create_user
from inspire_dojson.utils import get_recid_from_ref
from invenio_accounts.testutils import login_user_via_session

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


def test_assign_requires_cataloger_login(inspire_app):
    user = create_user(role="user")
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
        login_user_via_session(client, email=user.email)
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

    assert response_status_code == 403

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


def test_assign_from_an_author_to_another(inspire_app):
    cataloger = create_user(role="cataloger")
    from_author = create_record("aut")
    to_author = create_record("aut", data={"stub": True})
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

    for literature in [literature_1, literature_2]:
        literature_after = LiteratureRecord.get_record_by_pid_value(
            literature["control_number"]
        )
        literature_author = literature_after["authors"][0]
        assert literature_author["record"] == {
            "$ref": f"http://localhost:5000/api/authors/{to_author['control_number']}"
        }
        assert literature_author["curated_relation"]

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert not to_author_after["stub"]


def test_assign_from_an_author_to_another_that_is_not_stub(inspire_app):
    cataloger = create_user(role="cataloger")
    from_author = create_record("aut")
    to_author = create_record("aut", data={"stub": False})
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

    literature_after = LiteratureRecord.get_record_by_pid_value(
        literature["control_number"]
    )
    literature_author = literature_after["authors"][1]
    assert literature_author["record"] == {
        "$ref": f"http://localhost:5000/api/authors/{to_author['control_number']}"
    }
    assert literature_author["curated_relation"]

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert not to_author_after["stub"]


def test_assign_without_to_author(inspire_app):
    cataloger = create_user(role="cataloger")
    from_author = create_record("aut")
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
    stub_author_id = response.json["stub_author_id"]

    literature1_after = LiteratureRecord.get_record_by_pid_value(
        literature1["control_number"]
    )
    literature1_author = literature1_after["authors"][0]
    literature1_author_recid = get_recid_from_ref(literature1_author["record"])
    assert literature1_author_recid != from_author["control_number"]
    assert literature1_author_recid == stub_author_id
    assert literature1_author["curated_relation"] is True

    literature2_after = LiteratureRecord.get_record_by_pid_value(
        literature1["control_number"]
    )
    literature2_author = literature2_after["authors"][0]
    literature2_author_recid = get_recid_from_ref(literature2_author["record"])
    assert literature2_author_recid != from_author["control_number"]
    assert literature2_author_recid == stub_author_id
    assert literature2_author["curated_relation"] is True

    author = AuthorsRecord.get_record_by_pid_value(stub_author_id)
    assert author["stub"] is True
    assert author["name"] == {"value": "Urhan, Harun", "name_variants": ["Urhan, H"]}


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
