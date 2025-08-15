#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import orjson
import pytest
from helpers.utils import create_record, create_user
from inspirehep.accounts.roles import Roles
from inspirehep.records.api.authors import AuthorsRecord
from inspirehep.records.api.literature import LiteratureRecord
from invenio_accounts.testutils import login_user_via_session
from sqlalchemy.exc import ResourceClosedError


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
            "/assign/literature/assign",
            data=orjson.dumps(
                {
                    "literature_ids": [literature["control_number"]],
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
    cataloger = create_user(role=Roles.cataloger.value)
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
            "/assign/literature/assign",
            data=orjson.dumps(
                {
                    "literature_ids": [
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
@mock.patch(
    "inspirehep.accounts.api.get_current_user_orcid", return_value="0000-0003-1134-6827"
)
def test_regression_assign_from_an_author_to_another_with_checking_record_ids(
    mock_assign, mock_orcid, inspire_app
):
    cataloger = create_user()
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
        "stub": True,
    }
    from_author = create_record(
        "aut", data={"ids": [{"schema": "ORCID", "value": "0000-0003-1134-6827"}]}
    )
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
            "/assign/literature/assign",
            data=orjson.dumps(
                {
                    "literature_ids": [
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
    cataloger = create_user(role=Roles.cataloger.value)
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
            "/assign/literature/assign",
            data=orjson.dumps(
                {
                    "literature_ids": [literature["control_number"]],
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
        cataloger = create_user(role=Roles.cataloger.value)
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
                "/assign/literature/unassign",
                data=orjson.dumps(
                    {
                        "literature_ids": [
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
                    "/assign/literature/unassign",
                    data=orjson.dumps(
                        {
                            "literature_ids": [
                                paper["control_number"],
                            ],
                            "from_author_recid": author_record["control_number"],
                        }
                    ),
                    content_type="application/json",
                )
        except ResourceClosedError as e:
            raise AssertionError() from e


@mock.patch("inspirehep.assign.tasks.async_create_ticket_with_template")
def test_author_assign_papers_different_profile(mock_create_ticket, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }
    author_data_2 = {
        "name": {"value": "Matczak, Michal", "preferred_name": "Michal Mata"},
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut", data=author_data)
    from_author_control_number = from_author["control_number"]

    to_author = create_record("aut", data=author_data_2)
    to_author_control_number = to_author["control_number"]

    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Aad, Georges",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author_control_number}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
            ],
        },
    )
    literature_1_control_number = literature_1["control_number"]

    literature_2 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Aad, Georges",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author_control_number}"
                    },
                }
            ],
        },
    )
    literature_2_control_number = literature_2["control_number"]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/literature/assign-different-profile",
            data=orjson.dumps(
                {
                    "literature_ids": [
                        literature_2_control_number,
                        literature_1_control_number,
                    ],
                    "from_author_recid": from_author_control_number,
                    "to_author_recid": to_author_control_number,
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert mock_create_ticket.mock_calls[0][1] == (
        "Author claims",
        None,
        "snow/assign_authors_from_different_profile.html",
        {
            "to_author_names": ["Matczak, Michal"],
            "from_author_url": (
                f"http://localhost:5000/authors/{from_author_control_number}"
            ),
            "to_author_url": (
                f"http://localhost:5000/authors/{to_author_control_number}"
            ),
            "incompatibile_names_papers": {
                f"http://localhost:5000/literature/{literature_1_control_number}": (
                    "Aad, Georges"
                ),
                f"http://localhost:5000/literature/{literature_2_control_number}": (
                    "Aad, Georges"
                ),
            },
            "already_claimed_papers": [
                f"http://localhost:5000/literature/{literature_2_control_number}"
            ],
        },
        "Claims by user Michal Mata require curator action",
    )
    assert response_status_code == 200
    assert "created_rt_ticket" in response.json


def test_author_assign_validates_input_when_no_papers_passed(inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }
    author_data_2 = {
        "name": {"value": "Matczak, Michal", "preferred_name": "Michal Mata"},
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut", data=author_data)
    to_author = create_record("aut", data=author_data_2)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/literature/assign",
            data=orjson.dumps(
                {
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert response_status_code == 422


@mock.patch("inspirehep.assign.views.assign_to_author")
def test_author_assign_uses_parser_args(mock_assign, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }
    author_data_2 = {
        "name": {"value": "Matczak, Michal", "preferred_name": "Michal Mata"},
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut", data=author_data)
    to_author = create_record("aut", data=author_data_2)
    literature_1 = create_record(
        "lit",
        data={
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

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        client.post(
            "/assign/literature/assign",
            data=orjson.dumps(
                {
                    "from_author_recid": str(from_author["control_number"]),
                    "to_author_recid": str(to_author["control_number"]),
                    "literature_ids": [str(literature_1["control_number"])],
                }
            ),
            content_type="application/json",
        )
    assert mock_assign.mock_calls[0][1] == (
        from_author["control_number"],
        to_author["control_number"],
        [literature_1["control_number"]],
    )


@mock.patch("inspirehep.assign.tasks.async_create_ticket_with_template")
def test_author_assign_view_claimed_with_stub_author(mock_create_ticket, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
        "stub": True,
    }
    author_data_2 = {
        "name": {"value": "Matczak, Michal", "preferred_name": "Michal Mata"},
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut", data=author_data)
    to_author = create_record("aut", data=author_data_2)
    literature_1 = create_record(
        "lit",
        data={
            "curated": True,
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
            "curated": True,
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

    papers_ids_already_claimed = [
        literature_2["control_number"],
        literature_1["control_number"],
    ]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/literature/assign-different-profile",
            data=orjson.dumps(
                {
                    "literature_ids": papers_ids_already_claimed,
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code

    assert mock_create_ticket.mock_calls[0][1] == (
        "Author claims",
        None,
        "snow/assign_authors_from_different_profile.html",
        {
            "to_author_names": ["Matczak, Michal"],
            "from_author_url": (
                f"http://localhost:5000/authors/{from_author['control_number']}"
            ),
            "to_author_url": (
                f"http://localhost:5000/authors/{to_author['control_number']}"
            ),
            "incompatibile_names_papers": {
                f"http://localhost:5000/literature/{literature_2['control_number']}": (
                    "Aad, Georges"
                ),
                f"http://localhost:5000/literature/{literature_1['control_number']}": (
                    "Aad, Georges"
                ),
            },
            "already_claimed_papers": [],
        },
        "Claims by user Michal Mata require curator action",
    )
    assert response_status_code == 200


def test_literature_assign_check_names_compatibility_unambiguous_last_name(inspire_app):
    author_profile_oricd = "0000-0001-8829-5461"
    user = create_user(role="user", orcid=author_profile_oricd)
    author_profile_data = {
        "name": {"value": "Axelsen, Viktor", "preferred_name": "Axelsen, Viktor"},
        "ids": [
            {"value": "V.Axelsen.1", "schema": "INSPIRE BAI"},
            {"schema": "ORCID", "value": author_profile_oricd},
        ],
    }

    create_record("aut", data=author_profile_data)

    author_data = {
        "name": {"value": "Axelsen, Victor", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }

    author = create_record("aut", data=author_data)
    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Axelsen, Victor",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/assign/check-names-compatibility?literature_recid={literature_1['control_number']}",
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json["matched_author_recid"] == author["control_number"]


def test_literature_assign_check_names_compatibility_unambiguous_full_name(inspire_app):
    author_profile_oricd = "0000-0001-8829-5461"
    user = create_user(role="user", orcid=author_profile_oricd)
    author_profile_data = {
        "name": {"value": "Axelsen, Viktor", "preferred_name": "Axelsen, Viktor"},
        "ids": [
            {"value": "V.Axelsen.1", "schema": "INSPIRE BAI"},
            {"schema": "ORCID", "value": author_profile_oricd},
        ],
    }

    create_record("aut", data=author_profile_data)

    author_data = {
        "name": {"value": "Axelsen, Victor"},
        "ids": [{"value": "V.Axelsen.2", "schema": "INSPIRE BAI"}],
    }

    author = create_record("aut", data=author_data)

    author_data_2 = {
        "name": {"value": "Axelsen, Viktor"},
        "ids": [{"value": "V.Axelsen.3", "schema": "INSPIRE BAI"}],
    }

    author_2 = create_record("aut", data=author_data_2)

    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Axelsen, Victor",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Axelsen, Viktor",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author_2['control_number']}"
                    },
                },
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/assign/check-names-compatibility?literature_recid={literature_1['control_number']}",
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json["matched_author_recid"] == author_2["control_number"]


def test_literature_assign_check_names_compatibility_unambiguous_with_initials(
    inspire_app,
):
    author_profile_oricd = "0000-0001-8829-5461"
    user = create_user(role="user", orcid=author_profile_oricd)
    author_profile_data = {
        "name": {"value": "Axelsen, Viktor A.", "preferred_name": "Axelsen, Viktor"},
        "ids": [
            {"value": "V.Axelsen.1", "schema": "INSPIRE BAI"},
            {"schema": "ORCID", "value": author_profile_oricd},
        ],
    }

    create_record("aut", data=author_profile_data)

    author_data = {
        "name": {"value": "Axelsen, Viktor Anders"},
        "ids": [{"value": "V.Axelsen.2", "schema": "INSPIRE BAI"}],
    }

    author = create_record("aut", data=author_data)

    author_data_2 = {
        "name": {"value": "Axelsen, Viktor"},
        "ids": [{"value": "V.Axelsen.3", "schema": "INSPIRE BAI"}],
    }

    author_2 = create_record("aut", data=author_data_2)

    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Axelsen, Viktor Anders",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Axelsen, Viktor",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author_2['control_number']}"
                    },
                },
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/assign/check-names-compatibility?literature_recid={literature_1['control_number']}",
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response.json["matched_author_recid"] == author["control_number"]


def test_literature_assign_check_names_compatibility_ambiguous_match(inspire_app):
    author_profile_oricd = "0000-0001-8829-5461"
    user = create_user(role="user", orcid=author_profile_oricd)
    author_profile_data = {
        "name": {"value": "Axelsen, Viktor A.", "preferred_name": "Axelsen, Viktor"},
        "ids": [
            {"value": "V.Axelsen.1", "schema": "INSPIRE BAI"},
            {"schema": "ORCID", "value": author_profile_oricd},
        ],
    }

    create_record("aut", data=author_profile_data)

    author_data = {
        "name": {"value": "Axelsen, Viktor Anders"},
        "ids": [{"value": "V.Axelsen.2", "schema": "INSPIRE BAI"}],
    }

    author = create_record("aut", data=author_data)

    author_data_2 = {
        "name": {"value": "Axelsen, Viktor Anton"},
        "ids": [{"value": "V.Axelsen.3", "schema": "INSPIRE BAI"}],
    }

    author_2 = create_record("aut", data=author_data_2)

    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Axelsen, Viktor Anders",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Axelsen, Viktor Anton",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author_2['control_number']}"
                    },
                },
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/assign/check-names-compatibility?literature_recid={literature_1['control_number']}",
            content_type="application/json",
        )
        assert response.status_code == 404
        assert response.json["message"] == "Not found"


def test_literature_assign_check_names_compatibility_no_match(inspire_app):
    author_profile_oricd = "0000-0001-8829-5461"
    user = create_user(role="user", orcid=author_profile_oricd)
    author_profile_data = {
        "name": {"value": "Axelsen, Viktor", "preferred_name": "Axelsen, Viktor"},
        "ids": [
            {"value": "V.Axelsen.1", "schema": "INSPIRE BAI"},
            {"schema": "ORCID", "value": author_profile_oricd},
        ],
    }

    create_record("aut", data=author_profile_data)

    author_data = {
        "name": {"value": "Antonsen, Anders", "preferred_name": "Anders Antonsen"},
        "ids": [{"value": "A.Antonsen.1", "schema": "INSPIRE BAI"}],
    }

    create_record("aut", data=author_data)
    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Vittingus, Hans Christian",
                    "record": {"$ref": "http://localhost:5000/api/authors/123456"},
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/assign/check-names-compatibility?literature_recid={literature_1['control_number']}",
            content_type="application/json",
        )
        assert response.status_code == 404
        assert response.json["message"] == "Not found"


@mock.patch("inspirehep.assign.tasks.async_create_ticket_with_template")
def test_assign_author_has_main_name(mock_create_ticket, inspire_app):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }
    author_data_2 = {
        "name": {
            "preferred_name": "Michal Mata",
            "name_variants": ["Malta Michaela"],
            "value": "Mata, Michaela",
        },
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut", data=author_data)
    from_author_control_number = from_author["control_number"]

    to_author = create_record("aut", data=author_data_2)
    to_author_control_number = to_author["control_number"]

    literature_1 = create_record(
        "lit",
        data={
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
    literature_1_control_number = literature_1["control_number"]
    literature_2 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Aad, Georges",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                }
            ],
        },
    )
    literature_2_control_number = literature_2["control_number"]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/literature/assign-different-profile",
            data=orjson.dumps(
                {
                    "literature_ids": [
                        literature_1_control_number,
                        literature_2_control_number,
                    ],
                    "from_author_recid": from_author["control_number"],
                    "to_author_recid": to_author["control_number"],
                }
            ),
            content_type="application/json",
        )
    response_status_code = response.status_code
    expected_result = (
        "Author claims",
        None,
        "snow/assign_authors_from_different_profile.html",
        {
            "to_author_names": [
                "Malta Michaela",
                "Mata, Michaela",
            ],
            "from_author_url": (
                f"http://localhost:5000/authors/{from_author_control_number}"
            ),
            "to_author_url": (
                f"http://localhost:5000/authors/{to_author_control_number}"
            ),
            "incompatibile_names_papers": {
                f"http://localhost:5000/literature/{literature_1_control_number}": (
                    "Aad, Georges"
                ),
                f"http://localhost:5000/literature/{literature_2_control_number}": (
                    "Aad, Georges"
                ),
            },
            "already_claimed_papers": [
                f"http://localhost:5000/literature/{literature_2_control_number}"
            ],
        },
        "Claims by user Michal Mata require curator action",
    )
    assert mock_create_ticket.mock_calls[0][1] == expected_result
    assert response_status_code == 200
    assert "created_rt_ticket" in response.json


@pytest.mark.xfail(
    reason="Disambiguation is running in the background, so the record is actually found now"
)
def test_literature_assign_check_names_compatibility_when_no_record_in_matched_author(
    inspire_app,
):
    author_profile_oricd = "0000-0001-8829-5461"
    user = create_user(role="user", orcid=author_profile_oricd)
    author_profile_data = {
        "name": {"value": "Axelsen, Viktor A.", "preferred_name": "Axelsen, Viktor"},
        "ids": [
            {"schema": "ORCID", "value": author_profile_oricd},
        ],
    }

    create_record("aut", data=author_profile_data, without_author_refs=True)

    literature_1 = create_record(
        "lit",
        without_author_refs=True,
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Axelsen, Viktor A.",
                },
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/assign/check-names-compatibility?literature_recid={literature_1['control_number']}",
            content_type="application/json",
        )
        assert response.status_code == 404
        assert response.json["message"] == "Not found"


@mock.patch("inspirehep.assign.tasks.async_create_ticket_with_template")
def test_assign_author_calls_create_rt_ticket_for_claiming_action_when_some_args_not_in_payload(
    mock_create_ticket, inspire_app
):
    cataloger = create_user(role="cataloger")
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }
    author_data_2 = {
        "name": {
            "preferred_name": "Viktor Axelsen",
            "name_variants": ["Viktor Axelsen"],
            "value": "Axelsen, Viktor",
        },
        "ids": [{"value": "M.Matczak.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut", data=author_data)
    to_author = create_record("aut", data=author_data_2)
    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
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

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.post(
            "/assign/literature/assign-different-profile",
            data=orjson.dumps(
                {
                    "literature_ids": [
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
        "Author claims",
        None,
        "snow/assign_authors_from_different_profile.html",
        {
            "to_author_names": ["Viktor Axelsen", "Axelsen, Viktor"],
            "from_author_url": (
                f"http://localhost:5000/authors/{from_author['control_number']}"
            ),
            "to_author_url": (
                f"http://localhost:5000/authors/{to_author['control_number']}"
            ),
            "incompatibile_names_papers": {
                f"http://localhost:5000/literature/{literature_1['control_number']}": (
                    "Aad, Georges"
                )
            },
            "already_claimed_papers": [],
        },
        "Claims by user Viktor Axelsen require curator action",
    )
    assert response_status_code == 200

    assert "created_rt_ticket" in response.json


def test_assign_regression(inspire_app, override_config):
    author = create_record("aut")
    create_record(
        "lit",
        data={"authors": [{"full_name": "Test, Author"}]},
    )

    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        cataloger = create_user(role=Roles.cataloger.value)

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=cataloger.email)
            response = client.post(
                "/api/assign/literature/unassign",
                data=orjson.dumps(
                    {
                        "literature_ids": [str(2171912)],
                        "from_author_recid": author["control_number"],
                    }
                ),
                content_type="application/json",
            )
        response_status_code = response.status_code

    assert response_status_code == 200
    assert "stub_author_id" in response.json
    stub_author_id = response.json["stub_author_id"]
    stub_author_record = AuthorsRecord.get_record_by_pid_value(stub_author_id)
    assert stub_author_record["name"] == author["name"]
