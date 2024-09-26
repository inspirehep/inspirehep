#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from urllib.parse import quote, urlencode

import orjson
from helpers.providers.faker import faker
from helpers.utils import (
    create_record,
    create_record_factory,
    create_user,
    create_user_and_token,
    logout,
)
from inspirehep.accounts.roles import Roles
from inspirehep.records.api import LiteratureRecord
from inspirehep.records.errors import MaxResultWindowRESTError
from invenio_accounts.testutils import login_user_via_session
from invenio_search import current_search


def test_literature_search_application_json_get(inspire_app):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }

    record = create_record("lit", data=data)

    headers = {"Accept": "application/json"}
    expected_status_code = 200
    expected_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "control_number": record["control_number"],
        "document_type": ["article"],
        "earliest_date": record.created.strftime("%Y-%m-%d"),
        "titles": [{"title": "Partner walk again seek job."}],
        "citation_count": 0,
        "author_count": 0,
        "citation_count_without_self_citations": 0,
    }
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_data == response_data_metadata


def test_literature_search_application_json_ui_get(inspire_app):
    data = {
        "titles": [{"title": "Partner walk again seek job."}],
        "preprint_date": "2019-07-02",
    }
    record = create_record("lit", data=data)
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    expected_status_code = 200
    expected_data = {
        "citation_count": 0,
        "citation_count_without_self_citations": 0,
        "control_number": record["control_number"],
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
        "preprint_date": "2019-07-02",
        "date": "Jul 2, 2019",
        "is_collection_hidden": False,
    }

    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_data == response_data_metadata


