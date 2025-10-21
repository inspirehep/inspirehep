#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import os

import orjson
import pkg_resources
import pytest
import requests
import requests_mock
from flask import current_app
from helpers.utils import (
    create_record,
    create_user,
    create_user_and_token,
    filter_out_authentication,
    filter_out_user_data_and_cookie_headers,
)
from inspire_schemas.api import load_schema, validate
from inspire_utils.record import get_value
from inspirehep.accounts.roles import Roles
from inspirehep.files.proxies import current_s3_instance
from inspirehep.snow.api import InspireSnow
from invenio_accounts.testutils import login_user_via_session
from mock import patch
from redis import StrictRedis
from werkzeug.datastructures import FileStorage


def test_get_record_and_schema(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    conference = create_record("con")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.get(f"api/editor/conferences/{conference['control_number']}")

    assert response.status_code == 200

    response_data = orjson.loads(response.data)
    record_metadata = response_data["record"]["metadata"]
    schema = response_data["schema"]

    assert record_metadata == dict(conference)
    assert schema == load_schema("conferences")


def test_get_record_and_schema_for_redirected_record(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    redirected_record = create_record("lit")
    record = create_record(
        "lit", data={"deleted_records": [dict(redirected_record["self"])]}
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        response = client.get(
            f"api/editor/literature/{redirected_record['control_number']}"
        )

    assert response.status_code == 200

    response_data = orjson.loads(response.data)
    record_metadata = response_data["record"]["metadata"]
    schema = response_data["schema"]

    expected_record_metadata = dict(redirected_record)
    expected_record_metadata["deleted"] = True
    expected_record_metadata["new_record"] = {"$ref": record["self"]["$ref"]}
    assert record_metadata == dict(expected_record_metadata)
    assert schema == load_schema("hep")


def test_get_record_and_schema_requires_cataloger_logged_in(inspire_app):
    user = create_user()
    conference = create_record("con")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"api/editor/conferences/{conference['control_number']}")

    assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_create_snow_ticket(inspire_app, override_config):
    user = create_user(role=Roles.cataloger.value, email="marcjanna.jedrych@cern.ch")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/literature/1497201/rt/tickets/create",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "description": "description",
                    "queue": "Test",
                    "recid": "4328",
                    "subject": "subject",
                    "owner": "Marcjanna Jedrych",
                }
            ),
        )

    assert response.status_code == 200
    assert "id" in response.json["data"]
    assert "link" in response.json["data"]
    ticket = InspireSnow().get_ticket(response.json["data"]["id"])
    assert "assigned_to" in ticket


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_create_snow_ticket_only_needs_queue_and_recid(inspire_app, override_config):
    user = create_user(role=Roles.cataloger.value, email="marcjanna.jedrych@cern.ch")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/literature/1497201/rt/tickets/create",
            content_type="application/json",
            data=orjson.dumps({"queue": "Test", "recid": "4328"}),
        )

    assert response.status_code == 200
    assert "id" in response.json["data"]
    assert "link" in response.json["data"]


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@patch("inspirehep.snow.api.requests.put")
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_create_snow_ticket_returns_500_on_error(
    mocked_update_ticket_with_inspire_recid,
    inspire_app,
    override_config,
):
    with override_config(SNOW_URL="https://non-existing-url.com"):
        user = create_user(role=Roles.cataloger.value)
        mocked_update_ticket_with_inspire_recid.side_effect = (
            requests.exceptions.HTTPError
        )

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.post(
                "api/editor/literature/1497201/rt/tickets/create",
                content_type="application/json",
                data=orjson.dumps(
                    {
                        "description": "description",
                        "owner": "owner",
                        "queue": "queue",
                        "recid": "4328",
                        "subject": "subject",
                    }
                ),
            )

        assert response.status_code == 500

        expected = {"success": False}
        result = orjson.loads(response.data)

        assert expected == result


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_resolve_snow_ticket(inspire_app, override_config):
    user = create_user(role=Roles.cataloger.value, email="marcjanna.jedrych@cern.ch")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/editor/literature/1497201/rt/tickets/d6d1901387ece11084e9ac1a0cbb352b/resolve"
        )

    assert response.status_code == 200

    expected = {"success": True}
    result = orjson.loads(response.data)

    assert expected == result


