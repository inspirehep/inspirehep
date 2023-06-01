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
            f"/curation/literature/{record['control_number']}/keywords",
            content_type="application/json",
            data=orjson.dumps({"keywords": ["Deep Learning"]}),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["keywords"] == [
        {"value": "Deep Learning", "schema": "INSPIRE"}
    ]


def test_add_keywords_adds_energy_ranges(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f"/curation/literature/{record['control_number']}/keywords",
            content_type="application/json",
            data=orjson.dumps({"energy_ranges": ["> 10 TeV"]}),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["energy_ranges"] == ["> 10 TeV"]


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
            f"/curation/literature/{record['control_number']}/keywords",
            content_type="application/json",
            data=orjson.dumps({"_desy_bookkeeping": {"identifier": "DA17-kp43aa"}}),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["_desy_bookkeeping"] == expected_desy_bookkeeping_value


def test_add_keywords_adds_keywords_update_desy_bookkeeping_and_energy_ranges(
    inspire_app,
):
    user = create_user(role=Roles.cataloger.value)
    record = create_record(
        "lit",
        data={
            "_desy_bookkeeping": [
                {"date": "2017-10-16", "expert": "3", "status": "printed"}
            ],
            "keywords": [{"value": "Machine learning", "source": "author"}],
            "energy_ranges": ["> 10 TeV"],
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

    expected_energy_ranges = ["0-3 GeV", "3-10 GeV"]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f"/curation/literature/{record['control_number']}/keywords",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "_desy_bookkeeping": {"identifier": "DA17-kp43aa"},
                    "keywords": ["Deep Learning"],
                    "energy_ranges": ["0-3 GeV", "3-10 GeV"],
                }
            ),
        )
    updated_record = LiteratureRecord.get_record_by_pid_value(record["control_number"])

    assert response.status_code == 200
    assert updated_record["_desy_bookkeeping"] == expected_desy_bookkeeping_value
    assert updated_record["keywords"] == expected_keywords_value
    assert updated_record["energy_ranges"] == expected_energy_ranges


def test_add_keywords_raise_error_when_no_keywords_or_desy_info_or_energy_ranges_provided(
    inspire_app,
):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f"/curation/literature/{record['control_number']}/keywords",
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
            f"/curation/literature/{record['control_number']}/keywords",
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
            f"/curation/literature/{record['control_number']}/keywords",
            content_type="application/json",
            data=orjson.dumps(
                {"_desy_bookkeeping": [{"value": "Test", "source": "curation"}]}
            ),
        )

    assert response.status_code == 400
    assert (
        response.json["message"] == "Incorrect input type for fields: _desy_bookkeeping"
    )


def test_add_keywords_raise_error_when_energy_ranges_in_wrong_format(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.put(
            f"/curation/literature/{record['control_number']}/keywords",
            content_type="application/json",
            data=orjson.dumps(
                {"energy_ranges": [{"value": "Test", "source": "curation"}]}
            ),
        )

    assert response.status_code == 400
    assert response.json["message"] == "Incorrect input type for fields: energy_ranges"


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
            f"/curation/literature/{record['control_number']}/keywords",
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


def test_normalize_collaborations_happy_flow(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record = create_record(
        "exp",
        data={
            "name_variants": ["CYRK"],
            "legacy_name": "CYRK-01",
            "collaboration": {
                "value": "Particle Data Group",
            },
        },
    )
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/collaborations-normalization",
            content_type="application/json",
            data=orjson.dumps(
                {"collaborations": [{"value": "CYRK"}], "workflow_id": 1}
            ),
        )
    assert response.status_code == 200
    assert response.json["accelerator_experiments"] == [
        {"record": record["self"], "legacy_name": record["legacy_name"]}
    ]
    assert response.json["normalized_collaborations"][0]["record"] == record["self"]


def test_normalize_collaborations_happy_flow_collaboration_not_matched(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/collaborations-normalization",
            content_type="application/json",
            data=orjson.dumps(
                {"collaborations": [{"value": "CYRK"}], "workflow_id": 1}
            ),
        )
        assert not response.json["accelerator_experiments"]
        assert "record" not in response.json["normalized_collaborations"][0]


def test_normalize_collaborations_returns_403_for_non_authorized(inspire_app):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/collaborations-normalization",
            content_type="application/json",
            data=orjson.dumps(
                {"collaborations": [{"value": "CYRK"}], "workflow_id": 1}
            ),
        )
    assert response.status_code == 403


def test_normalize_affiliations_happy_flow(inspire_app):
    institution = create_record(
        "ins", data={"legacy_ICN": "Warsaw U.", "ICN": ["Warsaw U."]}
    )
    create_record(
        "lit",
        data={
            "curated": True,
            "authors": [
                {
                    "full_name": "Test, A.",
                    "affiliations": [
                        {"value": "Warsaw U.", "record": institution["self"]}
                    ],
                    "raw_affiliations": [{"value": "Warsaw U. blah blah"}],
                }
            ],
        },
    )
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/affiliations-normalization",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "authors": [
                        {
                            "full_name": "Test, Auth.",
                            "raw_affiliations": [{"value": "Warsaw U."}],
                        }
                    ],
                    "workflow_id": 1,
                }
            ),
        )
    assert response.status_code == 200
    assert response.json["normalized_affiliations"]
    assert not response.json["ambiguous_affiliations"]


def test_normalize_affiliations_happy_flow_no_affiliations_matched(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/affiliations-normalization",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "authors": [
                        {
                            "full_name": "Test, Auth.",
                            "raw_affiliations": [{"value": "Warsaw U."}],
                        }
                    ],
                    "workflow_id": 1,
                }
            ),
        )
    assert response.status_code == 200
    assert not response.json["normalized_affiliations"][0]
    assert response.json["ambiguous_affiliations"] == ["Warsaw U."]


def test_normalize_affiliations_returns_403_for_non_authorized(inspire_app):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/affiliations-normalization",
            content_type="application/json",
            data=orjson.dumps({"authors": [{"value": "CYRK"}], "workflow_id": 1}),
        )
    assert response.status_code == 403


def test_assign_institutions_happy_flow(inspire_app):
    create_record("ins", data={"legacy_ICN": "Warsaw U."})
    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/assign-institutions",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "authors": [
                        {
                            "full_name": "Test, Auth.",
                            "affiliations": [{"value": "Warsaw U."}],
                        }
                    ],
                }
            ),
        )
    assert response.status_code == 200
    assert response.json["authors"][0]["affiliations"][0]["record"]


def test_assign_institutions_returns_403_for_non_authorized(inspire_app):
    create_record("ins", data={"legacy_ICN": "Warsaw U."})
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "/curation/literature/assign-institutions",
            content_type="application/json",
            data=orjson.dumps(
                {
                    "authors": [
                        {
                            "full_name": "Test, Auth.",
                            "affiliations": [{"value": "Warsaw U."}],
                        }
                    ],
                }
            ),
        )
    assert response.status_code == 403
