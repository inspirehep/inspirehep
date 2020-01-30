# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from invenio_accounts.testutils import login_user_via_session
from marshmallow import utils

from inspirehep.accounts.roles import Roles


def test_conferences_json_without_login(api_client, db, create_record, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1185692.json").read_text())

    record = create_record("con", data=data)
    record_control_number = record["control_number"]

    expected_metadata = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "addresses": [{"cities": ["Kyoto"], "country": "Japan", "country_code": "JP"}],
        "closing_date": "2012-05-25",
        "cnum": "C12-05-21.5",
        "contact_details": [{"email": "fs4loc@konan-u.ac.jp"}],
        "control_number": 1185692,
        "deleted": False,
        "inspire_categories": [{"term": "Astrophysics"}],
        "legacy_creation_date": "2012-09-17",
        "legacy_version": "20161101104659.0",
        "opening_date": "2012-05-21",
        "self": {"$ref": "http://labs.inspirehep.net/api/conferences/1185692"},
        "series": [{"name": "First Stars", "number": 4}],
        "titles": [
            {"subtitle": "From Hayashi to the Future", "title": "First Stars IV"}
        ],
        "urls": [
            {
                "description": "web page",
                "value": "http://tpweb2.phys.konan-u.ac.jp/~FirstStar4/",
            }
        ],
        "number_of_contributions": 0,
    }
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get(f"/conferences/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_conferences_json_with_logged_in_cataloger(
    api_client, db, create_user, create_record, datadir
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    headers = {"Accept": "application/json"}

    data = {
        "$schema": "https://inspire/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "_private_notes": [{"value": "A private note"}],
        "titles": [{"title": "Great conference for HEP"}],
        "control_number": 1,
    }

    record = create_record("con", data=data)
    record_control_number = record["control_number"]

    expected_metadata = {
        "$schema": "https://inspire/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "_private_notes": [{"value": "A private note"}],
        "control_number": 1,
        "titles": [{"title": "Great conference for HEP"}],
        "number_of_contributions": 0,
    }

    response = api_client.get(f"/conferences/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_metadata == response_data_metadata


def test_conferences_detail(api_client, db, create_record, datadir):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "1185692.json").read_text())

    record = create_record("con", data=data)
    record_control_number = record["control_number"]

    expected_metadata = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "addresses": [{"cities": ["Kyoto"], "country": "Japan", "country_code": "JP"}],
        "closing_date": "2012-05-25",
        "cnum": "C12-05-21.5",
        "contact_details": [{"email": "fs4loc@konan-u.ac.jp"}],
        "control_number": 1185692,
        "deleted": False,
        "inspire_categories": [{"term": "Astrophysics"}],
        "legacy_creation_date": "2012-09-17",
        "legacy_version": "20161101104659.0",
        "opening_date": "2012-05-21",
        "self": {"$ref": "http://labs.inspirehep.net/api/conferences/1185692"},
        "series": [{"name": "First Stars", "number": 4}],
        "titles": [
            {"subtitle": "From Hayashi to the Future", "title": "First Stars IV"}
        ],
        "urls": [
            {
                "description": "web page",
                "value": "http://tpweb2.phys.konan-u.ac.jp/~FirstStar4/",
            }
        ],
        "number_of_contributions": 0,
    }
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get(f"/conferences/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_conferences_search_json(api_client, db, create_record, datadir):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "1185692.json").read_text())

    record = create_record("con", data=data)

    expected_result = {
        "addresses": [{"cities": ["Kyoto"], "country_code": "JP", "country": "Japan"}],
        "number_of_contributions": 0,
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "closing_date": "2012-05-25",
        "cnum": "C12-05-21.5",
        "contact_details": [{"email": "fs4loc@konan-u.ac.jp"}],
        "control_number": 1185692,
        "deleted": False,
        "inspire_categories": [{"term": "Astrophysics"}],
        "legacy_creation_date": "2012-09-17",
        "legacy_version": "20161101104659.0",
        "opening_date": "2012-05-21",
        "self": {"$ref": "http://labs.inspirehep.net/api/conferences/1185692"},
        "series": [{"name": "First Stars", "number": 4}],
        "titles": [
            {"subtitle": "From Hayashi to the Future", "title": "First Stars IV"}
        ],
        "urls": [
            {
                "description": "web page",
                "value": "http://tpweb2.phys.konan-u.ac.jp/~FirstStar4/",
            }
        ],
    }

    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get("/conferences", headers=headers)

    response_data_hit = json.loads(response.data)["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_proceedings_in_detail_page(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["proceedings"],
    }
    proceeding = create_record("lit", rec_data)

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }
    create_record("lit", rec_data)

    expected_metadata = {
        "number_of_contributions": 1,
        "$schema": "http://localhost:5000/schemas/records/conferences.json",
        "control_number": conference["control_number"],
        "proceedings": [{"control_number": proceeding["control_number"]}],
    }
    response = api_client.get(
        f"/conferences/{conference_control_number}", headers=headers
    )
    response_metadata = response.json["metadata"]
    assert expected_metadata == response_metadata
