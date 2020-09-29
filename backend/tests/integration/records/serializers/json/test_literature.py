# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from uuid import UUID

import mock
from helpers.providers.faker import faker
from helpers.utils import (
    create_record,
    create_record_factory,
    create_user,
    override_config,
)
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles
from inspirehep.files import current_s3_instance
from inspirehep.records.errors import MaxResultWindowRESTError


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_literature_authors_json(mock_uuid4, inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{record_control_number}/authors", headers=headers
        )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_json_without_login(inspire_app):
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
        "citation_count": 0,
        "citation_count_without_self_citations": 0,
    }
    expected_id = str(record["control_number"])

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    assert expected_status_code == response_status_code
    assert expected_metadata == response_data["metadata"]
    assert expected_uuid == response_data["uuid"]
    assert expected_id == response_data["id"]
    assert response_data["created"] is not None
    assert response_data["updated"] is not None


def test_literature_json_with_logged_in_cataloger(inspire_app):
    user = create_user(role=Roles.cataloger.value)

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
    expected_id = str(record["control_number"])
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
        "citation_count": 0,
        "citation_count_without_self_citations": 0,
        "self": {"$ref": "http://localhost:5000/api/literature/12345"},
    }
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_result == response_data["metadata"]
    assert expected_uuid == response_data["uuid"]
    assert expected_id == response_data["id"]
    assert response_data["created"] is not None
    assert response_data["updated"] is not None


def test_literature_search_json_without_login(inspire_app):
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
        "citation_count_without_self_citations": 0,
        "author_count": 0,
    }
    expected_result_len = 1
    expected_id = str(record["control_number"])
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)

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


def test_literature_search_json_with_cataloger_login(inspire_app):
    user = create_user(role=Roles.cataloger.value)

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
        "citation_count_without_self_citations": 0,
        "author_count": 0,
        "self": {"$ref": "http://localhost:5000/api/literature/12345"},
    }
    expected_result_len = 1
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_len = len(response_data_hits)
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result_len == response_data_hits_len
    assert expected_result == response_data_hits_metadata


