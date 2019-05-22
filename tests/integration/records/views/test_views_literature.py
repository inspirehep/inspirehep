# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
from copy import deepcopy
from urllib.parse import urlencode

import pytest
from helpers.providers.faker import faker


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


def test_literature_citation_annual_summary(api_client, db, es_clear, create_record):
    author = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author['control_number']}"
            },
            "full_name": author["name"]["value"],
        }
    ]
    data = {"authors": authors, "preprint_date": "2010-01-01"}

    expected_response = {"data": {"2010": 1}}
    literature = create_record("lit", faker.record("lit", data=data))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )

    authors_param = {"author": literature._dump_for_es()["facet_author_name"][0]}
    response = api_client.get(f"literature/annual_summary/?{urlencode(authors_param)}")

    assert response.json == expected_response


def test_literature_citation_annual_summary_with_many_authors(
    api_client, db, es_clear, create_record
):
    author1 = create_record("aut", faker.record("aut"))
    author2 = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author1['control_number']}"
            },
            "full_name": author1["name"]["value"],
        },
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author2['control_number']}"
            },
            "full_name": author2["name"]["value"],
        },
    ]
    data = {"authors": authors, "preprint_date": "2010-01-01"}

    expected_response = {"data": {"2010": 1}}
    literature = create_record("lit", faker.record("lit", data=data))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )

    authors_param = {"author": literature._dump_for_es()["facet_author_name"][1]}
    response = api_client.get(f"literature/annual_summary/?{urlencode(authors_param)}")

    assert response.json == expected_response


def test_literature_citation_annual_summary_no_results(
    api_client, db, es_clear, create_record
):
    author1 = create_record("aut", faker.record("aut"))
    author2 = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author1['control_number']}"
            },
            "full_name": author1["name"]["value"],
        },
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author2['control_number']}"
            },
            "full_name": author2["name"]["value"],
        },
    ]
    data = {"authors": authors, "preprint_date": "2010-01-01"}

    expected_response = {"data": {}}
    literature = create_record("lit", faker.record("lit", data=data))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )

    authors_param = {"author": "Not existing one"}
    response = api_client.get(f"literature/annual_summary/?{urlencode(authors_param)}")

    assert response.json == expected_response


def test_literature_citation_annual_summary_wrong_search_param(
    api_client, db, es_clear, create_record
):
    author1 = create_record("aut", faker.record("aut"))
    author2 = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author1['control_number']}"
            },
            "full_name": author1["name"]["value"],
        },
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author2['control_number']}"
            },
            "full_name": author2["name"]["value"],
        },
    ]
    data = {"authors": authors, "preprint_date": "2010-01-01"}

    expected_response = {"data": {"2010": 1}}
    literature = create_record("lit", faker.record("lit", data=data))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )

    search_param = {"blah": "blah_blah"}
    response = api_client.get(f"literature/annual_summary/?{urlencode(search_param)}")

    assert response.json == expected_response


def test_literature_citation_annual_summary_few_search_params(
    api_client, db, es_clear, create_record
):
    author1 = create_record("aut", faker.record("aut"))
    author2 = create_record("aut", faker.record("aut"))
    authors = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author1['control_number']}"
            },
            "full_name": author1["name"]["value"],
        },
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author2['control_number']}"
            },
            "full_name": author2["name"]["value"],
        },
    ]
    data = {"authors": authors, "preprint_date": "2010-01-01"}

    expected_response = {"data": {"2010": 1}}
    literature = create_record("lit", faker.record("lit", data=data))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )

    search_param = {
        "blah": "blah_blah",
        "author": literature._dump_for_es()["facet_author_name"][1],
    }
    response = api_client.get(f"literature/annual_summary/?{urlencode(search_param)}")

    assert response.json == expected_response
