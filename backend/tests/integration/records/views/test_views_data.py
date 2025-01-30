#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import urllib.parse

import orjson
from helpers.providers.faker import faker
from helpers.utils import create_record, create_record_factory, create_user_and_token


def test_data_application_json_get(inspire_app):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_put_with_token(inspire_app):
    record = create_record("dat")
    record_control_number = record["control_number"]
    token = create_user_and_token()

    expected_status_code = 200

    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}
    with inspire_app.test_client() as client:
        response = client.put(
            f"/data/{record_control_number}", headers=headers, json=record
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_put_without_token(inspire_app):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_delete(inspire_app):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_post_with_token(inspire_app):
    expected_status_code = 201
    token = create_user_and_token()

    headers = {"Authorization": "BEARER " + token.access_token}
    rec_data = faker.record("dat")

    with inspire_app.test_client() as client:
        response = client.post("/data", headers=headers, json=rec_data)

    response_status_code = response.status_code
    assert expected_status_code == response_status_code


def test_data_application_json_post_without_token(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/data")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_search_json_get(inspire_app):
    create_record_factory("dat", with_indexing=True)

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get("/data")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_record_search_results(inspire_app):
    record = create_record("dat")

    expected_metadata = record.serialize_for_es()

    with inspire_app.test_client() as client:
        result = client.get("/data")

    expected_metadata.pop("_created")
    expected_metadata.pop("_updated")

    assert result.json["hits"]["total"] == 1
    assert result.json["hits"]["hits"][0]["metadata"] == expected_metadata


def test_data_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("dat")
    record = create_record("dat", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/data/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "data"


def test_data_facets(inspire_app):
    create_record("dat")
    with inspire_app.test_client() as client:
        response = client.get("/data/facets")
    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = ["author"]
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_data_facets_author_count(inspire_app):
    create_record(
        "dat", data={"authors": [{"full_name": "Author 1"}, {"full_name": "Author 2"}]}
    )
    with inspire_app.test_client() as client:
        response = client.get("/data/facets")
    response_data = orjson.loads(response.data)
    author_count_agg = response_data.get("aggregations")["author"]
    buckets = author_count_agg["buckets"]
    assert len(buckets) == 2
    assert buckets[0]["doc_count"] == 1
    assert buckets[1]["doc_count"] == 1


def test_data_facets_author_filter(inspire_app):
    author = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author['control_number']}"
            },
            "full_name": author["name"]["value"],
        }
    ]
    create_record("dat", data={"authors": authors})
    create_record("dat", data={"authors": [{"full_name": "Author2"}]})
    with inspire_app.test_client() as client:
        response = client.get(
            f"/data?author={author['control_number']}_{urllib.parse.quote(author['name']['value'])}"
        )
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["authors"][0]["full_name"]
        == author["name"]["value"]
    )


def test_data_facets_author_filter_from_literature(inspire_app):
    author = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author['control_number']}"
            },
            "full_name": author["name"]["value"],
        }
    ]
    literature = create_record("lit", data={"authors": authors})
    create_record("dat", data={"literature": [{"record": literature["self"]}]})
    create_record("dat", data={"authors": [{"full_name": "Author2"}]})
    with inspire_app.test_client() as client:
        response = client.get(
            f"/data?author={author['control_number']}_{urllib.parse.quote(author['name']['value'])}"
        )
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["authors"][0]["full_name"]
        == author["name"]["value"]
    )
