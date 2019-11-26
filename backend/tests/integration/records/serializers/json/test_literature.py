# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from uuid import UUID

import mock
from flask import current_app
from helpers.providers.faker import faker
from invenio_accounts.testutils import login_user_via_session
from invenio_records_rest.errors import MaxResultWindowRESTError

from inspirehep.accounts.roles import Roles
from inspirehep.records.marshmallow.literature import LiteratureDetailSchema


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_literature_authors_json(mock_uuid4, api_client, db, es, create_record, redis):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    headers = {"Accept": "application/json"}
    full_name_1 = "Tanner Walker"
    data = {
        "authors": [{"full_name": full_name_1}],
        "collaborations": [{"value": "ATLAS"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = {
        "authors": [
            {
                "first_name": full_name_1,
                "full_name": full_name_1,
                "signature_block": "WALCARt",
                "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131",
            }
        ],
        "collaborations": [{"value": "ATLAS"}],
    }
    response = api_client.get(
        f"/literature/{record_control_number}/authors", headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_json_without_login(api_client, db, es, create_record):
    headers = {"Accept": "application/json"}

    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "_private_notes": [{"value": "A private note"}],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
        "report_numbers": [
            {"value": "PUBLIC", "hidden": False},
            {"value": "PRIVATE", "hidden": True},
        ],
        "documents": [
            {
                "key": "private",
                "url": "https://url.to/private/document",
                "hidden": True,
            },
            {"key": "public", "url": "https://url.to/public/document"},
        ],
    }

    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_metadata = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [{"pubinfo_freetext": "A public publication info"}],
        "report_numbers": [{"value": "PUBLIC", "hidden": False}],
        "documents": [{"key": "public", "url": "https://url.to/public/document"}],
        "_bucket": str(record._bucket),
        "citation_count": 0,
    }
    expected_id = record["control_number"]

    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    assert expected_status_code == response_status_code
    assert expected_metadata == response_data["metadata"]
    assert expected_uuid == response_data["uuid"]
    assert expected_id == response_data["id"]
    assert response_data["created"] is not None
    assert response_data["updated"] is not None


def test_literature_json_with_logged_in_cataloger(
    api_client, db, es, create_user, create_record
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    headers = {"Accept": "application/json"}

    data = {
        "$schema": "http://inspire/schemas/records/hep.json",
        "_collections": ["Literature"],
        "_private_notes": [{"value": "A private note"}],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
        "report_numbers": [
            {"value": "PUBLIC", "hidden": False},
            {"value": "PRIVATE", "hidden": True},
        ],
        "documents": [
            {
                "key": "private",
                "url": "https://url.to/private/document",
                "hidden": True,
            },
            {"key": "public", "url": "https://url.to/public/document"},
        ],
    }

    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_id = record["control_number"]
    expected_result = {
        "$schema": "http://inspire/schemas/records/hep.json",
        "_collections": ["Literature"],
        "_private_notes": [{"value": "A private note"}],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
        "report_numbers": [
            {"value": "PUBLIC", "hidden": False},
            {"value": "PRIVATE", "hidden": True},
        ],
        "documents": [
            {
                "key": "private",
                "url": "https://url.to/private/document",
                "hidden": True,
            },
            {"key": "public", "url": "https://url.to/public/document"},
        ],
        "_bucket": str(record._bucket),
        "citation_count": 0,
    }

    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_result == response_data["metadata"]
    assert expected_uuid == response_data["uuid"]
    assert expected_id == response_data["id"]
    assert response_data["created"] is not None
    assert response_data["updated"] is not None


def test_literature_search_json_without_login(api_client, db, es, create_record):
    headers = {"Accept": "application/json"}

    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "_private_notes": [{"value": "A private note"}],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
        "report_numbers": [
            {"value": "PUBLIC", "hidden": False},
            {"value": "PRIVATE", "hidden": True},
        ],
        "documents": [
            {
                "key": "private",
                "url": "https://url.to/private/document",
                "hidden": True,
            },
            {"key": "public", "url": "https://url.to/public/document"},
        ],
    }
    record = create_record("lit", data=data)

    expected_status_code = 200
    expected_metadata = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [{"pubinfo_freetext": "A public publication info"}],
        "report_numbers": [{"value": "PUBLIC", "hidden": False}],
        "documents": [{"key": "public", "url": "https://url.to/public/document"}],
        "citation_count": 0,
        "author_count": 0,
        "_bucket": str(record._bucket),
    }
    expected_result_len = 1
    expected_id = record["control_number"]

    response = api_client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_len = len(response_data_hits)
    response_data_hits_metadata = response_data_hits[0]["metadata"]
    response_data_hits_id = response_data_hits[0]["id"]
    response_data_hits_created = response_data_hits[0]["created"]
    response_data_hits_updated = response_data_hits[0]["updated"]

    assert expected_status_code == response_status_code
    assert expected_result_len == response_data_hits_len
    assert expected_metadata == response_data_hits_metadata
    assert expected_id == response_data_hits_id
    assert response_data_hits_created is not None
    assert response_data_hits_updated is not None


def test_literature_search_json_with_cataloger_login(
    api_client, db, es, create_user, create_record
):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    headers = {"Accept": "application/json"}

    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "_private_notes": [{"value": "A private note"}],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
        "report_numbers": [
            {"value": "PUBLIC", "hidden": False},
            {"value": "PRIVATE", "hidden": True},
        ],
        "documents": [
            {
                "key": "private",
                "url": "https://url.to/private/document",
                "hidden": True,
            },
            {"key": "public", "url": "https://url.to/public/document"},
        ],
    }
    record = create_record("lit", data=data)
    expected_status_code = 200
    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "_private_notes": [{"value": "A private note"}],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
        "report_numbers": [
            {"value": "PUBLIC", "hidden": False},
            {"value": "PRIVATE", "hidden": True},
        ],
        "documents": [
            {
                "key": "private",
                "url": "https://url.to/private/document",
                "hidden": True,
            },
            {"key": "public", "url": "https://url.to/public/document"},
        ],
        "citation_count": 0,
        "author_count": 0,
        "_bucket": str(record._bucket),
    }
    expected_result_len = 1

    response = api_client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_len = len(response_data_hits)
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result_len == response_data_hits_len
    assert expected_result == response_data_hits_metadata


def test_literature_detail(api_client, db, es, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit", data={"preprint_date": "2001-01-01"})
    record_control_number = record["control_number"]
    record_titles = record["titles"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_id = record["control_number"]
    expected_result_metadata = {
        "control_number": record_control_number,
        "document_type": ["article"],
        "titles": record_titles,
        "preprint_date": "2001-01-01",
        "date": "Jan 1, 2001",
        "_bucket": str(record._bucket),
        "citation_count": 0,
    }
    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_data_uuid = response_data["uuid"]
    response_data_id = response_data["id"]
    response_data_created = response_data["created"]
    response_data_updated = response_data["updated"]

    assert expected_status_code == response_status_code
    assert expected_result_metadata == response_data_metadata
    assert expected_uuid == response_data_uuid
    assert expected_id == response_data_id
    assert response_data_created is not None
    assert response_data_updated is not None


def test_literature_list(api_client, db, es, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit", data={"preprint_date": "2001-01-01"})

    expected_id = record["control_number"]
    expected_status_code = 200
    expected_title = record["titles"][0]["title"]
    expected_date = "Jan 1, 2001"

    response = api_client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert response_data["hits"]["total"] == 1

    response_data_hits = response_data["hits"]["hits"]
    response_data_metadata = response_data_hits[0]["metadata"]
    response_data_hits_id = response_data_hits[0]["id"]
    response_data_hits_created = response_data_hits[0]["created"]
    response_data_hits_updated = response_data_hits[0]["updated"]

    assert expected_status_code == response_status_code
    assert expected_title == response_data_metadata["titles"][0]["title"]
    assert expected_date == response_data_metadata["date"]
    assert "can_edit" not in response_data_metadata
    assert expected_id == response_data_hits_id
    assert response_data_hits_created is not None
    assert response_data_hits_updated is not None


def test_literature_list_with_cataloger_can_edit(
    api_client, db, es, create_record, create_user
):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit")

    expected_status_code = 200
    expected_title = record["titles"][0]["title"]

    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    response = api_client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert response_data["hits"]["total"] == 1

    expected_data_hits = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_title == expected_data_hits["titles"][0]["title"]
    assert "can_edit" in expected_data_hits
    assert expected_data_hits["can_edit"] is True


def test_literature_list_has_sort_options(api_client, db, es, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    create_record("lit")

    expected_status_code = 200
    expected_sort_options = [
        {"value": "mostrecent", "display": "Most Recent"},
        {"value": "mostcited", "display": "Most Cited"},
    ]
    response = api_client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    sort_options = response_data["sort_options"]

    assert expected_status_code == response_status_code
    assert expected_sort_options == sort_options


def test_literature_references_json(api_client, db, es, create_record):
    headers = {"Accept": "application/json"}
    reference_without_link_title = faker.sentence()

    record_referenced = create_record("lit")
    record_referenced_control_number = record_referenced["control_number"]
    record_referenced_titles = record_referenced["titles"]

    data = {
        "references": [
            {
                "reference": {
                    "title": {"title": reference_without_link_title},
                    "label": "1",
                }
            },
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{record_referenced_control_number}"
                },
                "reference": {"label": "2"},
            },
        ]
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = {
        "references": [
            {"label": "1", "titles": [{"title": reference_without_link_title}]},
            {
                "control_number": record_referenced_control_number,
                "titles": record_referenced_titles,
                "label": "2",
            },
        ],
        "references_count": 2,
    }

    response = api_client.get(
        f"/literature/{record_control_number}/references", headers=headers
    )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_references_pagination(api_client, db, es, create_record):
    record1 = create_record("lit", data=faker.record("lit"))
    record2 = create_record("lit", data=faker.record("lit"))
    record3 = create_record("lit", data=faker.record("lit"))
    record4 = create_record("lit", data=faker.record("lit"))

    data = faker.record(
        "lit",
        literature_citations=[
            record1["control_number"],
            record2["control_number"],
            record3["control_number"],
            record4["control_number"],
        ],
    )
    record_with_references = create_record("lit", data=data)
    headers = {"Accept": "application/json"}
    response = api_client.get(
        f"/literature/{record_with_references['control_number']}/references?page=2&size=2",
        headers=headers,
    )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    expected_result = {
        "references": [
            {"control_number": record3["control_number"], "titles": record3["titles"]},
            {"control_number": record4["control_number"], "titles": record4["titles"]},
        ],
        "references_count": 4,
    }
    expected_status_code = 200
    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_references_pagination_with_size_more_than_results(
    api_client, db, es, create_record
):
    record1 = create_record("lit", data=faker.record("lit"))
    record2 = create_record("lit", data=faker.record("lit"))
    record3 = create_record("lit", data=faker.record("lit"))
    record4 = create_record("lit", data=faker.record("lit"))

    data = faker.record(
        "lit",
        literature_citations=[
            record1["control_number"],
            record2["control_number"],
            record3["control_number"],
            record4["control_number"],
        ],
    )
    record_with_references = create_record("lit", data=data)
    headers = {"Accept": "application/json"}
    response = api_client.get(
        f"/literature/{record_with_references['control_number']}/references?page=1&size=100",
        headers=headers,
    )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    expected_result = {
        "references": [
            {"control_number": record1["control_number"], "titles": record1["titles"]},
            {"control_number": record2["control_number"], "titles": record2["titles"]},
            {"control_number": record3["control_number"], "titles": record3["titles"]},
            {"control_number": record4["control_number"], "titles": record4["titles"]},
        ],
        "references_count": 4,
    }
    expected_status_code = 200
    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_references_pagination_with_page_with_no_results(
    api_client, db, es, create_record
):
    record1 = create_record("lit", data=faker.record("lit"))
    record2 = create_record("lit", data=faker.record("lit"))
    record3 = create_record("lit", data=faker.record("lit"))
    record4 = create_record("lit", data=faker.record("lit"))

    data = faker.record(
        "lit",
        literature_citations=[
            record1["control_number"],
            record2["control_number"],
            record3["control_number"],
            record4["control_number"],
        ],
    )
    record_with_references = create_record("lit", data=data)
    headers = {"Accept": "application/json"}
    response = api_client.get(
        f"/literature/{record_with_references['control_number']}/references?page=100&size=100",
        headers=headers,
    )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    expected_result = {"references": [], "references_count": 4}
    expected_status_code = 200
    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_references_with_invalid_size(api_client, db, es, create_record):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    response = api_client.get(
        f"/literature/{record['control_number']}/references?size=0", headers=headers
    )
    response_status_code = response.status_code
    expected_status_code = 400
    assert expected_status_code == response_status_code


def test_literature_references_with_size_bigger_than_maximum(
    api_client, db, es, create_record
):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    config = {"MAX_API_RESULTS": 3}
    with mock.patch.dict(current_app.config, config):
        response = api_client.get(
            f"/literature/{record['control_number']}/references?size=5", headers=headers
        )
    response_status_code = response.status_code
    response_data = json.loads(response.get_data())
    expected_status_code = 400
    expected_response = MaxResultWindowRESTError().description
    assert expected_status_code == response_status_code
    assert expected_response == response_data["message"]


def test_literature_references_no_references(api_client, db, es, create_record):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    response = api_client.get(
        f"/literature/{record['control_number']}/references?page=1&size=100",
        headers=headers,
    )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    expected_result = {"references": [], "references_count": 0}
    expected_status_code = 200
    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_detail_serialize_experiments(
    es_clear, db, es, datadir, create_record, create_record_factory
):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)
    experiment_data = {
        "accelerator": {"value": "Accelerator"},
        "control_number": 1_118_472,
        "institutions": [{"value": "Institute"}],
        "experiment": {"value": "Experiment"},
    }

    expected_experiment = [
        {"name": "LIGO"},
        {"name": "VIRGO"},
        {"name": "FERMI-GBM"},
        {"name": "INTEGRAL"},
        {"name": "ICECUBE"},
        {"name": "ANTARES"},
        {"name": "Swift"},
        {"name": "AGILE"},
        {"name": "DES"},
        {"name": "FERMI-LAT"},
        {"name": "ATCA"},
        {"name": "OzGrav"},
        {"name": "Institute-Accelerator-Experiment"},
        {"name": "PAN-STARRS"},
        {"name": "MWA"},
        {"name": "CALET"},
        {"name": "HESS"},
        {"name": "LOFAR"},
        {"name": "HAWC"},
        {"name": "AUGER"},
        {"name": "ALMA"},
        {"name": "VLBI"},
    ]
    #  Create experiment with data:
    create_record_factory("exp", data=experiment_data)
    #  Create dummy experiments:
    create_record_factory("exp", data={"control_number": 1_110_601})
    create_record_factory("exp", data={"control_number": 1_108_514})
    dumped_record = LiteratureDetailSchema().dump(record).data
    assert dumped_record["accelerator_experiments"] == expected_experiment


def test_literature_detail_serializes_conference_info(
    api_client, db, es, create_record_factory
):
    conference_data = {
        "acronyms": ["SAIP2016"],
        "control_number": 1_423_473,
        "titles": [
            {
                "title": "61st Annual Conference of the South African Institute of Physics"
            }
        ],
        "urls": [
            {
                "description": "web page",
                "value": "http://events.saip.org.za/conferenceDisplay.py?confId=86",
            }
        ],
    }

    create_record_factory("con", data=conference_data, with_indexing=True)

    literature_data = {
        "publication_info": [
            {
                "cnum": "C16-07-04.5",
                "conference_record": {
                    "$ref": "http://labs.inspirehep.net/api/conferences/1423473"
                },
                "page_end": "517",
                "page_start": "512",
                "parent_record": {
                    "$ref": "http://labs.inspirehep.net/api/literature/1719035"
                },
            }
        ]
    }

    lit_record = create_record_factory("lit", data=literature_data, with_indexing=True)

    expected_status_code = 200
    expected_conference_info = [
        {
            "acronyms": ["SAIP2016"],
            "control_number": 1_423_473,
            "page_end": "517",
            "page_start": "512",
            "titles": [
                {
                    "title": "61st Annual Conference of the South African Institute of Physics"
                }
            ],
        }
    ]

    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    response = api_client.get(
        "/literature/" + str(lit_record.json["control_number"]), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_conference_info = response_data["metadata"]["conference_info"]

    assert response_status_code == expected_status_code
    assert response_data_conference_info == expected_conference_info


def test_regression_not_throw_on_collaboration_in_reference_without_record(
    api_client, db, es, create_record
):
    expected_response_metadata = {
        "references": [{"collaborations": [{"value": "CMS"}], "label": "1"}],
        "references_count": 1,
    }

    data = {
        "references": [
            {
                "record": {"$ref": f"http://localhost:5000/api/literature/999"},
                "reference": {"label": "1", "collaborations": ["CMS"]},
            }
        ]
    }
    rec = create_record("lit", data=data)
    headers = {"Accept": "application/json"}
    response = api_client.get(
        f"/literature/{rec['control_number']}/references", headers=headers
    )
    assert response.status_code == 200
    assert response.json["metadata"] == expected_response_metadata


def test_record_fulllinks_in_detail_view(api_client, db, es, create_record):
    expected_response_metadata = [
        {"description": "arXiv", "value": "https://arxiv.org/pdf/nucl-th/9310030"},
        {
            "description": "KEK scanned document",
            "value": "https://lib-extopc.kek.jp/preprints/PDF/1994/9407/9407219.pdf",
        },
    ]
    data = {
        "arxiv_eprints": [{"categories": ["nucl-th"], "value": "nucl-th/9310030"}],
        "external_system_identifiers": [{"schema": "KEKSCAN", "value": "94-07-219"}],
    }

    rec = create_record("lit", data=data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    response = api_client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert response.json["metadata"]["fulltext_links"] == expected_response_metadata


def test_record_no_fulllinks_in_detail_view_when_no_fulltext_links(
    api_client, db, es, create_record
):
    data = {}

    rec = create_record("lit", data=data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    response = api_client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert "fulltext_links" not in response.json["metadata"]