@pytest.mark.usefixtures("_mocked_inspire_snow")
def test_resolve_snow_ticket_returns_403_on_authentication_error(
    inspire_app, override_config
):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/literature/1497201/rt/tickets/4328/resolve")

    assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_snow_tickets_for_record(inspire_app, override_config):
    user = create_user(role=Roles.cataloger.value, email="marcjanna.jedrych@cern.ch")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/literature/12349919/rt/tickets/create",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "description": "description",
                    "queue": "Test",
                    "recid": "12349919",
                    "subject": "subject",
                }
            ),
        )

    assert response.status_code == 200
    response = client.get("api/editor/literature/12349919/rt/tickets")
    assert response.status_code == 200
    assert len(response.json) == 1


def test_get_tickets_for_record_returns_403_on_authentication_error(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/literature/1497201/rt/tickets")

    assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_snow_users(inspire_app, override_config):
    user = create_user(role=Roles.cataloger.value, email="marcjanna.jedrych@cern.ch")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/users")

    assert response.status_code == 200
    assert len(response.json) > 1
    assert next((user.email == snow_user["email"] for snow_user in response.json), None)


@pytest.mark.usefixtures("_mocked_inspire_snow")
def test_get_snow_users_returns_403_on_authentication_error(
    inspire_app, override_config
):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/users")

    assert response.status_code == 403


@pytest.mark.usefixtures("_mocked_inspire_snow")
def test_get_snow_functional_categories_returns_403_on_authentication_error(
    inspire_app, override_config
):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/queues")

    assert response.status_code == 403


@pytest.mark.vcr(
    filter_headers=["authorization", "Set-Cookie"],
    before_record_request=filter_out_authentication,
    before_record_response=filter_out_user_data_and_cookie_headers(),
)
@pytest.mark.usefixtures("_mocked_inspire_snow", "_teardown_cache")
def test_get_snow_functional_categories(inspire_app, override_config):
    user = create_user(role=Roles.cataloger.value, email="marcjanna.jedrych@cern.ch")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/editor/rt/queues")

    assert response.status_code == 200
    assert len(response.json) > 1
    assert "name" in response.json[0]
    assert "id" in response.json[1]


def test_refextract_text_with_refextract(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]

    user = create_user(role=Roles.cataloger.value)

    data = {
        "journal_title": {"title": "JHEP"},
        "short_title": "JHEP",
    }
    create_record("jou", data=data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/refextract/text",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "text": (
                        "[27] K. Ito, H. Nakajima, T. Saka, and S. Sasaki,"
                        " “Instanton Calculus in Deformed N=4 Super Yang-Mills"
                        " Theories,” JHEP 10 (2009) 028, arXiv:0908.4339"
                        " [hep-th]."
                    )
                }
            ),
        )
    references = orjson.loads(response.data)
    title_list = get_value(
        {"references": references},
        "references.reference.publication_info.journal_title",
    )

    assert response.status_code == 200
    assert validate(references, subschema) is None
    assert "JHEP" in title_list


@patch(
    "inspirehep.editor.views.extract_references_from_file_url",
    autospec=True,
)
def test_refextract_url_with_refextract(mock_extract, inspire_app):
    mock_extract.return_value = {
        "extracted_references": [
            {
                "author": ["K. Ito, H. Nakajima, T. Saka, and S. Sasaki"],
                "journal_page": ["028"],
                "journal_reference": ["JHEP,0910,028"],
                "journal_title": ["JHEP"],
                "journal_volume": ["0910"],
                "journal_year": ["2009"],
                "linemarker": ["27"],
                "raw_ref": [
                    "[27] K. Ito, H. Nakajima, T. Saka, and S. Sasaki,"
                    " “Instanton Calculus in Deformed N=4 Super Yang-Mills"
                    " Theories,” JHEP 10 (2009) 028, arXiv:0908.4339 [hep-th]."
                ],
                "reportnumber": ["arXiv:0908.4339 [hep-th]"],
                "title": [
                    "Instanton Calculus in Deformed N=4 Super Yang-Mills Theories"
                ],
                "year": ["2009"],
            }
        ]
    }
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]
    user = create_user(role=Roles.cataloger.value)
    es_response = {
        "_shards": {"failed": 0, "skipped": 0, "successful": 5, "total": 5},
        "hits": {"hits": [], "max_score": None, "total": 0},
        "timed_out": False,
        "took": 4,
    }

    with requests_mock.Mocker() as requests_mocker:
        requests_mocker.register_uri(
            "GET",
            "https://arxiv.org/pdf/1612.06414.pdf",
            content=pkg_resources.resource_string(
                __name__, os.path.join("fixtures", "1612.06414.pdf")
            ),
        )
        requests_mocker.register_uri(
            "GET",
            "http://test-indexer:9200/records-hep/hep/_search?_source=control_number",
            json=es_response,
        )

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.post(
                "api/editor/refextract/url",
                content_type="application/json",
                data=orjson.dumps({"url": "https://arxiv.org/pdf/1612.06414.pdf"}),
            )
        references = orjson.loads(response.data)
    assert response.status_code == 200
    assert validate(references, subschema) is None
    assert get_value(
        {"references": references},
        "references.reference.publication_info.journal_title",
    )


