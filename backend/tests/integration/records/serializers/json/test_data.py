#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import deepcopy

import orjson
from helpers.utils import (
    create_record,
    search_index_flush_and_refresh,
)
from marshmallow import utils


def test_data_json(inspire_app, datadir):
    headers = {"Accept": "application/json"}

    data = orjson.loads((datadir / "1.json").read_text())

    record = create_record("dat", data=data)
    record_control_number = record["control_number"]

    create_record(
        "lit",
        data={
            "titles": [{"title": "Lit title"}],
            "references": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/data/{record_control_number}"
                    }
                }
            ],
        },
    )
    expected_metadata = deepcopy(record) | {
        "citation_count": 1,
        "citation_count_without_self_citations": 0,
    }
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    with inspire_app.test_client() as client:
        response = client.get(f"/data/{record_control_number}", headers=headers)

    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_data_search_json(inspire_app, datadir):
    data = orjson.loads((datadir / "1.json").read_text())
    record = create_record("dat", data=data)

    create_record(
        "lit",
        data={
            "titles": [{"title": "Lit title"}],
            "references": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/data/{record['control_number']}"
                    }
                }
            ],
        },
    )

    expected_result = deepcopy(record) | {
        "citation_count": 1,
        "citation_count_without_self_citations": 0,
    }
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    # to make sure we index the citation count
    record.index(delay=False)
    search_index_flush_and_refresh("dat")

    with inspire_app.test_client() as client:
        headers = {"Accept": "application/json"}
        response = client.get("/data", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]
    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_data_detail_links(inspire_app):
    expected_status_code = 200
    record = create_record("dat")
    expected_links = {
        "json": f"http://localhost:5000/data/{record['control_number']}?format=json"
    }
    with inspire_app.test_client() as client:
        response = client.get(f"/data/{record['control_number']}")
    assert response.status_code == expected_status_code
    assert response.json["links"] == expected_links


def test_data_detail_json_format(inspire_app):
    expected_status_code = 200
    record = create_record("dat")
    expected_content_type = "application/json"
    with inspire_app.test_client() as client:
        response = client.get(f"/data/{record['control_number']}?format=json")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type


def test_data_detail_literature_records(inspire_app):
    lit_record = create_record("lit", data={"titles": [{"title": "Lit title"}]})
    record = create_record(
        "dat",
        data={
            "literature": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
                    }
                }
            ]
        },
    )
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}
        response = client.get(f"/data/{record['control_number']}", headers=headers)

    response_metadata = response.json["metadata"]
    expected_literature_records = [
        {
            "control_number": lit_record["control_number"],
            "titles": [{"title": "Lit title"}],
            "record": {
                "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
            },
        }
    ]
    assert response_metadata["literature"] == expected_literature_records


def test_data_search_citation_count(inspire_app):
    record = create_record(
        "dat",
    )
    create_record(
        "lit",
        data={
            "titles": [{"title": "Lit title"}],
            "references": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/data/{record['control_number']}"
                    }
                }
            ],
        },
    )

    create_record(
        "lit",
        data={
            "titles": [{"title": "Lit title 2"}],
            "references": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/data/{record['control_number']}"
                    }
                }
            ],
        },
    )

    # to make sure we index the citation count
    record.index(delay=False)
    search_index_flush_and_refresh("dat")

    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}
        response = client.get("/data/", headers=headers)

    response_metadata = response.json["hits"]["hits"][0]["metadata"]

    expected_citation_count = 2
    assert expected_citation_count == response_metadata["citation_count"]


def test_data_detail_citation_count(inspire_app):
    record = create_record(
        "dat",
    )
    create_record(
        "lit",
        data={
            "titles": [{"title": "Lit title"}],
            "references": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/data/{record['control_number']}"
                    }
                }
            ],
        },
    )

    create_record(
        "lit",
        data={
            "titles": [{"title": "Lit title 2"}],
            "references": [
                {
                    "record": {
                        "$ref": f"http://localhost:5000/api/data/{record['control_number']}"
                    }
                }
            ],
        },
    )

    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}
        response = client.get(f"/data/{record['control_number']}", headers=headers)

    expected_citation_count = 2
    response_metadata = response.json["metadata"]

    assert expected_citation_count == response_metadata["citation_count"]


def test_data_detail_schema_limits_authors(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}
        authors = [{"full_name": f"Author {i}"} for i in range(15)]
        data_record = create_record("dat", data={"authors": authors})

        response = client.get(f"/data/{data_record['control_number']}", headers=headers)

        response_metadata = response.json["metadata"]
        assert "authors" in response_metadata
        assert len(response_metadata["authors"]) == 10
        assert response_metadata["number_of_authors"] == 15