def test_literature_application_json_get(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    expected_status_code = 200
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put_without_token(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]
    headers = {"If-Match": '"0"'}
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.put(f"/literature/{record_control_number}", headers=headers)
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_delete_without_token(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.delete(f"/literature/{record_control_number}")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post_without_token(inspire_app):
    expected_status_code = 401
    with inspire_app.test_client() as client:
        response = client.post("/literature")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put_with_token(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]
    token = create_user_and_token()

    expected_status_code = 200

    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}
    with inspire_app.test_client() as client:
        response = client.put(
            f"/literature/{record_control_number}", headers=headers, json=record
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_delete_with_token(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]
    token = create_user_and_token()

    expected_status_code = 403

    headers = {"Authorization": "BEARER " + token.access_token}
    with inspire_app.test_client() as client:
        response = client.delete(
            f"/literature/{record_control_number}", headers=headers
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post_with_token(inspire_app):
    expected_status_code = 201
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    rec_data = faker.record("lit")

    with inspire_app.test_client() as client:
        response = client.post("/literature", headers=headers, json=rec_data)
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put_with_token_authenticated(inspire_app):
    expected_status_code = 200
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}
    record = create_record("lit")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        response = client.put(
            f"/literature/{record_control_number}", headers=headers, json=record
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post_with_token_not_authenticated(inspire_app):
    expected_status_code = 403
    token = create_user_and_token("cataloger")
    headers = {"Authorization": "BEARER " + token.access_token}
    rec_data = faker.record("lit")

    with inspire_app.test_client() as client:
        response = client.post("/literature", headers=headers, json=rec_data)
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put_with_token_(inspire_app):
    expected_status_code = 200
    token = create_user_and_token("cataloger")
    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}
    record = create_record("lit")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        response = client.put(
            f"/literature/{record_control_number}", headers=headers, json=record
        )
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_citations(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    data = {
        "references": [
            {
                "record": {
                    "$ref": (
                        f"http://localhost:5000/api/literature/{record_control_number}"
                    )
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
                    "earliest_date": "2019",
                    "publication_info": [{"year": 2019}],
                }
            ],
        }
    }

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_with_superseded_citing_records(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    record_data = {
        "references": [
            {
                "record": {
                    "$ref": (
                        f"http://localhost:5000/api/literature/{record_control_number}"
                    )
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
                    "$ref": (
                        f"http://localhost:5000/api/literature/{record_control_number}"
                    )
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
    record_superseded["control_number"]
    record_superseded["titles"]

    expected_status_code = 200

    expected_count = 1
    expected_citation_citing = {
        "control_number": record_citing_control_number,
        "earliest_date": "2019",
        "publication_info": [{"year": 2019}],
        "titles": record_citing_titles,
    }

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)
    response_data_metadata = response_data["metadata"]

    assert expected_status_code == response_status_code
    assert expected_count == response_data_metadata["citation_count"]
    assert expected_citation_citing in response_data_metadata["citations"]


def test_literature_citations_with_non_citeable_collection(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    record_data = {
        "references": [
            {
                "record": {
                    "$ref": (
                        f"http://localhost:5000/api/literature/{record_control_number}"
                    )
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
                    "$ref": (
                        f"http://localhost:5000/api/literature/{record_control_number}"
                    )
                }
            }
        ],
        "publication_info": [{"year": 2019}],
    }
    record_with_no_citable_collection = create_record(
        "lit", data=record_with_no_citable_collection_data
    )

    expected_status_code = 200

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)

    assert expected_status_code == response_status_code
    assert record_with_no_citable_collection["control_number"] not in [
        record["control_number"] for record in response_data["metadata"]["citations"]
    ]


def test_literature_citations_empty(inspire_app):
    record = create_record("lit")
    record_control_number = record["control_number"]

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}/citations")
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)

    expected_status_code = 200
    expected_data = {"metadata": {"citation_count": 0, "citations": []}}

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_missing_pids(inspire_app):
    missing_control_number = 1
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{missing_control_number}/citations")
    response_status_code = response.status_code

    expected_status_code = 404

    assert expected_status_code == response_status_code


def test_literature_citations_with_size_bigger_than_maximum(
    inspire_app, override_config
):
    record = create_record("lit", data=faker.record("lit"))
    headers = {"Accept": "application/json"}
    config = {"MAX_API_RESULTS": 3}
    with override_config(**config), inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{record['control_number']}/citations?size=5", headers=headers
        )
    response_status_code = response.status_code
    response_data = orjson.loads(response.get_data())
    expected_status_code = 400
    expected_response = MaxResultWindowRESTError().description
    assert expected_status_code == response_status_code
    assert expected_response == response_data["message"]


def test_literature_facets(inspire_app):
    create_record("lit")

    with inspire_app.test_client() as client:
        response = client.get("/literature/facets")
    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = sorted(
        [
            "arxiv_categories",
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "subject",
            "collaboration",
            "rpp",
        ]
    )
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_literature_cataloger_facets(inspire_app):
    user = create_user(role=Roles.cataloger.value)

    create_record("lit")

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/literature/facets")

    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = sorted(
        [
            "arxiv_categories",
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "subject",
            "collaboration",
            "collection",
            "curation_collection",
            "rpp",
        ]
    )
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0


def test_literature_facets_author_count_does_not_have_empty_bucket(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/literature/facets")
    response_data = orjson.loads(response.data)
    author_count_agg = response_data.get("aggregations")["author_count"]
    assert author_count_agg["buckets"] == []


def test_literature_facets_author_count_returns_non_empty_bucket(inspire_app):
    create_record(
        "lit",
        data={"authors": [{"full_name": "Harun Urhan"}, {"full_name": "John Doe"}]},
    )
    with inspire_app.test_client() as client:
        response = client.get("/literature/facets")
    response_data = orjson.loads(response.data)
    author_count_agg = response_data.get("aggregations")["author_count"]
    buckets = author_count_agg["buckets"]
    assert len(buckets) == 1
    assert buckets[0]["doc_count"] == 1


def test_literature_facets_doc_type_has_bucket_help(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get("/literature/facets")
    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_bucket_help = (
        response_data.get("aggregations").get("doc_type").get("meta").get("bucket_help")
    )

    expected_status_code = 200
    expected_text = (
        "Published papers are believed to have undergone rigorous peer review."
    )
    expected_link = "https://help.inspirehep.net/knowledge-base/faq/#faq-published"

    assert expected_status_code == response_status_code
    assert "published" in response_data_facet_bucket_help
    assert expected_text == response_data_facet_bucket_help["published"]["text"]
    assert expected_link == response_data_facet_bucket_help["published"]["link"]
    assert len(response_data["hits"]["hits"]) == 0


def test_literature_search_citation_count_filter(inspire_app):
    paper_with_requested_number_of_citations = create_record_factory(
        "lit", data={"citation_count": 101}, with_indexing=True
    )

    papers_citation_count = [409, 83, 26]
    for count in papers_citation_count:
        create_record_factory("lit", data={"citation_count": count}, with_indexing=True)
    with inspire_app.test_client() as client:
        response = client.get("/literature?citation_count=101--102")

    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == paper_with_requested_number_of_citations.json["control_number"]
    )


def test_literature_search_refereed_filter(inspire_app):
    refereed_paper = create_record_factory(
        "lit", data={"refereed": True}, with_indexing=True
    )

    create_record_factory("lit", data={"refereed": False}, with_indexing=True)

    with inspire_app.test_client() as client:
        response = client.get("/literature?refereed=true")
    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == refereed_paper.json["control_number"]
    )


def test_literature_search_citeable_filter(inspire_app):
    citeable_paper = create_record_factory(
        "lit", data={"citeable": True}, with_indexing=True
    )

    create_record_factory("lit", data={"citeable": False}, with_indexing=True)

    with inspire_app.test_client() as client:
        response = client.get("/literature?citeable=true")
    response_data = orjson.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == citeable_paper.json["control_number"]
    )


def test_literature_citation_annual_summary(inspire_app):
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
    literature.index(delay=False)  # Index again after citation was added

    request_param = {
        "author": literature.serialize_for_es()["facet_author_name"][0],
        "facet_name": "citations-by-year",
    }
    current_search.flush_and_refresh("records-hep")

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/facets/?{urlencode(request_param)}")

    assert response.json["aggregations"]["citations_by_year"] == expected_response


def test_literature_citation_annual_summary_for_many_records(inspire_app):
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
    literature1.index(delay=False)
    literature2.index(delay=False)
    request_param = {"facet_name": "citations-by-year"}

    current_search.flush_and_refresh("records-hep")

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/facets/?{urlencode(request_param)}")

    expected_response = {"value": {"2013": 2, "2012": 1, "2010": 1}}
    assert response.json["aggregations"]["citations_by_year"] == expected_response


def test_literature_search_user_does_not_get_fermilab_collection(inspire_app):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Fermilab"],
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }

    create_record("lit", data=data)

    expected_status_code = 200

    with inspire_app.test_client() as client:
        response = client.get("/literature")
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)

    assert response_data["hits"]["total"] == 0
    assert expected_status_code == response_status_code


def test_literature_search_cataloger_gets_fermilab_collection(inspire_app):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Fermilab"],
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
    }
    user = create_user(role=Roles.cataloger.value)

    record = create_record("lit", data=data)

    expected_status_code = 200
    expected_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Fermilab"],
        "control_number": record["control_number"],
        "earliest_date": record.created.strftime("%Y-%m-%d"),
        "document_type": ["article"],
        "titles": [{"title": "Partner walk again seek job."}],
        "citation_count": 0,
        "citation_count_without_self_citations": 0,
        "author_count": 0,
        "self": {
            "$ref": f"http://localhost:5000/api/literature/{record['control_number']}"
        },
    }

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/literature")
    response_status_code = response.status_code
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1

    response_data_metadata = response_data["hits"]["hits"][0]["metadata"]

    assert expected_status_code == response_status_code
    assert expected_data == response_data_metadata