def test_file_upload(inspire_app, s3, datadir, override_config):
    current_s3_instance.client.create_bucket(Bucket="inspire-editor")
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with (
        override_config(EDITOR_UPLOAD_ALLOWED_EXTENSIONS=".pdf"),
        inspire_app.test_client() as client,
        open(f"{datadir}/test.pdf", "rb") as file_pdf,
    ):
        login_user_via_session(client, email=user.email)
        bytes_file = FileStorage(file_pdf)
        data = {"file": bytes_file}
        response = client.post(
            "/editor/literature/{}/upload".format(record["control_number"]), data=data
        )
        expected_status_code = 200
        assert expected_status_code == response.status_code
        assert "path" in response.json


def test_file_upload_without_a_file(inspire_app, s3, datadir):
    current_s3_instance.client.create_bucket(Bucket="inspire-editor")
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/literature/{}/upload".format(record["control_number"])
        )

    expected_status_code = 400
    assert expected_status_code == response.status_code


def test_file_upload_with_wrong_mimetype(inspire_app, s3, datadir, override_config):
    current_s3_instance.client.create_bucket(Bucket="inspire-editor")
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with (
        override_config(EDITOR_UPLOAD_ALLOWED_EXTENSIONS=".pdf"),
        inspire_app.test_client() as client,
        open(f"{datadir}/test.txt", "rb") as file_txt,
    ):
        login_user_via_session(client, email=user.email)
        bytes_file = FileStorage(file_txt)
        data = {"file": bytes_file}
        response = client.post(
            "/editor/literature/{}/upload".format(record["control_number"]), data=data
        )

    expected_status_code = 400
    assert expected_status_code == response.status_code


def test_file_upload_without_permissions(inspire_app, s3, datadir):
    current_s3_instance.client.create_bucket(Bucket="inspire-editor")
    record = create_record("lit")
    with (
        inspire_app.test_client() as client,
        open(f"{datadir}/test.pdf", "rb") as file_pdf,
    ):
        bytes_file = FileStorage(file_pdf)
        data = {"file": bytes_file}
        response = client.post(
            "/editor/literature/{}/upload".format(record["control_number"]), data=data
        )

    expected_status_code = 401
    assert expected_status_code == response.status_code


