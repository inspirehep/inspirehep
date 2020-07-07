# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.utils import create_record, create_user
from inspire_dojson.utils import get_recid_from_ref
from invenio_accounts.testutils import login_user_via_session

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
                },
            ]
        },
    )

    with inspire_app.test_client() as client:
        response = client.post(
            "/assign",
            data=json.dumps(
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
    assert literature_author["curated_relation"] == False

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert to_author_after["stub"] == True


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
                },
            ]
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/assign",
            data=json.dumps(
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
    assert literature_author["curated_relation"] == False

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert to_author_after["stub"] == True


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
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
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
            "/assign",
            data=json.dumps(
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
        assert literature_author["curated_relation"] == True

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert to_author_after["stub"] == False


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
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
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
            "/assign",
            data=json.dumps(
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
    assert literature_author["curated_relation"] == True

    to_author_after = AuthorsRecord.get_record_by_pid_value(to_author["control_number"])
    assert to_author_after["stub"] == False


def test_assign_without_to_author(inspire_app):
    cataloger = create_user(role="cataloger")
    from_author = create_record("aut")
    literature = create_record(
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
            "/assign",
            data=json.dumps(
                {
                    "literature_recids": [literature["control_number"]],
                    "from_author_recid": from_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert response_status_code == 200

    literature_after = LiteratureRecord.get_record_by_pid_value(
        literature["control_number"]
    )
    literature_author = literature_after["authors"][0]
    literature_author_recid = get_recid_from_ref(literature_author["record"])
    assert literature_author_recid != from_author["control_number"]
    assert literature_author["curated_relation"] == True

    author = AuthorsRecord.get_record_by_pid_value(literature_author_recid)
    assert author["stub"] == True