def test_data_detail_schema_fetches_for_author_count(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}

        literature_authors = [{"full_name": f"Author {i}"} for i in range(15)]
        lit_record = create_record("lit", data={"authors": literature_authors})

        data_record = create_record(
            "dat",
            data={
                "literature": [
                    {
                        "record": {
                            "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
                        }
                    }
                ]
            },
        )

        response = client.get(f"/data/{data_record['control_number']}", headers=headers)
        response_metadata = response.json["metadata"]
        assert "authors" not in response_metadata
        assert response_metadata["number_of_authors"] == 15


def test_data_public_schema_does_not_limit_authors(inspire_app):
    with inspire_app.test_client() as client:
        authors = [{"full_name": f"Author {i}"} for i in range(15)]
        data_record = create_record("dat", data={"authors": authors})

        response = client.get(f"/data/{data_record['control_number']}")

        response_metadata = response.json["metadata"]

        assert "authors" in response_metadata
        assert len(response_metadata["authors"]) == 15


def test_data_authors_schema(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/json"}
        authors = [{"full_name": f"Author {i}"} for i in range(15)]
        data_record = create_record("dat", data={"authors": authors})

        response = client.get(
            f"/data/{data_record['control_number']}/authors", headers=headers
        )

        response_metadata = response.json["metadata"]
        assert "authors" in response_metadata
        assert len(response_metadata["authors"]) == 15


def test_data_author_schema_fetches_from_linked_literature(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/json"}
        literature_authors = [{"full_name": f"Author {i}"} for i in range(15)]
        lit_record = create_record("lit", data={"authors": literature_authors})

        data_record = create_record(
            "dat",
            data={
                "literature": [
                    {
                        "record": {
                            "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
                        }
                    }
                ]
            },
        )

        response = client.get(
            f"/data/{data_record['control_number']}/authors", headers=headers
        )
        response_metadata = response.json["metadata"]
        assert "authors" in response_metadata
        assert len(response_metadata["authors"]) == 15


def test_data_elasticsearch_schema_limits_authors(inspire_app):
    with inspire_app.test_client() as client:
        authors = [{"full_name": f"Author {i}"} for i in range(15)]
        create_record("dat", data={"authors": authors})

        response = client.get("/data/")
        response_data_hit = response.json["hits"]["hits"][0]["metadata"]
        assert "authors" in response_data_hit
        assert len(response_data_hit["authors"]) == 10
        assert "number_of_authors" not in response_data_hit


def test_data_elasticsearch_schema_fetches_from_linked_literature(inspire_app):
    with inspire_app.test_client() as client:
        literature_authors = [{"full_name": f"Author {i}"} for i in range(15)]
        lit_record = create_record("lit", data={"authors": literature_authors})

        create_record(
            "dat",
            data={
                "literature": [
                    {
                        "record": {
                            "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
                        }
                    }
                ]
            },
        )

        response = client.get("/data/")
        response_data_hit = response.json["hits"]["hits"][0]["metadata"]
        assert "authors" in response_data_hit
        assert len(response_data_hit["authors"]) == 10
        assert "number_of_authors" not in response_data_hit


def test_data_elasticsearch_schema_serialize_literature(inspire_app):
    with inspire_app.test_client() as client:
        lit_record = create_record("lit", data={"titles": [{"title": "Lit title"}]})
        create_record(
            "dat",
            data={
                "literature": [
                    {
                        "record": {
                            "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
                        }
                    }
                ]
            },
        )

        expected_literature = [
            {
                "control_number": lit_record["control_number"],
                "titles": [{"title": "Lit title"}],
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{lit_record['control_number']}"
                },
            }
        ]

        response = client.get("/data/")
        response_data = orjson.loads(response.data)
        response_data_hit = response_data["hits"]["hits"][0]["metadata"]
        assert response_data_hit["literature"] == expected_literature


def test_data_detail_sets_date(inspire_app):
    with inspire_app.test_client() as client:
        headers = {"Accept": "application/vnd+inspire.record.ui+json"}

        data_record = create_record(
            "dat",
            data={"creation_date": "2022-01-01"},
        )

        response = client.get(f"/data/{data_record['control_number']}", headers=headers)
        response_metadata = response.json["metadata"]
        assert response_metadata["date"] == "Jan 1, 2022"