def test_file_upload_with_read_write_access(inspire_app, s3, datadir, override_config):
    current_s3_instance.client.create_bucket(Bucket="inspire-editor")
    hidden_collection = "HEP Hidden"
    hidden_collection_role_prefix = hidden_collection.lower().replace(" ", "-")
    user = create_user(role=f"{hidden_collection_role_prefix}-read-write")
    record = create_record("lit", data={"_collections": [hidden_collection]})
    token_readwrite = create_user_and_token(
        user_role=f"{hidden_collection_role_prefix}-read-write"
    )
    headers_readwrite = {
        "Authorization": "BEARER " + token_readwrite.access_token,
        "If-Match": '"0"',
    }

    with (
        override_config(EDITOR_UPLOAD_ALLOWED_EXTENSIONS=".pdf"),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        with open(f"{datadir}/test.pdf", "rb") as file_pdf:
            bytes_file = FileStorage(file_pdf)
            data = {"file": bytes_file}
            response = client.post(
                "/editor/literature/{}/upload".format(record["control_number"]),
                data=data,
                headers=headers_readwrite,
            )

        expected_status_code = 200
        assert expected_status_code == response.status_code
        assert "path" in response.json


def test_file_upload_with_read_access(inspire_app, s3, datadir, override_config):
    current_s3_instance.client.create_bucket(Bucket="inspire-editor")
    hidden_collection = "HEP Hidden"
    hidden_collection_role_prefix = hidden_collection.lower().replace(" ", "-")
    user = create_user(role=f"{hidden_collection_role_prefix}-read")
    record = create_record("lit", data={"_collections": [hidden_collection]})
    token_readwrite = create_user_and_token(
        user_role=f"{hidden_collection_role_prefix}-read"
    )
    headers_readwrite = {
        "Authorization": "BEARER " + token_readwrite.access_token,
        "If-Match": '"0"',
    }

    with (
        override_config(EDITOR_UPLOAD_ALLOWED_EXTENSIONS=".pdf"),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        with open(f"{datadir}/test.pdf", "rb") as file_pdf:
            bytes_file = FileStorage(file_pdf)
            data = {"file": bytes_file}
            response = client.post(
                "/editor/literature/{}/upload".format(record["control_number"]),
                data=data,
                headers=headers_readwrite,
            )

        expected_status_code = 403
        assert expected_status_code == response.status_code


def test_authorlist_text(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/text",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "text": (
                        "F. Lastname1, F.M. Otherlastname1,2\n"
                        "\n"
                        "1 CERN\n"
                        "2 Otheraffiliation"
                    )
                }
            ),
        )

    assert response.status_code == 200

    expected = {
        "authors": [
            {"full_name": "Lastname, F.", "raw_affiliations": [{"value": "CERN"}]},
            {
                "full_name": "Otherlastname, F.M.",
                "raw_affiliations": [{"value": "CERN"}, {"value": "Otheraffiliation"}],
            },
        ]
    }
    result = orjson.loads(response.data)

    assert validate(result["authors"], subschema) is None
    assert expected == result


def test_authorlist_xml(inspire_app, datadir):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)
    xml_content = (datadir / "author_list.xml").read_text()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/xml",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "xml": xml_content,
                }
            ),
        )

    assert response.status_code == 200
    expected = {
        "authors": [
            {
                "full_name": "Vázquez Finger, Michael, Jr.",
                "affiliations": [{"value": "CERN"}],
                "ids": [
                    {"value": "INSPIRE-00171357", "schema": "INSPIRE ID"},
                    {"value": "CERN-391883", "schema": "CERN"},
                    {"value": "0000-0003-3155-2484", "schema": "ORCID"},
                ],
            }
        ]
    }
    result = orjson.loads(response.data)

    assert validate(result["authors"], subschema) is None
    assert expected == result


def test_authorlist_xml_normalizing_affiliations(inspire_app, datadir):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)
    xml_content = (datadir / "author_list.xml").read_text()
    record = create_record("ins", data={"legacy_ICN": "CERN"})
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)

        response = client.post(
            "/editor/authorlist/xml",
            content_type="application/json",
            data=orjson.dumps({"xml": xml_content}),
        )

    assert response.status_code == 200

    expected = {
        "authors": [
            {
                "full_name": "Vázquez Finger, Michael, Jr.",
                "affiliations": [
                    {
                        "value": "CERN",
                        "record": {
                            "$ref": f"http://localhost:5000/api/institutions/{record['control_number']}"
                        },
                    }
                ],
                "ids": [
                    {"value": "INSPIRE-00171357", "schema": "INSPIRE ID"},
                    {"value": "CERN-391883", "schema": "CERN"},
                    {"value": "0000-0003-3155-2484", "schema": "ORCID"},
                ],
            }
        ]
    }
    result = orjson.loads(response.data)

    assert validate(result["authors"], subschema) is None
    assert expected == result


def test_authorlist_xml_exceptions(inspire_app):
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)

        response = client.post(
            "/editor/authorlist/xml",
            content_type="application/json",
            data=orjson.dumps({"xml": ""}),
        )

    assert response.status_code == 400
    expected = {
        "message": "Document is empty, line 1, column 1",
        "status": 400,
    }
    result = orjson.loads(response.data)

    assert expected == result


def test_authorlist_text_exception(inspire_app):
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/text",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "text": (
                        "F. Lastname1, F.M. Otherlastname1,2\n"
                        "\n"
                        "CERN\n"
                        "2 Otheraffiliation"
                    )
                }
            ),
        )

    assert response.status_code == 400

    expected = {
        "message": "Cannot identify type of affiliations, found IDs: ['C', '2']",
        "status": 400,
    }
    result = orjson.loads(response.data)

    assert expected == result


