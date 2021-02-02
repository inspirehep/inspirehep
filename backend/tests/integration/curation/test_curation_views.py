# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles
from inspirehep.records.api import LiteratureRecord


def test_add_keywords_replace_old_keywords_with_new(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record(
        "lit", data={"keywords": [{"value": "Machine learning", "schema": "INSPIRE"}]}
    )
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f""""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps({"keywords": ["Deep Learning"]}),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["keywords"] == [
        {"value": "Deep Learning", "schema": "INSPIRE"}
    ]


def test_add_keywords_updated_desy_bookkeeping(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record(
        "lit",
        data={
            "_desy_bookkeeping": [
                {"date": "2017-10-16", "expert": "3", "status": "printed"}
            ]
        },
    )
    expected_desy_bookkeeping_value = [
        {"date": "2017-10-16", "expert": "3", "status": "printed"},
        {"identifier": "DA17-kp43aa"},
    ]
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f""""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps({"_desy_bookkeeping": {"identifier": "DA17-kp43aa"}}),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["_desy_bookkeeping"] == expected_desy_bookkeeping_value


def test_add_keywords_adds_keywords_and_update_desy_bookkeeping(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record(
        "lit",
        data={
            "_desy_bookkeeping": [
                {"date": "2017-10-16", "expert": "3", "status": "printed"}
            ],
            "keywords": [{"value": "Machine learning", "source": "author"}],
        },
    )
    expected_desy_bookkeeping_value = [
        {"date": "2017-10-16", "expert": "3", "status": "printed"},
        {"identifier": "DA17-kp43aa"},
    ]
    expected_keywords_value = [
        {"value": "Machine learning", "source": "author"},
        {"value": "Deep Learning", "schema": "INSPIRE"},
    ]
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f"""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "_desy_bookkeeping": {"identifier": "DA17-kp43aa"},
                    "keywords": ["Deep Learning"],
                }
            ),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["_desy_bookkeeping"] == expected_desy_bookkeeping_value
    assert updated_record["keywords"] == expected_keywords_value


def test_add_keywords_raise_error_when_no_keywords_or_desy_info_provided(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f""""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps({"other_key": ["test"]}),
        )

    assert response.status_code == 400
    assert response.json["message"] == "None of required fields was passed"


def test_add_keywords_raise_error_when_keywords_in_wrong_format(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f""""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps({"keywords": {"value": "Test", "source": "curation"}}),
        )

    assert response.status_code == 400
    assert response.json["message"] == "Incorrect input type for fields: keywords"


def test_add_keywords_raise_error_when_desy_bookkeeping_in_wrong_format(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f""""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps(
                {"_desy_bookkeeping": [{"value": "Test", "source": "curation"}]}
            ),
        )

    assert response.status_code == 400
    assert (
        response.json["message"] == "Incorrect input type for fields: _desy_bookkeeping"
    )


def test_add_keyword_returns_validation_error(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record(
        "lit",
        data={
            "_desy_bookkeeping": [
                {"date": "2017-10-16", "expert": "3", "status": "printed"}
            ]
        },
    )
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f""""/curation/literature/{record["control_number"]}/keywords""",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "_desy_bookkeeping": {
                        "date": "2017-10-16",
                        "expert": "3",
                        "status": "printed",
                    }
                }
            ),
        )
    assert response.status_code == 400
    assert "has non-unique elements" in response.json["message"]