def test_literature_search_permissions(inspire_app):
    create_record("lit", data={"_collections": ["Fermilab"]})
    rec_literature = create_record("lit", data={"_collections": ["Literature"]})

    with inspire_app.test_client() as client:
        response = client.get("/literature")
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == rec_literature["control_number"]
    )

    user = create_user(role=Roles.cataloger.value)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("/literature")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 2

        logout(client)

        response = client.get("/literature")
    response_data = orjson.loads(response.data)
    assert response_data["hits"]["total"] == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == rec_literature["control_number"]
    )


def test_literature_search_permissions_private_collections_read(inspire_app):
    hidden_collection = "HEP Hidden"
    hidden_collection_role_prefix = hidden_collection.lower().replace(" ", "-")
    record = create_record("lit", data={"_collections": [hidden_collection]})
    user = create_user(role="user")
    user_read = create_user(role=f"{hidden_collection_role_prefix}-read")
    user_readwrite = create_user(role=f"{hidden_collection_role_prefix}-read-write")
    cataloger = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        # without login
        response = client.get("/literature")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 0

        response = client.get(f"/literature?q=_collections:{quote(hidden_collection)}")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 0

        response = client.get(f"/literature/{record['control_number']}")
        assert response.status_code == 401

        # user login
        login_user_via_session(client, email=user.email)
        response = client.get(f"/literature?q=_collections:{quote(hidden_collection)}")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 0

        response = client.get(f"/literature/{record['control_number']}")
        assert response.status_code == 403
        logout(client)

        # user with read permission
        login_user_via_session(client, email=user_read.email)
        response = client.get(f"/literature?q=_collections:{quote(hidden_collection)}")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 1

        response = client.get(f"/literature/{record['control_number']}")
        assert response.status_code == 200
        logout(client)

        # user with read-write permission
        login_user_via_session(client, email=user_readwrite.email)
        response = client.get(f"/literature?q=_collections:{quote(hidden_collection)}")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 1

        response = client.get(f"/literature/{record['control_number']}")
        assert response.status_code == 200
        logout(client)

        # cataloger
        login_user_via_session(client, email=cataloger.email)
        response = client.get(f"/literature?q=_collections:{quote(hidden_collection)}")
        response_data = orjson.loads(response.data)
        assert response_data["hits"]["total"] == 1

        response = client.get(f"/literature/{record['control_number']}")
        assert response.status_code == 200
        logout(client)


def test_literature_search_permissions_private_collections_put(inspire_app):
    hidden_collection = "HEP Hidden"
    record = create_record("lit", data={"_collections": [hidden_collection]})
    token = create_user_and_token(user_role="user")
    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}

    with inspire_app.test_client() as client:
        response = client.put(
            "/literature/{}".format(record["control_number"]),
            headers=headers,
            json=record,
        )
        assert response.status_code == 403


def test_literature_search_permissions_private_collections_put_user_read(inspire_app):
    hidden_collection = "HEP Hidden"
    hidden_collection_role_prefix = hidden_collection.lower().replace(" ", "-")
    record = create_record("lit", data={"_collections": [hidden_collection]})
    token_read = create_user_and_token(
        user_role=f"{hidden_collection_role_prefix}-read"
    )
    headers_read = {
        "Authorization": "BEARER " + token_read.access_token,
        "If-Match": '"0"',
    }

    with inspire_app.test_client() as client:
        response = client.put(
            "/literature/{}".format(record["control_number"]),
            headers=headers_read,
            json=record,
        )
        assert response.status_code == 403


def test_literature_search_permissions_private_collections_put_user_read_write(
    inspire_app,
):
    hidden_collection = "HEP Hidden"
    hidden_collection_role_prefix = hidden_collection.lower().replace(" ", "-")
    record = create_record("lit", data={"_collections": [hidden_collection]})
    token_readwrite = create_user_and_token(
        user_role=f"{hidden_collection_role_prefix}-read-write"
    )
    headers_readwrite = {
        "Authorization": "BEARER " + token_readwrite.access_token,
        "If-Match": '"0"',
    }

    with inspire_app.test_client() as client:
        response = client.put(
            "/literature/{}".format(record["control_number"]),
            headers=headers_readwrite,
            json=record,
        )
        assert response.status_code == 200


def test_literature_search_permissions_private_collections_put_cataloger(
    inspire_app,
):
    hidden_collection = "HEP Hidden"
    record = create_record("lit", data={"_collections": [hidden_collection]})
    token_readwrite = create_user_and_token(user_role=Roles.cataloger.value)
    headers_cataloger = {
        "Authorization": "BEARER " + token_readwrite.access_token,
        "If-Match": '"0"',
    }

    with inspire_app.test_client() as client:
        response = client.put(
            "/literature/{}".format(record["control_number"]),
            headers=headers_cataloger,
            json=record,
        )
        assert response.status_code == 200


def test_literature_hidden_collection_as_anonymous_user(inspire_app):
    expected_status_code = 401
    rec = create_record("lit", data={"_collections": ["D0 Internal Notes"]})
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{rec['control_number']}")
    assert response.status_code == expected_status_code


def test_literature_hidden_collection_as_cataloger(inspire_app):
    expected_status_code = 200
    rec = create_record("lit", data={"_collections": ["Fermilab"]})

    user = create_user(role=Roles.cataloger.value)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/literature/{rec['control_number']}")
    assert response.status_code == expected_status_code


def test_literature_hidden_collection_as_logged_in_user_not_cataloger(inspire_app):
    expected_status_code = 403
    rec = create_record("lit", data={"_collections": ["D0 Internal Notes"]})

    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(f"/literature/{rec['control_number']}")
    assert response.status_code == expected_status_code


def test_literature_returns_301_when_pid_is_redirected(inspire_app):
    redirected_record = create_record("lit")
    record = create_record("lit", data={"deleted_records": [redirected_record["self"]]})

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{redirected_record.control_number}")
    assert response.status_code == 301
    assert response.location.split("/")[-1] == str(record.control_number)
    assert response.location.split("/")[-2] == "literature"

    with inspire_app.test_client() as client:
        response = client.get(
            f"/literature/{redirected_record.control_number}/references"
        )

        assert response.status_code == 301
        assert response.location.split("/")[-1] == "references"
        assert response.location.split("/")[-2] == str(record.control_number)
        assert response.location.split("/")[-3] == "literature"

    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{redirected_record.control_number}/authors")

        assert response.status_code == 301
        assert response.location.split("/")[-1] == "authors"
        assert response.location.split("/")[-2] == str(record.control_number)
        assert response.location.split("/")[-3] == "literature"


def test_literature_json_put_redirected_record(inspire_app):
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"2"'}
    record_redirected = create_record("lit")
    record = create_record("lit", data={"deleted_records": [record_redirected["self"]]})

    data = dict(record_redirected)
    data["deleted"] = True

    with inspire_app.test_client() as client:
        response = client.put(
            f"/literature/{record_redirected.control_number}",
            headers=headers,
            json=data,
        )
    assert response.status_code == 200
    redirected_record_from_db = LiteratureRecord.get_record_by_pid_value(
        record_redirected.control_number, original_record=True
    )
    record_from_db = LiteratureRecord.get_record_by_pid_value(record.control_number)

    assert dict(redirected_record_from_db) == data
    assert dict(record_from_db) == dict(record)


def test_users_can_access_records_from_hidden_collections(inspire_app):
    record = create_record(
        "lit",
        data={
            "_collections": ["Fermilab"],
            "titles": [{"title": "A literature record from fermilab collection"}],
        },
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record.control_number}")
    assert response.status_code == 200


def test_restricted_file_attach(inspire_app, override_config):
    record = create_record(
        "lit",
        data={
            "documents": [
                {
                    "source": "arxiv",
                    "key": "arXiv:nucl-th_9310031.pdf",
                    "url": "https://inspirehep.net/literature/863300",
                    "original_url": "http://original-url.com/1",
                    "filename": "fermilab.pdf",
                }
            ],
        },
    )
    token = create_user_and_token()

    expected_status_code = 415
    expected_message = (
        "Attached file format is not supported (text/html), please attach a valid file."
    )
    headers = {"Authorization": "BEARER " + token.access_token, "If-Match": '"0"'}
    config = {"FEATURE_FLAG_ENABLE_FILES": True}

    with override_config(**config), inspire_app.test_client() as client:
        response = client.put(
            f"/literature/{record['control_number']}", headers=headers, json=record
        )

    assert expected_status_code == response.status_code
    assert expected_message == response.json["message"]


def test_put_record_returns_validation_errors(inspire_app):
    cataloger = create_user(role=Roles.cataloger.value)
    record = create_record("lit")
    record["inspire_categories"] = [{"term": "Lattice"}, {"term": "Lattice"}]

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=cataloger.email)
        headers = {"If-Match": '"0"'}
        response = client.put(
            f"api/literature/{record['control_number']}",
            headers=headers,
            content_type="application/json",
            json=record,
        )

    assert response.status_code == 400
    assert response.json["errors"][0]["path"] == ["inspire_categories"]
    assert (
        response.json["errors"][0]["message"]
        == "[{'term': 'Lattice'}, {'term': 'Lattice'}] has non-unique elements"
    )