def test_literature_detail(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit", data={"preprint_date": "2001-01-01"})
    record_control_number = record["control_number"]
    record_titles = record["titles"]

    expected_status_code = 200
    expected_uuid = str(record.id)
    expected_id = str(record["control_number"])
    expected_result_metadata = {
        "control_number": record_control_number,
        "document_type": ["article"],
        "titles": record_titles,
        "preprint_date": "2001-01-01",
        "date": "Jan 1, 2001",
        "citation_count": 0,
        "citation_count_without_self_citations": 0,
    }
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

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


def test_literature_list(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit", data={"preprint_date": "2001-01-01"})

    expected_id = str(record["control_number"])
    expected_status_code = 200
    expected_title = record["titles"][0]["title"]
    expected_date = "Jan 1, 2001"
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)
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


def test_literature_list_with_cataloger_can_edit(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit")

    expected_status_code = 200
    expected_title = record["titles"][0]["title"]

    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert response_data["hits"]["total"] == 1

    expected_data_hits = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_title == expected_data_hits["titles"][0]["title"]
    assert "can_edit" in expected_data_hits
    assert expected_data_hits["can_edit"] is True


def test_literature_list_has_sort_options(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    create_record("lit")

    expected_status_code = 200
    expected_sort_options = [
        {"value": "mostrecent", "display": "Most Recent"},
        {"value": "mostcited", "display": "Most Cited"},
    ]
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    sort_options = response_data["sort_options"]

    assert expected_status_code == response_status_code
    assert expected_sort_options == sort_options


def test_literature_references_json_with_empty_and_unlinked_and_duplicated_linked_records(
    inspire_app,
):
    headers = {"Accept": "application/json"}
    reference_without_link_title = faker.sentence()

    referenced_data = {
        "arxiv_eprints": [{"value": "hep-th/0210297"}, {"value": "hep-th/7765432"}]
    }
    referenced_record = create_record("lit", data=referenced_data)

    data = {
        "references": [
            {
                "reference": {
                    "title": {"title": reference_without_link_title},
                    "label": "1",
                }
            },
            {"legacy_curated": True},
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{referenced_record['control_number']}"
                },
                "reference": {"label": "2"},
            },
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{referenced_record['control_number']}"
                },
                "reference": {"label": "2", "arxiv_eprint": "hep-th/0210297"},
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
                "control_number": referenced_record["control_number"],
                "titles": referenced_record["titles"],
                "arxiv_eprint": [referenced_data["arxiv_eprints"][0]],
                "label": "2",
            },
            {
                "control_number": referenced_record["control_number"],
                "titles": referenced_record["titles"],
                "arxiv_eprint": [referenced_data["arxiv_eprints"][0]],
                "label": "2",
            },
        ],
        "references_count": 4,
    }
    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{record_control_number}/references", headers=headers
        )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_references_pagination(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
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


def test_literature_references_pagination_with_size_more_than_results(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
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


def test_literature_references_pagination_with_page_with_no_results(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
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


def test_literature_references_with_invalid_size(inspire_app):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{record['control_number']}/references?size=0", headers=headers
        )
    response_status_code = response.status_code
    expected_status_code = 400
    assert expected_status_code == response_status_code


def test_literature_references_with_size_bigger_than_maximum(inspire_app):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    config = {"MAX_API_RESULTS": 3}
    with override_config(**config), inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{record['control_number']}/references?size=5", headers=headers
        )
    response_status_code = response.status_code
    response_data = json.loads(response.get_data())
    expected_status_code = 400
    expected_response = MaxResultWindowRESTError().description
    assert expected_status_code == response_status_code
    assert expected_response == response_data["message"]


def test_literature_references_no_references(inspire_app):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    with inspire_app.test_client() as client:
        response = client.get(
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


def test_literature_detail_serialize_experiment_with_referenced_record(
    inspire_app, datadir
):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)
    experiment_data = {
        "accelerator": {"value": "Accelerator"},
        "control_number": 1_110_623,
        "institutions": [{"value": "Institute"}],
        "experiment": {"value": "Experiment"},
    }
    create_record_factory("exp", data=experiment_data)
    expected_experiment_data = [
        {"name": "Institute-Accelerator-Experiment"},
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
        {"name": "NuSTAR"},
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
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/" + str(record["control_number"]), headers=headers
        )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_accelerator_experiments = response_data["metadata"][
        "accelerator_experiments"
    ]

    assert response_status_code == 200
    assert response_data_accelerator_experiments == expected_experiment_data


def test_literature_detail_serializes_conference_info(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
            "/literature/" + str(lit_record.json["control_number"]), headers=headers
        )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_conference_info = response_data["metadata"]["conference_info"]

    assert response_status_code == expected_status_code
    assert response_data_conference_info == expected_conference_info


def test_regression_not_throw_on_collaboration_in_reference_without_record(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{rec['control_number']}/references", headers=headers
        )
    assert response.status_code == 200
    assert response.json["metadata"] == expected_response_metadata


def test_record_fulllinks_in_detail_view(inspire_app):
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
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert response.json["metadata"]["fulltext_links"] == expected_response_metadata


def test_record_no_fulllinks_in_detail_view_when_no_fulltext_links(inspire_app):
    data = {}

    rec = create_record("lit", data=data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert "fulltext_links" not in response.json["metadata"]


def test_literature_search_lowercased_doi_in_references(inspire_app):
    headers = {"Accept": "application/json"}

    data = {
        "dois": [{"value": "10.1103/PhysRevLett.50.928"}],
        "references": [{"reference": {"dois": ["10.1103/PhysRevLett.50.928"]}}],
    }
    record = create_record("lit", data=data)

    expected_status_code = 200
    expected_result_len = 1
    expected_doi = "10.1103/PhysRevLett.50.928"
    with inspire_app.test_client() as client:
        response1 = client.get(
            "/literature?q=references.reference.dois:10.1103%2Fphysrevlett.50.928",
            headers=headers,
        )
        response2 = client.get(
            "/literature?q=references.reference.dois:10.1103%2FPHYSREVLETT.50.928",
            headers=headers,
        )

    response1_status_code = response1.status_code
    response1_data = json.loads(response1.data)
    response1_data_hits = response1_data["hits"]["hits"]
    response1_data_hits_len = len(response1_data_hits)
    response1_data_hits_metadata = response1_data_hits[0]["metadata"]
    response1_hit_dois = response1_data_hits_metadata["references"][0]["reference"][
        "dois"
    ][0]

    response2_status_code = response2.status_code
    response2_data = json.loads(response1.data)
    response2_data_hits = response2_data["hits"]["hits"]
    response2_data_hits_len = len(response2_data_hits)
    response2_data_hits_metadata = response2_data_hits[0]["metadata"]
    response2_hit_dois = response2_data_hits_metadata["references"][0]["reference"][
        "dois"
    ][0]

    assert expected_status_code == response1_status_code
    assert expected_result_len == response1_data_hits_len
    assert expected_doi == response1_hit_dois

    assert expected_status_code == response2_status_code
    assert expected_result_len == response2_data_hits_len
    assert expected_doi == response2_hit_dois


def test_record_link_to_hepdata_in_detail_view(inspire_app):
    expected_response_metadata = [
        {"url_link": "https://www.hepdata.net/record/ins123456", "url_name": "HEPData"}
    ]

    data = {
        "external_system_identifiers": [{"schema": "HEPDATA", "value": "ins123456"}]
    }

    rec = create_record("lit", data=data)

    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert (
        response.json["metadata"]["external_system_identifiers"]
        == expected_response_metadata
    )


def test_literature_detail_links(inspire_app):
    expected_status_code = 200
    record = create_record("lit")
    cn = record["control_number"]
    expected_links = {
        "bibtex": f"http://localhost:5000/literature/{cn}?format=bibtex",
        "citations": f"http://localhost:5000/literature/?q=refersto%3Arecid%3A{cn}",
        "json": f"http://localhost:5000/literature/{cn}?format=json",
        "latex-eu": f"http://localhost:5000/literature/{cn}?format=latex-eu",
        "latex-us": f"http://localhost:5000/literature/{cn}?format=latex-us",
    }

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}")
    assert response.status_code == expected_status_code
    assert response.json["links"] == expected_links


def test_literature_detail_json_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("lit")
    expected_content_type = "application/json"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=json")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type


def test_record_returns_linked_book(inspire_app):
    parent_record = create_record("lit")

    expected_linked_book = {
        "record": {
            "$ref": f"http://localhost:5000/api/literature/{parent_record['control_number']}"
        },
        "title": parent_record["titles"][0]["title"],
    }

    data = {
        "publication_info": [
            {
                "parent_record": {
                    "$ref": f"http://localhost:5000/api/literature/{parent_record['control_number']}"
                }
            }
        ]
    }
    rec = create_record("lit", data=data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert "linked_book" in response.json["metadata"]
    assert response.json["metadata"]["linked_book"] == expected_linked_book


def test_citation_pdf_urls(inspire_app):
    expected_url = f"{current_s3_instance.public_file_path}/bucket/file.pdf"
    data = {
        "documents": [
            {
                "key": "external_file.pdf",
                "url": "https://some.external/path/external_file.podf",
            },
            {
                "key": "hidden_file.pdf",
                "url": f"{current_s3_instance.public_file_path}/bucket/hidden_file.pdf",
                "hidden": True,
            },
            {"key": "file.pdf", "url": expected_url},
        ]
    }

    rec = create_record("lit", data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{rec['control_number']}", headers=headers)
    assert response.status_code == 200
    assert response.json["metadata"]["citation_pdf_urls"] == [expected_url]


def test_literature_list_with_cataloger_and_author_curated_relation(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    author = create_record("aut", data={"name": {"value": "Doe, John"}})
    record_with_curated_relation = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Doe, John",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )

    record_without_curated_relation = create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Doe, John",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "curated_relation": True,
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )

    record_without_author = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
                }
            ]
        },
    )

    expected_status_code = 200

    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/literature?author={author['control_number']}_John%20Doe&search_type=hep-author-publication",
            headers=headers,
        )
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    hits = response.json["hits"]["hits"]
    curated_hit = next(
        hit["metadata"]
        for hit in hits
        if hit["metadata"]["control_number"]
        == record_with_curated_relation["control_number"]
    )
    non_curated_hit = next(
        hit["metadata"]
        for hit in hits
        if hit["metadata"]["control_number"]
        == record_without_curated_relation["control_number"]
    )

    assert expected_status_code == response_status_code
    assert response_data["hits"]["total"] == 2
    assert curated_hit["curated_relation"] is True
    assert non_curated_hit["curated_relation"] is False


