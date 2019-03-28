# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest


def test_literature_application_json_get(api_client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put(api_client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_delete(api_client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/literature/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_citations(api_client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    data = {"references": [{"recid": record_control_number}]}

    record_citing = create_record("lit", data=data, with_indexing=True)
    record_citing_control_number = record_citing.json["control_number"]
    record_citing_titles = record_citing.json["titles"]

    expected_status_code = 200
    expected_data = {
        "metadata": {
            "citation_count": 1,
            "citations": [
                {
                    "control_number": record_citing_control_number,
                    "titles": record_citing_titles,
                }
            ],
        }
    }

    response = api_client.get("/literature/{}/citations".format(record_control_number))
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_with_superseded_citing_records(
    api_client, db, create_record
):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    record_data = {
        "references": [{"recid": record_control_number}],
        "related_records": [
            {
                "record": {"$ref": "https://link-to-commentor-record"},
                "relation": "commented",
            },
            {"record": {"$ref": "https://link-to-any-other-record"}},
        ],
    }

    record_citing = create_record("lit", data=record_data, with_indexing=True)
    record_citing_control_number = record_citing.json["control_number"]
    record_citing_titles = record_citing.json["titles"]

    superseded__record_data = {
        "references": [{"recid": record_control_number}],
        "related_records": [
            {
                "record": {"$ref": "https://link-to-successor-record"},
                "relation": "successor",
            }
        ],
    }
    create_record("lit", data=superseded__record_data, with_indexing=True)

    expected_status_code = 200
    expected_data = {
        "metadata": {
            "citation_count": 1,
            "citations": [
                {
                    "control_number": record_citing_control_number,
                    "titles": record_citing_titles,
                }
            ],
        }
    }

    response = api_client.get("/literature/{}/citations".format(record_control_number))
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_empty(api_client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    response = api_client.get("/literature/{}/citations".format(record_control_number))
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    expected_status_code = 200
    expected_data = {"metadata": {"citation_count": 0, "citations": []}}

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_missing_pids(api_client, db, create_record):
    missing_control_number = 1
    response = api_client.get("/literature/{}/citations".format(missing_control_number))
    response_status_code = response.status_code

    expected_status_code = 404

    assert expected_status_code == response_status_code


def test_literature_facets(api_client, db, create_record):
    record = create_record("lit")

    response = api_client.get("/literature/facets/")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = [
        "arxiv_categories",
        "author",
        "author_count",
        "doc_type",
        "earliest_date",
        "experiment",
        "subject",
    ]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys


@pytest.mark.xfail(
    reason=(
        "Indexing for tests needs to be fixed so that elasticsearch is populated "
        "with custom fields that are used for facets, hence we cannot test the facets."
    )
)
def test_literature_facets_with_selected_facet(api_client, db, create_record):
    record_1 = create_record("lit")
    data = {"document_type": ["Thesis"]}
    record_2 = create_record("lit", data=data)

    response = api_client.get("/literature/facets/?doc_type=article")
    response_data = json.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = [
        "arxiv_categories",
        "author",
        "author_count",
        "doc_type",
        "earliest_date",
        "experiment",
        "subject",
    ]

    expected_result_hits = {}

    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert expected_result_hits == response_data_hits


def test_literature_facets_author_count_does_not_have_empty_bucket(
    api_client, db, create_record
):
    response = api_client.get("/literature/facets/")
    response_data = json.loads(response.data)
    author_count_agg = response_data.get("aggregations")["author_count"]
    assert author_count_agg["buckets"] == []


@pytest.mark.xfail(
    reason="""Indexing for tests needs to be fixed so that elasticsearch is populated
    with custom fields that are used for facets. Since for now all facets have only
    empty buckets, this test can not be enabled.
    """
)
def test_literature_facets_author_count_returns_non_empty_bucket(
    api_client, db, create_record
):
    create_record(
        "lit", data={"authors": [{"full_name": "Harun Urhan"}]}, with_indexing=True
    )
    response = api_client.get("/literature/facets/")
    response_data = json.loads(response.data)
    author_count_agg = response_data.get("aggregations")["author_count"]
    buckets = author_count_agg["buckets"]
    assert len(buckets) == 1
    assert bucket[0]["doc_count"] == 1


def test_literature_facets_arxiv(api_client, db, create_record):
    record = create_record("lit", with_indexing=True)
    response = api_client.get("/literature/facets/")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data["aggregations"].keys())
    response_data_hits = response_data["hits"]["hits"]

    expected_status_code = 200
    expected_data_hits_source = {}
    expected_facet_keys = [
        "arxiv_categories",
        "author",
        "author_count",
        "doc_type",
        "earliest_date",
        "experiment",
        "subject",
    ]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()

    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    for source in response_data_hits:
        assert expected_data_hits_source == source["_source"]


# FIXME add tests for each facet when we have record ``enhance`` in place


def test_jobs_application_json_get(api_client, db, create_record):
    record = create_record("job", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_put(api_client, db, create_record):
    record = create_record("job", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_delete(api_client, db, create_record):
    record = create_record("job", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/jobs/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_search_json_get(api_client, db, create_record):
    create_record("job", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/jobs/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_get(api_client, db, create_record):
    record = create_record("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_put(api_client, db, create_record):
    record = create_record("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_delete(api_client, db, create_record):
    record = create_record("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/journals/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_search_json_get(api_client, db, create_record):
    create_record("jou", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/journals/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_get(api_client, db, create_record):
    record = create_record("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_put(api_client, db, create_record):
    record = create_record("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_delete(api_client, db, create_record):
    record = create_record("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/experiments/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_search_json_get(api_client, db, create_record):
    create_record("exp", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/experiments/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_get(api_client, db, create_record):
    record = create_record("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_put(api_client, db, create_record):
    record = create_record("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_delete(api_client, db, create_record):
    record = create_record("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/conferences/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_search_json_get(api_client, db, create_record):
    create_record("con", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/conferences/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_get(api_client, db, create_record):
    record = create_record("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_put(api_client, db, create_record):
    record = create_record("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_delete(api_client, db, create_record):
    record = create_record("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/data/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_search_json_get(api_client, db, create_record):
    create_record("dat", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/data/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_get(api_client, db, create_record):
    record = create_record("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_put(api_client, db, create_record):
    record = create_record("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_delete(api_client, db, create_record):
    record = create_record("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/institutions/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_search_json_get(api_client, db, create_record):
    create_record("ins", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/institutions/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code