def test_authorlist_text_is_normalizing_affiliaitons(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)

    create_record(
        "lit",
        data={
            "curated": True,
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Mangiarotti, F.J.",
                    "raw_affiliations": [
                        {
                            "value": (
                                "CERN European Organization for Nuclear Research, 1211,"
                                " Geneva 23, Switzerland"
                            ),
                            "source": "Elsevier Ltd",
                        }
                    ],
                    "affiliations": [
                        {
                            "value": "CERN",
                            "record": {
                                "$ref": (
                                    "https://inspirebeta.net/api/institutions/902725"
                                )
                            },
                        }
                    ],
                }
            ],
        },
    )
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/text",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "text": (
                        "F. Lastname1, F.M. Otherlastname1,2\n"
                        "\n"
                        "1 CERN\n"
                        "2 Otheraffiliation"
                    )
                }
            ),
        )
    assert response.status_code == 200

    expected = {
        "authors": [
            {
                "full_name": "Lastname, F.",
                "raw_affiliations": [{"value": "CERN"}],
                "affiliations": [
                    {
                        "record": {
                            "$ref": "https://inspirebeta.net/api/institutions/902725"
                        },
                        "value": "CERN",
                    }
                ],
            },
            {
                "full_name": "Otherlastname, F.M.",
                "raw_affiliations": [{"value": "CERN"}, {"value": "Otheraffiliation"}],
                "affiliations": [
                    {
                        "record": {
                            "$ref": "https://inspirebeta.net/api/institutions/902725"
                        },
                        "value": "CERN",
                    }
                ],
            },
        ]
    }
    result = orjson.loads(response.data)

    assert validate(result["authors"], subschema) is None
    assert expected == result


def test_authorlist_text_is_normalizing_multiple_affiliaitons(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)

    create_record(
        "lit",
        data={
            "curated": True,
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Mangiarotti, F.J.",
                    "raw_affiliations": [
                        {
                            "value": (
                                "CERN European Organization for Nuclear Research, 1211,"
                                " Geneva 23, Switzerland"
                            ),
                            "source": "Elsevier Ltd",
                        }
                    ],
                    "affiliations": [
                        {
                            "value": "CERN",
                            "record": {
                                "$ref": (
                                    "https://inspirebeta.net/api/institutions/902725"
                                )
                            },
                        }
                    ],
                }
            ],
        },
    )

    create_record(
        "lit",
        data={
            "curated": True,
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Bednorz, Adam",
                    "affiliations": [
                        {
                            "value": "Warsaw U.",
                            "record": {
                                "$ref": (
                                    "https://inspirebeta.net/api/institutions/903335"
                                )
                            },
                        }
                    ],
                    "signature_block": "BADNARa",
                    "raw_affiliations": [
                        {
                            "value": (
                                "Faculty of Physics, University of Warsaw, ul. Pasteura"
                                " 5, PL02-093 Warsaw, Poland"
                            )
                        }
                    ],
                }
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/text",
            content_type="application/json",
            data=orjson.dumps(
                {"text": "F. Lastname1, F.M. Otherlastname2\n\n1 CERN\n2 Warsaw U."}
            ),
        )
    assert response.status_code == 200
    expected = {
        "authors": [
            {
                "full_name": "Lastname, F.",
                "raw_affiliations": [{"value": "CERN"}],
                "affiliations": [
                    {
                        "record": {
                            "$ref": "https://inspirebeta.net/api/institutions/902725"
                        },
                        "value": "CERN",
                    }
                ],
            },
            {
                "full_name": "Otherlastname, F.M.",
                "raw_affiliations": [{"value": "Warsaw U."}],
                "affiliations": [
                    {
                        "record": {
                            "$ref": "https://inspirebeta.net/api/institutions/903335"
                        },
                        "value": "Warsaw U.",
                    }
                ],
            },
        ]
    }
    result = orjson.loads(response.data)

    assert validate(result["authors"], subschema) is None
    assert expected == result


def test_editor_lock_is_created_on_editor_open(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    redis = StrictRedis.from_url(redis_url)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f'/api/editor/literature/{record["control_number"]}',
            content_type="application/json",
        )

    expected_editor_lock_name = (
        f"editor-lock:{record['control_number']}@{record.model.version_id}"
    )

    assert response.status_code == 200
    assert redis.hgetall(expected_editor_lock_name)


def test_editor_locks_are_passed_in_payload_when_another_user_editing(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    user_2 = create_user(role=Roles.cataloger.value)

    record = create_record("lit")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        client.get(
            f'/api/editor/literature/{record["control_number"]}',
            content_type="application/json",
        )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user_2.email)
        response_2 = client.get(
            f'/api/editor/literature/{record["control_number"]}',
            content_type="application/json",
        )
    assert "user_locks" in response_2.json
    assert response_2.json["user_locks"].startswith("Record opened by ")