def test_literature_list_with_normal_user_doesnt_have_curated_relation(inspire_app):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    author = create_record("aut", data={"name": {"value": "Doe, John"}})
    record_with_curated_relation = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Doe, John",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )

    record_without_curated_relation = create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Doe, John",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "curated_relation": True,
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )

    expected_status_code = 200

    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature?author={author['control_number']}_John%20Doe&search_type=hep-author-publication",
            headers=headers,
        )
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    hits = response.json["hits"]["hits"]
    curated_hit = next(
        hit["metadata"]
        for hit in hits
        if hit["metadata"]["control_number"]
        == record_with_curated_relation["control_number"]
    )
    non_curated_hit = next(
        hit["metadata"]
        for hit in hits
        if hit["metadata"]["control_number"]
        == record_without_curated_relation["control_number"]
    )

    assert expected_status_code == response_status_code
    assert response_data["hits"]["total"] == 2
    assert "curated_relation" not in curated_hit
    assert "curated_relation" not in non_curated_hit


def test_literature_list_for_non_author_publication_search_doesnt_have_curated_relation(
    inspire_app,
):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    author = create_record("aut", data={"name": {"value": "Doe, John"}})
    create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": True,
                    "full_name": "Doe, John",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": f"http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )

    expected_status_code = 200

    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature?author={author['control_number']}_John%20Doe", headers=headers
        )
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    hits = response.json["hits"]["hits"]

    assert expected_status_code == response_status_code
    assert response_data["hits"]["total"] == 1
    assert "curated_relation" not in hits[0]


