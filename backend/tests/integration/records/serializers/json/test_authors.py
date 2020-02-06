# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_authors_detail(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "999108.json").read_text())

    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_id = str(record_control_number)
    expected_metadata = {
        "advisors": [
            {
                "degree_type": "other",
                "ids": [{"schema": "INSPIRE ID", "value": "INSPIRE-00070625"}],
                "name": "Callan, Curtis G.",
            }
        ],
        "arxiv_categories": ["hep-th", "gr-qc"],
        "control_number": 999_108,
        "deleted": False,
        "email_addresses": [{"current": True, "value": "malda@ias.edu"}],
        "facet_author_name": "999108_Juan Martin Maldacena",
        "ids": [
            {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
            {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"},
            {"schema": "ORCID", "value": "0000-0002-9127-1687"},
            {"schema": "SPIRES", "value": "HEPNAMES-193534"},
        ],
        "orcid": "0000-0002-9127-1687",
        "bai": "J.M.Maldacena.1",
        "name": {
            "name_variants": ["Maldacena, Juan Martin"],
            "preferred_name": "Juan Martin Maldacena",
            "value": "Maldacena, Juan Martin",
        },
        "positions": [
            {
                "current": True,
                "display_date": "2001-present",
                "institution": "Princeton, Inst. Advanced Study",
                "rank": "SENIOR",
            },
            {
                "display_date": "1997-2001",
                "institution": "Harvard U.",
                "rank": "SENIOR",
            },
            {
                "display_date": "1996-1997",
                "institution": "Rutgers U., Piscataway",
                "rank": "POSTDOC",
            },
            {"display_date": "1992-1996", "institution": "Princeton U.", "rank": "PHD"},
            {
                "display_date": "1988-1991",
                "institution": "Cuyo U.",
                "rank": "UNDERGRADUATE",
            },
        ],
        "legacy_creation_date": "1999-05-04",
        "legacy_version": "20160711200442.0",
        "public_notes": [
            {"value": "Fundamental Physics Price 2012"},
            {"value": "Dirac Medal 2008"},
            {"value": "Heineman Prize 2007"},
        ],
        "should_display_positions": True,
        "status": "active",
        "stub": False,
        "urls": [{"value": "http://www.sns.ias.edu/~malda"}],
    }
    response = api_client.get(f"/authors/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_metadata == response_data["metadata"]
    assert expected_id == response_data["id"]
    assert response_data["created"] is not None
    assert response_data["updated"] is not None


def test_authors_json_without_login(api_client, db, es, create_record_factory):
    headers = {"Accept": "application/json"}

    data = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "_private_notes": [{"value": "A private note"}],
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [
            {"value": "public@urhan.ch"},
            {"value": "private@urhan.ch", "hidden": True},
        ],
    }
    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_result = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "control_number": record_control_number,
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [{"value": "public@urhan.ch"}],
    }
    response = api_client.get(f"/authors/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_uuid = response_data["uuid"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata
    assert expected_uuid == response_uuid


def test_authors_json_with_logged_in_cataloger(
    api_client, db, create_user, create_record_factory
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    headers = {"Accept": "application/json"}

    data = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "_private_notes": [{"value": "A private note"}],
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [
            {"value": "public@urhan.ch"},
            {"value": "private@urhan.ch", "hidden": True},
        ],
    }
    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {
        "control_number": record_control_number,
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "_private_notes": [{"value": "A private note"}],
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [
            {"value": "public@urhan.ch"},
            {"value": "private@urhan.ch", "hidden": True},
        ],
    }
    response = api_client.get(f"/authors/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_authors_only_control_number(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/vnd+inspire.record.control_number+json"}

    data = json.loads((datadir / "999108.json").read_text())

    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {"control_number": record_control_number}
    response = api_client.get(f"/authors/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_authors_search_json(api_client, db, es, create_record, datadir):
    headers = {"Accept": "application/json"}

    data = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "_private_notes": [{"value": "A private note"}],
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [
            {"value": "public@urhan.ch"},
            {"value": "private@urhan.ch", "hidden": True},
        ],
    }

    record = create_record("aut", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_metadata = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "control_number": record_control_number,
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [{"value": "public@urhan.ch"}],
    }
    expected_id = str(record_control_number)
    response = api_client.get("/authors", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]
    response_data_hits_id = response_data_hits[0]["id"]
    response_data_hits_created = response_data_hits[0]["created"]
    response_data_hits_updated = response_data_hits[0]["updated"]

    assert expected_status_code == response_status_code
    assert expected_metadata == response_data_hits_metadata
    assert expected_id == response_data_hits_id
    assert response_data_hits_created is not None
    assert response_data_hits_updated is not None


def test_authors_search_json_does_not_have_sort_options(
    api_client, db, es, create_record
):
    headers = {"Accept": "application/json"}
    record = create_record("aut")

    expected_status_code = 200
    expected_sort_options = None
    response = api_client.get("/authors", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    sort_options = response_data["sort_options"]

    assert expected_status_code == response_status_code
    assert expected_sort_options == sort_options


def test_authors_search_json_with_logged_in_cataloger(
    api_client, db, create_user, create_record_factory
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    headers = {"Accept": "application/json"}

    data = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "_private_notes": [{"value": "A private note"}],
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [
            {"value": "public@urhan.ch"},
            {"value": "private@urhan.ch", "hidden": True},
        ],
    }

    record = create_record_factory("aut", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {
        "control_number": record_control_number,
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "_private_notes": [{"value": "A private note"}],
        "name": {"value": "Urhan, Harun"},
        "deleted": False,
        "email_addresses": [
            {"value": "public@urhan.ch"},
            {"value": "private@urhan.ch", "hidden": True},
        ],
    }
    response = api_client.get("/authors".format(record_control_number), headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata
