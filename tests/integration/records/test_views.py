# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import os
from copy import deepcopy

import pytest
import requests_mock
import vcr
from helpers.providers.faker import faker

from inspirehep.records.api import AuthorsRecord, LiteratureRecord

my_vcr = vcr.VCR(
    serializer="yaml",
    cassette_library_dir=os.path.join(os.path.dirname(__file__), "cassettes"),
    record_mode="once",
)


# FIXME: Move this to a separate file
def test_literature_search_application_json_get(
    api_client, db, es_clear, create_record, datadir
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "control_number": 666,
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }

    create_record("lit", data=data)

    headers = {"Accept": "application/json"}
    expected_status_code = 200
    expected_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "control_number": 666,
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
        "citation_count": 0,
    }

    response = api_client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_data == response_data_metadata


def test_literature_search_application_json_ui_get(
    api_client, db, create_record, es_clear
):
    data = {
        "control_number": 666,
        "titles": [{"title": "Partner walk again seek job."}],
    }
    create_record("lit", data=data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    expected_status_code = 200
    expected_data = {
        "citation_count": 0,
        "control_number": 666,
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }

    response = api_client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_data == response_data_metadata


def test_literature_application_json_get(api_client, db, es_clear, create_record):
    record = create_record("lit")
    record_control_number = record["control_number"]

    expected_status_code = 200
    response = api_client.get("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put(api_client, db, create_record):
    record = create_record("lit")
    record_control_number = record["control_number"]

    expected_status_code = 401
    response = api_client.put("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_delete(api_client, db, create_record):
    record = create_record("lit")
    record_control_number = record["control_number"]

    expected_status_code = 401
    response = api_client.delete("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/literature")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


@pytest.mark.xfail(reason="references.``recid`` is missing from ES serializer")
def test_literature_citations(api_client, db, es_clear, create_record):
    record = create_record("lit")
    record_control_number = record["control_number"]

    data = {
        "references": [
            {
                "recid": record_control_number,
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{record_control_number}"
                },
            }
        ]
    }
    record_citing = create_record("lit", data=data)
    record_citing_control_number = record_citing["control_number"]
    record_citing_titles = record_citing["titles"]

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


@pytest.mark.xfail(reason="references.``recid`` is missing from ES serializer")
def test_literature_citations_with_superseded_citing_records(
    api_client, db, create_record, es_clear
):
    record = create_record("lit")
    record_control_number = record["control_number"]

    record_data = {
        "references": [
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{record_control_number}"
                }
            }
        ],
        "related_records": [
            {
                "record": {"$ref": "https://link-to-commentor-record"},
                "relation": "commented",
            },
            {"record": {"$ref": "https://link-to-any-other-record"}},
        ],
    }
    record_citing = create_record("lit", data=record_data)
    record_citing_control_number = record_citing["control_number"]
    record_citing_titles = record_citing["titles"]

    superseded_record_data = {
        "references": [{"recid": record_control_number}],
        "related_records": [
            {
                "record": {"$ref": "https://link-to-successor-record"},
                "relation": "successor",
            }
        ],
    }
    create_record("lit", data=superseded_record_data)

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

    response = api_client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_empty(api_client, db, create_record, es_clear):
    record = create_record("lit")
    record_control_number = record["control_number"]

    response = api_client.get("/literature/{}/citations".format(record_control_number))
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    expected_status_code = 200
    expected_data = {"metadata": {"citation_count": 0, "citations": []}}

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_missing_pids(api_client, db, es_clear):
    missing_control_number = 1
    response = api_client.get("/literature/{}/citations".format(missing_control_number))
    response_status_code = response.status_code

    expected_status_code = 404

    assert expected_status_code == response_status_code


def test_literature_facets(api_client, db, create_record, es_clear):
    record = create_record("lit")

    response = api_client.get("/literature/facets")
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
        "subject",
        "collaboration",
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
def test_literature_facets_with_selected_facet(api_client, db, create_record, es_clear):
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
        "subject",
        "collaboration",
    ]

    expected_result_hits = {}

    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert expected_result_hits == response_data_hits


def test_literature_facets_author_count_does_not_have_empty_bucket(
    api_client, db, es_clear
):
    response = api_client.get("/literature/facets")
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
    api_client, db, create_record, es_clear
):
    create_record("lit", data={"authors": [{"full_name": "Harun Urhan"}]})
    response = api_client.get("/literature/facets")
    response_data = json.loads(response.data)
    author_count_agg = response_data.get("aggregations")["author_count"]
    buckets = author_count_agg["buckets"]
    assert len(buckets) == 1
    assert buckets[0]["doc_count"] == 1


def test_literature_facets_arxiv(api_client, db, create_record, es_clear):
    record = create_record("lit")
    response = api_client.get("/literature/facets")
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
        "subject",
        "collaboration",
    ]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()

    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    for source in response_data_hits:
        assert expected_data_hits_source == source["_source"]


# FIXME add tests for each facet when we have record ``enhance`` in place


def test_jobs_application_json_get(api_client, db, create_record_factory):
    record = create_record_factory("job", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_put(api_client, db, create_record_factory):
    record = create_record_factory("job", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_delete(api_client, db, create_record_factory):
    record = create_record_factory("job", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/jobs/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/jobs")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_jobs_search_json_get(api_client, db, create_record_factory):
    create_record_factory("job", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/jobs")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_get(api_client, db, create_record_factory):
    record = create_record_factory("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_put(api_client, db, create_record_factory):
    record = create_record_factory("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_delete(api_client, db, create_record_factory):
    record = create_record_factory("jou", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/journals/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/journals")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_journals_search_json_get(api_client, db, create_record_factory):
    create_record_factory("jou", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/journals")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_get(api_client, db, create_record_factory):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_put(api_client, db, create_record_factory):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_delete(api_client, db, create_record_factory):
    record = create_record_factory("exp", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/experiments/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/experiments")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_experiments_search_json_get(api_client, db, create_record_factory):
    create_record_factory("exp", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/experiments")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_get(api_client, db, create_record_factory):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_put(api_client, db, create_record_factory):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_delete(api_client, db, create_record_factory):
    record = create_record_factory("con", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/conferences/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/conferences")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_conferences_search_json_get(api_client, db, create_record_factory):
    create_record_factory("con", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/conferences")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_get(api_client, db, create_record_factory):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_put(api_client, db, create_record_factory):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_delete(api_client, db, create_record_factory):
    record = create_record_factory("dat", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/data/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/data")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_data_search_json_get(api_client, db, create_record_factory):
    create_record_factory("dat", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/data")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_get(api_client, db, create_record_factory):
    record = create_record_factory("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = api_client.get(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_put(api_client, db, create_record_factory):
    record = create_record_factory("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.put(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_delete(api_client, db, create_record_factory):
    record = create_record_factory("ins", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = api_client.delete(f"/institutions/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_application_json_post(api_client, db):
    expected_status_code = 401
    response = api_client.post("/institutions")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_institutions_search_json_get(api_client, db, create_record_factory):
    create_record_factory("ins", with_indexing=True)

    expected_status_code = 200
    response = api_client.get("/institutions")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_facets_collaboration(api_client, db, create_record, es_clear):
    data_1 = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "document_type": ["article"],
        "control_number": 12345,
        "titles": [{"title": "A Title"}],
        "collaborations": [{"value": "Alice"}, {"value": "Collab"}],
    }
    record_1 = create_record("lit", data=data_1)
    data_2 = {"collaborations": [{"value": "Alice"}]}
    record_2 = create_record("lit", data=data_2)

    response = api_client.get("/literature/facets")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_collaboration_buckets = response_data["aggregations"][
        "collaboration"
    ]["buckets"]

    expected_status_code = 200
    expected_collaboration_buckets = [
        {"key": "Alice", "doc_count": 2},
        {"key": "Collab", "doc_count": 1},
    ]

    expected_data = deepcopy(data_1)
    expected_data.update(citation_count=0)

    assert expected_status_code == response_status_code
    assert expected_collaboration_buckets == response_data_collaboration_buckets

    response = api_client.get("/literature?collaboration=Collab")
    response_data = json.loads(response.data)
    response_status_code = response.status_code

    assert expected_status_code == response_status_code
    assert expected_data == response_data["hits"]["hits"][0]["metadata"]


def test_author_facets(api_client, db, create_record_factory, es_clear):
    record = create_record_factory("lit")

    response = api_client.get("/literature/facets?facet_name=hep-author-publication")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = [
        "author",
        "author_count",
        "doc_type",
        "earliest_date",
        "collaboration",
    ]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys


def test_import_article_view_400_bad_arxiv(api_client, db):
    resp = api_client.get("/literature/import/bad_arxiv:0000.0000")

    expected_msg = "bad_arxiv:0000.0000 is not a recognized identifier"
    resp_msg = json.loads(resp.data)["message"]

    assert expected_msg in resp_msg
    assert resp.status_code == 400


def test_import_article_view_404_non_existing_doi(api_client, db):
    resp = api_client.get("/literature/import/10.1016/j.physletb.2099.08.020")

    expected_msg = "No article found for 10.1016/j.physletb.2099.08.020"
    result_msg = json.loads(resp.data)["message"]

    assert expected_msg in result_msg
    assert resp.status_code == 404


def test_import_article_view_409_because_article_already_exists(
    api_client, base_app, db, create_record
):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    create_record("lit", data=data)

    resp = api_client.get(f"/literature/import/arXiv:{arxiv_value}")

    expected_msg = f"Article arXiv:{arxiv_value} already in Inspire"
    result_msg = json.loads(resp.data)["message"]

    assert expected_msg in result_msg
    assert resp.status_code == 409


def test_import_article_view_404_arxiv_not_found(api_client, db):
    with my_vcr.use_cassette("test_import_article_view_404_arxiv_not_found.yml"):
        resp = api_client.get("/literature/import/arXiv:0000.0000")
        assert resp.status_code == 404


def test_import_article_view_400_doi_not_valid(api_client, db):
    with my_vcr.use_cassette("test_import_article_view_404_doi_not_found.yml"):
        resp = api_client.get("/literature/import/doi:notADoi")
        assert resp.status_code == 400


def test_import_article_arxiv_409_id_already_in_inspire(
    api_client, base_app, db, create_record
):
    arxiv_id = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_id}]}
    data = faker.record("lit", with_control_number=True, data=data)
    create_record("lit", data=data)

    resp = api_client.get(f"/literature/import/arXiv:{arxiv_id}")
    assert resp.status_code == 409


def test_import_article_view_404_website_not_reachable(api_client, db):
    arxiv_id = faker.arxiv()
    with requests_mock.Mocker() as mocker:
        mocker.get(
            f"http://export.arxiv.org/oai2?verb=GetRecord&identifier=oai:arXiv.org:{arxiv_id}&metadataPrefix=arXiv",
            status_code=500,
        )
        resp = api_client.get(f"/literature/import/arXiv:{arxiv_id}")
        assert resp.status_code == 502


def test_import_article_view_500_arxiv_broken_record(api_client, db):
    arxiv_id = "0804.1111"
    with my_vcr.use_cassette("test_import_article_view_500_arxiv_broken_record.yml"):
        resp = api_client.get(f"/literature/import/arXiv:{arxiv_id}")
        assert resp.status_code == 500


def test_import_article_view_200_arxiv(api_client, db):
    arxiv_id = "1607.06746"
    with my_vcr.use_cassette("test_import_article_view_200_arxiv.yaml"):
        resp = api_client.get(f"/literature/import/{arxiv_id}")
        result = resp.json["data"]

        expected_title = "CP violation in the B system"
        assert resp.status_code == 200
        assert result["title"] == expected_title
        assert result["arxiv_id"] == arxiv_id
        assert result["arxiv_categories"] == ["hep-ex", "hep-ph"]


def test_import_article_view_200_crossref(api_client, db):
    doi = "10.1016/j.physletb.2012.08.020"
    with my_vcr.use_cassette("test_import_article_view_200_crossref.yaml"):
        resp = api_client.get(f"/literature/import/{doi}")
        result = resp.json["data"]

        expected_title = "Observation of a new particle in the search for the Standard Model Higgs boson with the ATLAS detector at the LHC"
        assert resp.status_code == 200
        assert result["title"] == expected_title
        assert result["doi"] == doi


def test_citation_summary_facet(api_client, db, create_record_factory):
    unpublished_paper_data = {
        "refereed": False,
        "citation_count": 8,
        "facet_author_name": "BAI_N. Girard",
        "citeable": True,
    }
    create_record_factory("lit", data=unpublished_paper_data, with_indexing=True)

    published_papers_citation_count = [409, 83, 26, 153, 114, 97, 137]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "BAI_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "literature/facets?author=BAI_N.%20Girard&facet_name=citation-summary"
    )

    expected_citation_summary_aggregation = {
        "doc_count": 8,
        "h-index": {"value": {"all": 8, "published": 7}},
        "citations": {
            "buckets": {
                "all": {
                    "doc_count": 8,
                    "citations_count": {"value": 1027.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0.0-1.0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {
                                "key": "1.0-10.0",
                                "from": 1.0,
                                "to": 10.0,
                                "doc_count": 1,
                            },
                            {
                                "key": "10.0-50.0",
                                "from": 10.0,
                                "to": 50.0,
                                "doc_count": 1,
                            },
                            {
                                "key": "50.0-100.0",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 2,
                            },
                            {
                                "key": "100.0-250.0",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 3,
                            },
                            {
                                "key": "250.0-500.0",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 1,
                            },
                            {"key": "500.0-*", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 128.375},
                },
                "published": {
                    "doc_count": 7,
                    "citations_count": {"value": 1019.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0.0-1.0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {
                                "key": "1.0-10.0",
                                "from": 1.0,
                                "to": 10.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "10.0-50.0",
                                "from": 10.0,
                                "to": 50.0,
                                "doc_count": 1,
                            },
                            {
                                "key": "50.0-100.0",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 2,
                            },
                            {
                                "key": "100.0-250.0",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 3,
                            },
                            {
                                "key": "250.0-500.0",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 1,
                            },
                            {"key": "500.0-*", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 145.571_428_571_428_58},
                },
            }
        },
    }
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_citation_summary = response_data["aggregations"]["citation_summary"]
    assert response_status_code == 200
    assert response_data_citation_summary == expected_citation_summary_aggregation


def test_h_index_with_more_papers_than_citations(api_client, db, create_record_factory):
    published_papers_citation_count = [1, 2, 2, 2, 2]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "BAI_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "literature/facets?author=BAI_N.%20Girard&facet_name=citation-summary"
    )

    expected_h_index = {"value": {"all": 2, "published": 2}}

    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_h_index = response_data["aggregations"]["citation_summary"]["h-index"]
    assert response_status_code == 200
    assert response_data_h_index == expected_h_index


def test_h_index_with_as_many_papers_as_citations(
    api_client, db, create_record_factory
):
    published_papers_citation_count = [5, 5, 5, 5, 5]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "BAI_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "literature/facets?author=BAI_N.%20Girard&facet_name=citation-summary"
    )

    expected_h_index = {"value": {"all": 5, "published": 5}}

    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_h_index = response_data["aggregations"]["citation_summary"]["h-index"]
    assert response_status_code == 200
    assert response_data_h_index == expected_h_index


def test_citation_summary_facet_filters(api_client, db, create_record_factory):
    book_chapter_paper = {
        "refereed": False,
        "citation_count": 8,
        "facet_author_name": "BAI_N. Girard",
        "citeable": True,
        "facet_inspire_doc_type": ["book chapter"],
    }
    create_record_factory("lit", data=book_chapter_paper, with_indexing=True)

    published_papers_citation_count = [409, 83, 26]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "BAI_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "literature/facets?author=BAI_N.%20Girard&facet_name=citation-summary&doc_type=book%20chapter"
    )

    expected_citation_summary_aggregation = {
        "doc_count": 1,
        "h-index": {"value": {"all": 1, "published": 0}},
        "citations": {
            "buckets": {
                "all": {
                    "doc_count": 1,
                    "citations_count": {"value": 8.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0.0-1.0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {
                                "key": "1.0-10.0",
                                "from": 1.0,
                                "to": 10.0,
                                "doc_count": 1,
                            },
                            {
                                "key": "10.0-50.0",
                                "from": 10.0,
                                "to": 50.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "50.0-100.0",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "100.0-250.0",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "250.0-500.0",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 0,
                            },
                            {"key": "500.0-*", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 8.0},
                },
                "published": {
                    "doc_count": 0,
                    "citations_count": {"value": 0.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0.0-1.0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {
                                "key": "1.0-10.0",
                                "from": 1.0,
                                "to": 10.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "10.0-50.0",
                                "from": 10.0,
                                "to": 50.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "50.0-100.0",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "100.0-250.0",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "250.0-500.0",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 0,
                            },
                            {"key": "500.0-*", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": None},
                },
            }
        },
    }
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_citation_summary = response_data["aggregations"]["citation_summary"]
    assert response_status_code == 200
    assert response_data_citation_summary == expected_citation_summary_aggregation


def test_create_literature_record_through_api(api_client, db, create_user_and_token):
    data = faker.record("lit")
    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = api_client.post(
        "literature", json=data, headers=headers, content_type=content_type
    )
    expected_data = deepcopy(data)

    record = LiteratureRecord.get_record_by_pid_value(response.json["id"])
    expected_data["control_number"] = response.json["id"]

    assert str(record.id) == response.json["id_"]
    assert record == expected_data

    del expected_data["_collections"]

    assert response.status_code == 201
    assert response.json["metadata"] == expected_data


def test_update_literature_record_through_api(api_client, db, create_user_and_token):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)

    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    data["titles"].append({"title": "Another Title"})
    response = api_client.put(
        f"literature/{rec['control_number']}",
        json=data,
        headers=headers,
        content_type=content_type,
    )
    expected_data = deepcopy(data)

    record = LiteratureRecord.get_record_by_pid_value(rec["control_number"])
    assert str(record.id) == response.json["id_"]
    assert record == expected_data

    del expected_data["_collections"]

    assert response.status_code == 200
    assert response.json["metadata"] == expected_data


def test_create_literature_record_through_api_with_wrong_token(
    api_client, db, create_user_and_token
):
    data = faker.record("lit")

    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}_WRONG"}
    content_type = "application/json"
    response = api_client.post(
        f"literature", json=data, headers=headers, content_type=content_type
    )

    assert response.status_code == 401


def test_update_literature_record_through_api_with_wrong_token(
    api_client, db, create_user_and_token
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)

    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}_WRONG"}
    content_type = "application/json"
    data["titles"].append({"title": "Another Title"})
    response = api_client.put(
        f"literature/{rec['control_number']}",
        json=data,
        headers=headers,
        content_type=content_type,
    )

    assert response.status_code == 401


def test_create_literature_record_through_api_no_token_provided(api_client, db):
    data = faker.record("lit")

    content_type = "application/json"
    response = api_client.post(f"literature", json=data, content_type=content_type)

    assert response.status_code == 401


def test_update_literature_record_through_api_no_token_provided(api_client, db):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)

    content_type = "application/json"
    data["titles"].append({"title": "Another Title"})
    response = api_client.put(
        f"literature/{rec['control_number']}", json=data, content_type=content_type
    )
    assert response.status_code == 401


def test_create_author_record_through_api(api_client, db, create_user_and_token):
    data = faker.record("aut")
    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = api_client.post(
        "authors", json=data, headers=headers, content_type=content_type
    )
    expected_data = deepcopy(data)
    expected_data["control_number"] = response.json["id"]

    record = AuthorsRecord.get_record_by_pid_value(response.json["id"])
    assert str(record.id) == response.json["id_"]
    assert record == expected_data

    del expected_data["_collections"]

    assert response.status_code == 201
    assert response.json["metadata"] == expected_data


def test_update_author_record_through_api(api_client, db, create_user_and_token):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)

    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    data["name"] = {"value": "Some name"}
    response = api_client.put(
        f"authors/{rec['control_number']}",
        json=data,
        headers=headers,
        content_type=content_type,
    )
    expected_data = deepcopy(data)

    record = AuthorsRecord.get_record_by_pid_value(rec["control_number"])
    assert str(record.id) == response.json["id_"]
    assert record == expected_data

    del expected_data["_collections"]

    assert response.status_code == 200
    assert response.json["metadata"] == expected_data


def test_create_author_record_through_api_with_wrong_token(
    api_client, db, create_user_and_token
):
    data = faker.record("aut")

    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}_WRONG"}
    content_type = "application/json"
    response = api_client.post(
        f"authors", json=data, headers=headers, content_type=content_type
    )

    assert response.status_code == 401


def test_update_author_record_through_api_with_wrong_token(
    api_client, db, create_user_and_token
):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)

    token = create_user_and_token()
    headers = {"Authorization": f"Bearer {token.access_token}_WRONG"}
    content_type = "application/json"
    data["name"] = {"value": "Some name"}
    response = api_client.put(
        f"authors/{rec['control_number']}",
        json=data,
        headers=headers,
        content_type=content_type,
    )

    assert response.status_code == 401


def test_create_author_record_through_api_no_token_provided(api_client, db):
    data = faker.record("aut")

    content_type = "application/json"
    response = api_client.post(f"authors", json=data, content_type=content_type)

    assert response.status_code == 401


def test_update_author_record_through_api_no_token_provided(api_client, db):
    data = faker.record("aut")
    rec = AuthorsRecord.create(data)

    content_type = "application/json"
    data["name"] = {"value": "Some name"}
    response = api_client.put(
        f"authors/{rec['control_number']}", json=data, content_type=content_type
    )
    assert response.status_code == 401


def test_literature_search_citation_count_filter(api_client, db, create_record_factory):
    paper_with_requested_number_of_citations = create_record_factory(
        "lit", data={"citation_count": 101}, with_indexing=True
    )

    papers_citation_count = [409, 83, 26]
    for count in papers_citation_count:
        create_record_factory("lit", data={"citation_count": count}, with_indexing=True)

    response = api_client.get("literature?citation_count=101--102")

    response_data = json.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == paper_with_requested_number_of_citations.json["control_number"]
    )


def test_literature_search_refereed_filter(api_client, db, create_record_factory):
    refereed_paper = create_record_factory(
        "lit", data={"refereed": True}, with_indexing=True
    )

    create_record_factory("lit", data={"refereed": False}, with_indexing=True)

    response = api_client.get("literature?refereed=true")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == refereed_paper.json["control_number"]
    )


def test_literature_search_citeable_filter(api_client, db, create_record_factory):
    citeable_paper = create_record_factory(
        "lit", data={"citeable": True}, with_indexing=True
    )

    create_record_factory("lit", data={"citeable": False}, with_indexing=True)

    response = api_client.get("literature?citeable=true")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == citeable_paper.json["control_number"]
    )


def test_citation_summary_facet_excluded_filters(api_client, db, create_record_factory):
    non_refereed_paper = {
        "refereed": False,
        "citation_count": 8,
        "facet_author_name": "BAI_N. Girard",
        "citeable": True,
    }
    create_record_factory("lit", data=non_refereed_paper, with_indexing=True)

    published_papers_citation_count = [409, 83, 26, 153, 114, 97, 137]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "BAI_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "literature/facets?author=BAI_N.%20Girard&facet_name=citation-summary&refereed=True&citeable=False&citation_count=500--505"
    )
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["aggregations"]["citation_summary"]["doc_count"] == 8