def test_literature_raw_json_with_logged_in_cataloger(inspire_app):
    user = create_user(role=Roles.cataloger.value)

    headers = {"Accept": "application/vnd+inspire.record.raw+json"}

    data = {
        "_collections": ["Literature"],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
    }

    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_raw_json_without_logged_in_cataloger(inspire_app):
    user = create_user()

    headers = {"Accept": "application/vnd+inspire.record.raw+json"}

    data = {
        "_collections": ["Literature"],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
    }

    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 403
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_json_with_fields_filtering(inspire_app):
    user = create_user()

    headers = {"Accept": "application/json"}
    aut = create_record("aut", data={"control_number": 637275238})
    data = {
        "_collections": ["Literature"],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "authors": [
            {
                "full_name": "Doe, John1",
                "record": {
                    "$ref": f'https://localhost:5000/api/authors/{aut["control_number"]}'
                },
            }
        ],
        "publication_info": [
            {"pubinfo_freetext": "A public publication info"},
            {"pubinfo_freetext": "A private publication info", "hidden": True},
        ],
    }

    create_record("lit", data=data)

    expected_status_code = 200
    expected_keys = ["authors", "control_number", "document_type"]
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/literature?fields=authors,document_type&format=json", headers=headers
        )

    response_status_code = response.status_code
    response_keys = sorted(list(response.json["hits"]["hits"][0]["metadata"].keys()))
    assert response.json["hits"]["hits"][0]["created"] is not None
    assert response.json["hits"]["hits"][0]["updated"] is not None
    assert expected_status_code == response_status_code
    assert response_keys == expected_keys


def test_literature_json_with_fields_filtering_ignores_wrong_fields(inspire_app):
    user = create_user()

    headers = {"Accept": "application/json"}
    aut = create_record("aut", data={"control_number": 637275238})
    data = {
        "_collections": ["Literature"],
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "authors": [
            {
                "full_name": "Doe, John1",
                "record": {
                    "$ref": f'https://localhost:5000/api/authors/{aut["control_number"]}'
                },
            }
        ],
    }

    create_record("lit", data=data)

    expected_status_code = 200
    expected_keys = ["control_number", "titles"]
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            f"/literature?fields=wrongfield,titles&format=json", headers=headers
        )

    response_status_code = response.status_code
    response_keys = sorted(list(response.json["hits"]["hits"][0]["metadata"].keys()))
    assert expected_status_code == response_status_code
    assert response_keys == expected_keys


def test_regression_serializers_mutation(inspire_app):
    data = {
        "dois": [
            {"source": "World Scientific", "value": "10.1142/9789814618113_0024"},
        ]
    }
    record = create_record("lit", data=data)
    excepted_doi = "10.1142/9789814618113_0024"
    with inspire_app.test_client() as client:
        response = client.get("/literature/")

    assert (
        excepted_doi == response.json["hits"]["hits"][0]["metadata"]["dois"][0]["value"]
    )