def test_editor_locks_resolve(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    expected_editor_lock_name = (
        f"editor-lock:{record['control_number']}@{record.model.version_id}"
    )
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    redis = StrictRedis.from_url(redis_url)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        client.get(
            f'/api/editor/literature/{record["control_number"]}',
            content_type="application/json",
        )
        assert redis.hget(expected_editor_lock_name, user.email)
        client.post(
            f"""api/editor/literature/{record['control_number']}/lock/release""",
            content_type="application/json",
            data=orjson.dumps(record),
            headers={"ETag": '"W/"0"'},
        )

    assert not redis.hget(expected_editor_lock_name, user.email)


def test_refextract_text_dedupe_references(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]
    user = create_user(role=Roles.cataloger.value)
    schema = load_schema("hep")
    subschema = schema["properties"]["references"]
    user = create_user(role=Roles.cataloger.value)

    data = {
        "journal_title": {"title": "Journal of Testing"},
        "short_title": "J.Testing",
    }
    create_record("jou", data=data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/editor/refextract/text",
            content_type="application/json",
            data=orjson.dumps(
                {"text": "John Smith, Journal of Testing 42 (2020) 1234"}
            ),
        )

    references = orjson.loads(response.data)
    assert response.status_code == 200
    assert validate(references, subschema) is None
    assert len(references) == 1


@pytest.mark.vcr
def test_authorlist_url(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/url",
            content_type="application/json",
            data=orjson.dumps({"url": "https://arxiv.org/pdf/1612.06414.pdf"}),
        )
    assert response.status_code == 200
    result = orjson.loads(response.data)
    assert validate(result["authors"], subschema) is None
    expected = {
        "authors": [
            {
                "full_name": "Moskovic, Micha",
                "raw_affiliations": [
                    {
                        "value": (
                            "Università di Torino, Dipartimento di Fisica and I.N.F.N."
                            " -sezione di Torino, Via P. Giuria 1, I-10125 Torino,"
                            " Italy"
                        )
                    }
                ],
            },
            {
                "full_name": "Zein Assi, Ahmad",
            },
        ]
    }

    assert expected == result


def test_authorlist_url_exception(inspire_app):
    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/url",
            content_type="application/json",
            data=orjson.dumps(
                {"url": "https://grobid.readthedocs.io/en/latest/training/header/"}
            ),
        )

    assert response.status_code == 400


@pytest.mark.vcr
def test_authorlist_url_is_normalizing_affiliaitons(inspire_app):
    schema = load_schema("hep")
    subschema = schema["properties"]["authors"]
    user = create_user(role=Roles.cataloger.value)

    create_record(
        "lit",
        data={
            "curated": True,
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Moskovic, Micha",
                    "raw_affiliations": [
                        {
                            "value": (
                                "Università di Torino, Dipartimento di Fisica and"
                                " I.N.F.N. -sezione di Torino, Via P. Giuria 1, I-10125"
                                " Torino, Italy"
                            ),
                        }
                    ],
                    "affiliations": [
                        {
                            "value": "Università di Torino",
                            "record": {
                                "$ref": (
                                    "https://inspirebeta.net/api/institutions/902725"
                                )
                            },
                        }
                    ],
                }
            ],
        },
    )

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/editor/authorlist/url",
            content_type="application/json",
            data=orjson.dumps({"url": "https://arxiv.org/pdf/1612.06414.pdf"}),
        )
    assert response.status_code == 200

    expected = {
        "authors": [
            {
                "full_name": "Moskovic, Micha",
                "raw_affiliations": [
                    {
                        "value": (
                            "Università di Torino, Dipartimento di Fisica and I.N.F.N."
                            " -sezione di Torino, Via P. Giuria 1, I-10125 Torino,"
                            " Italy"
                        )
                    }
                ],
                "affiliations": [
                    {
                        "record": {
                            "$ref": "https://inspirebeta.net/api/institutions/902725"
                        },
                        "value": "Università di Torino",
                    }
                ],
            },
            {
                "full_name": "Zein Assi, Ahmad",
            },
        ]
    }
    result = orjson.loads(response.data)
    assert validate(result["authors"], subschema) is None
    assert expected == result
