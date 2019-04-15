# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

import pytest
from helpers.compare import compare_data_with_ui_display_field
from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureMetadataSchemaV1


def test_literature_default_json_v1_response(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    record = create_record("lit")
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record)
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_result == response_data["metadata"]


def test_literature_default_json_v1_search(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    record = create_record("lit")
    record_control_number = record["control_number"]
    record_titles = record["titles"]
    record_book_autocomplete = record["titles"][0]["title"]
    expected_status_code = 200
    expected_result = {
        "_collections": ["Literature"],
        "_ui_display": {
            "document_type": ["article"],
            "control_number": record_control_number,
            "titles": record_titles,
            "_collections": ["Literature"],
        },
        "author_count": 0,
        "bookautocomplete": {"input": [record_book_autocomplete]},
        "control_number": record_control_number,
        "document_type": ["article"],
        "facet_inspire_doc_type": ["article"],
        "id": record_control_number,
        "titles": record_titles,
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
    compare_data_with_ui_display_field(expected_result, response_data_hits_metadata)


def test_literature_json_v1_response(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit")
    record_control_number = record["control_number"]
    record_titles = record["titles"]

    expected_status_code = 200
    expected_result_metadata = {
        "_collections": ["Literature"],
        "control_number": record_control_number,
        "document_type": ["article"],
        "titles": record_titles,
    }
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result_metadata == response_data_metadata


@pytest.mark.skip(reason="the indexing that adds ``_ui_display`` is not here yet.")
def test_literature_json_v1_response_search(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    record = create_record("lit")

    expected_status_code = 200
    expected_result = []
    response = api_client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    expected_data_hits = response_data["hits"]["hits"]

    assert expected_status_code == response_status_code
    assert expected_result == expected_data_hits


def test_literature_aution_json_authors(api_client, db, create_record):
    headers = {"Accept": "application/json"}
    full_name_1 = faker.name()
    data = {
        "authors": [{"full_name": full_name_1}],
        "collaborations": [{"value": "ATLAS"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = {
        "authors": [{"first_name": full_name_1, "full_name": full_name_1}],
        "collaborations": [{"value": "ATLAS"}],
    }
    response = api_client.get(
        "/literature/{}/authors".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_literature_application_json_references(api_client, db, create_record):
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
                    "$ref": "http://localhost:5000/api/literature/{}".format(
                        record_referenced_control_number
                    )
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
        ]
    }

    response = api_client.get(
        "/literature/{}/references".format(record_control_number), headers=headers
    )
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_authors_json_v1_response(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}

    data = json.loads((datadir / "999108.json").read_text())

    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {
        "_collections": ["Authors"],
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
        "email_addresses": [
            {"current": True, "value": "malda@ias.edu"},
            {"current": False, "hidden": True, "value": "malda@pauli.harvard.edu"},
            {"current": False, "hidden": True, "value": "malda@ias.edu"},
        ],
        "facet_author_name": "J.M.Maldacena.1_Juan Martin Maldacena",
        "ids": [
            {"schema": "INSPIRE ID", "value": "INSPIRE-00304313"},
            {"schema": "INSPIRE BAI", "value": "J.M.Maldacena.1"},
            {"schema": "ORCID", "value": "0000-0002-9127-1687"},
            {"schema": "SPIRES", "value": "HEPNAMES-193534"},
        ],
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
        "should_display_positions": True,
        "status": "active",
        "stub": False,
        "urls": [{"value": "http://www.sns.ias.edu/~malda"}],
    }
    response = api_client.get(
        "/authors/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_result == response_data["metadata"]


def test_authors_default_json_v1_response(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "999108.json").read_text())

    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(
        "/authors/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_authors_default__only_control_number_json_v1_response(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/vnd+inspire.record.control_number+json"}

    data = json.loads((datadir / "999108.json").read_text())

    record = create_record_factory("aut", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = {"control_number": record_control_number}
    response = api_client.get(
        "/authors/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_authors_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "999108.json").read_text())

    record = create_record_factory("aut", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/authors".format(record_control_number), headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_jobs_default_json_v1_response(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record_factory("job", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(f"/jobs/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_jobs_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "955427.json").read_text())

    record = create_record_factory("job", data=data, with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/jobs", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_journals_default_json_v1_response(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1212042.json").read_text())

    record = create_record_factory("jou", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(f"/journals/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_journals_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1212042.json").read_text())

    record = create_record_factory("jou", data=data, with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/journals", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_experiments_default_json_v1_response(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1108739.json").read_text())

    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(f"/experiments/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_experiments_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1108739.json").read_text())

    record = create_record_factory("exp", data=data, with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/experiments", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_conferences_default_json_v1_response(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1185692.json").read_text())

    record = create_record_factory("con", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(f"/conferences/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_conferences_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1185692.json").read_text())

    record = create_record_factory("con", data=data, with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/conferences", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_data_default_json_v1_response(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1.json").read_text())

    record = create_record_factory("dat", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(f"/data/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_data_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1.json").read_text())

    record = create_record_factory("dat", data=data, with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/data", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_institutions_default_json_v1_response(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "902852.json").read_text())

    record = create_record_factory("ins", data=data)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get(f"/institutions/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_metadata


def test_institutions_default_json_v1_response_search(
    api_client, db, create_record_factory, datadir
):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "902852.json").read_text())

    record = create_record_factory("ins", data=data, with_indexing=True)

    expected_status_code = 200
    expected_result = deepcopy(record.json)
    response = api_client.get("/institutions", headers=headers)

    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_data_hits_metadata = response_data_hits[0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_result == response_data_hits_metadata


def test_literature_serialize_experiments(
    es_clear, db, datadir, create_record, create_record_factory
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
    dumped_record = LiteratureMetadataSchemaV1().dump(record).data
    assert dumped_record["accelerator_experiments"] == expected_experiment


def test_literature_ui_serializer_conference_info(
    api_client, db, create_record_factory
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
