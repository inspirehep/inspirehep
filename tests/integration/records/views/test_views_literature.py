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
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


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
        "citations_by_year": [],
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


def test_literature_citations(api_client, db, es_clear, create_record):
    record = create_record("lit")
    record_control_number = record["control_number"]

    data = {
        "references": [
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{record_control_number}"
                }
            }
        ],
        "publication_info": [{"year": 2019}],
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
                    "earliest_date": "2019-01-01",
                    "publication_info": [{"year": 2019}],
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
                "record": {"$ref": "https://link-to-commentor-record/1"},
                "relation": "commented",
            },
            {"record": {"$ref": "https://link-to-any-other-record/2"}},
        ],
        "publication_info": [{"year": 2019}],
    }
    record_citing = create_record("lit", data=record_data)
    record_citing_control_number = record_citing["control_number"]
    record_citing_titles = record_citing["titles"]

    superseded_record_data = {
        "references": [
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{record_control_number}"
                }
            }
        ],
        "related_records": [
            {
                "record": {"$ref": "https://link-to-successor-record/2"},
                "relation": "successor",
            }
        ],
        "publication_info": [{"year": 2019}],
    }
    record_superseded = create_record("lit", data=superseded_record_data)
    record_superseded_control_number = record_superseded["control_number"]
    record_superseded_titles = record_superseded["titles"]

    expected_status_code = 200

    expected_count = 2
    expected_citation_citing = {
        "control_number": record_citing_control_number,
        "earliest_date": "2019-01-01",
        "publication_info": [{"year": 2019}],
        "titles": record_citing_titles,
    }
    expected_citation_superseded = {
        "control_number": record_superseded_control_number,
        "earliest_date": "2019-01-01",
        "publication_info": [{"year": 2019}],
        "titles": record_superseded_titles,
    }

    response = api_client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_count == response_data_metadata["citation_count"]
    assert expected_citation_citing in response_data_metadata["citations"]
    assert expected_citation_superseded in response_data_metadata["citations"]


def test_literature_citations_with_non_citeable_collection(
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
                "record": {"$ref": "https://link-to-commentor-record/1"},
                "relation": "commented",
            },
            {"record": {"$ref": "https://link-to-any-other-record/2"}},
        ],
        "publication_info": [{"year": 2019}],
    }
    create_record("lit", data=record_data)

    record_with_no_citable_collection_data = {
        "_collections": ["Fermilab"],
        "references": [
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{record_control_number}"
                }
            }
        ],
        "publication_info": [{"year": 2019}],
    }
    record_with_no_citable_collection = create_record(
        "lit", data=record_with_no_citable_collection_data
    )

    expected_status_code = 200

    response = api_client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert expected_status_code == response_status_code
    assert record_with_no_citable_collection["control_number"] not in [
        record["control_number"] for record in response_data["metadata"]["citations"]
    ]


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
    assert len(response_data["hits"]["hits"]) == 0


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
    expected_data.update(citation_count=0, citations_by_year=[])

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
    data = {"authors": authors, "preprint_date": "2010-01-01", "citeable": True}

    expected_response = {"value": {"2010": 1}}
    literature = create_record("lit", faker.record("lit", data=data))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )
    literature._index()  # Index again after citation was added

    request_param = {
        "author": literature.serialize_for_es()["facet_author_name"][0],
        "facet_name": "citations-by-year",
    }
    es_clear.indices.refresh("records-hep")

    response = api_client.get(f"literature/facets/?{urlencode(request_param)}")

    assert response.json["aggregations"]["citations_by_year"] == expected_response


def test_literature_citation_annual_summary_for_many_records(
    api_client, db, es_clear, create_record
):
    literature1 = create_record("lit", faker.record("lit"))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature1["control_number"]],
            data={"preprint_date": "2010-01-01"},
        ),
    )
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature1["control_number"]],
            data={"preprint_date": "2013-01-01"},
        ),
    )
    literature2 = create_record("lit", faker.record("lit"))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature2["control_number"]],
            data={"preprint_date": "2012-01-01"},
        ),
    )
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature2["control_number"]],
            data={"preprint_date": "2013-01-01"},
        ),
    )
    literature1._index()
    literature2._index()
    request_param = {"facet_name": "citations-by-year"}
    es_clear.indices.refresh("records-hep")
    response = api_client.get(f"literature/facets/?{urlencode(request_param)}")
    expected_response = {"value": {"2013": 2, "2012": 1, "2010": 1}}
    assert response.json["aggregations"]["citations_by_year"] == expected_response


def test_literature_search_user_does_not_get_fermilab_collection(
    api_client, db, es_clear, create_record, datadir
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Fermilab"],
        "control_number": 666,
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }

    create_record("lit", data=data)

    expected_status_code = 200

    response = api_client.get("/literature")
    response_status_code = response.status_code
    response_data = json.loads(response.data)

    assert response_data["hits"]["total"] == 0
    assert expected_status_code == response_status_code


def test_literature_search_cataloger_gets_fermilab_collection(
    api_client, db, es_clear, create_record, datadir, create_user
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Fermilab"],
        "control_number": 666,
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    create_record("lit", data=data)

    expected_status_code = 200
    expected_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Fermilab"],
        "control_number": 666,
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
        "citation_count": 0,
        "citations_by_year": [],
    }

    response = api_client.get("/literature")
    response_status_code = response.status_code
    response_data = json.loads(response.data)
    assert response_data["hits"]["total"] == 1

    response_data_metadata = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_data == response_data_metadata


def test_literature_search_permissions(
    api_client, db, es_clear, create_record, datadir, create_user, logout
):
    create_record("lit", data={"_collections": ["Fermilab"]})
    rec_literature = create_record("lit", data={"_collections": ["Literature"]})

    response = api_client.get("/literature")
    response_data = json.loads(response.data)
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == rec_literature["control_number"]
    )

    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    response = api_client.get("/literature")
    response_data = json.loads(response.data)
    assert response_data["hits"]["total"] == 2

    logout(api_client)

    response = api_client.get("/literature")
    response_data = json.loads(response.data)
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == rec_literature["control_number"]
    )
