# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.utils import create_record_factory


def test_citation_summary_facet(api_client):
    unpublished_paper_data = {
        "refereed": False,
        "citation_count": 8,
        "citation_count_without_self_citations": 4,
        "facet_author_name": "NOREC_N. Girard",
        "citeable": True,
    }
    create_record_factory("lit", data=unpublished_paper_data, with_indexing=True)

    published_papers_citation_count = [409, 83, 26, 153, 114, 97, 137]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "citation_count_without_self_citations": count / 2,
            "facet_author_name": "NOREC_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "/literature/facets?author=NOREC_N.%20Girard&facet_name=citation-summary"
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
                            {"key": "0--0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {"key": "1--9", "from": 1.0, "to": 10.0, "doc_count": 1},
                            {"key": "10--49", "from": 10.0, "to": 50.0, "doc_count": 1},
                            {
                                "key": "50--99",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 2,
                            },
                            {
                                "key": "100--249",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 3,
                            },
                            {
                                "key": "250--499",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 1,
                            },
                            {"key": "500--", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 128.375},
                },
                "published": {
                    "doc_count": 7,
                    "citations_count": {"value": 1019.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0--0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {"key": "1--9", "from": 1.0, "to": 10.0, "doc_count": 0},
                            {"key": "10--49", "from": 10.0, "to": 50.0, "doc_count": 1},
                            {
                                "key": "50--99",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 2,
                            },
                            {
                                "key": "100--249",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 3,
                            },
                            {
                                "key": "250--499",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 1,
                            },
                            {"key": "500--", "from": 500.0, "doc_count": 0},
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
    assert len(response_data["hits"]["hits"]) == 0


def test_citation_summary_without_self_citations_facet(
    api_client, enable_self_citations
):
    unpublished_paper_data = {
        "refereed": False,
        "citation_count": 8,
        "citation_count_without_self_citations": 4,
        "facet_author_name": "NOREC_N. Girard",
        "citeable": True,
    }
    create_record_factory("lit", data=unpublished_paper_data, with_indexing=True)

    published_papers_citation_count = [409, 83, 26, 153, 114, 97, 137]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "citation_count_without_self_citations": count / 2,
            "facet_author_name": "NOREC_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "/literature/facets?author=NOREC_N.%20Girard&facet_name=citation-summary&exclude-self-citations"
    )

    expected_citation_summary_aggregation = {
        "doc_count": 8,
        "h-index": {"value": {"all": 7, "published": 7}},
        "citations": {
            "buckets": {
                "all": {
                    "doc_count": 8,
                    "citations_count": {"value": 511.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0--0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {"key": "1--9", "from": 1.0, "to": 10.0, "doc_count": 1},
                            {"key": "10--49", "from": 10.0, "to": 50.0, "doc_count": 3},
                            {
                                "key": "50--99",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 3,
                            },
                            {
                                "key": "100--249",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 1,
                            },
                            {
                                "key": "250--499",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 0,
                            },
                            {"key": "500--", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 63.875},
                },
                "published": {
                    "doc_count": 7,
                    "citations_count": {"value": 507.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0--0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {"key": "1--9", "from": 1.0, "to": 10.0, "doc_count": 0},
                            {"key": "10--49", "from": 10.0, "to": 50.0, "doc_count": 3},
                            {
                                "key": "50--99",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 3,
                            },
                            {
                                "key": "100--249",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 1,
                            },
                            {
                                "key": "250--499",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 0,
                            },
                            {"key": "500--", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 72.428_571_428_571_43},
                },
            }
        },
    }
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_citation_summary = response_data["aggregations"]["citation_summary"]
    assert response_status_code == 200
    assert response_data_citation_summary == expected_citation_summary_aggregation
    assert len(response_data["hits"]["hits"]) == 0


def test_h_index_with_more_papers_than_citations(api_client):
    published_papers_citation_count = [1, 2, 2, 2, 2]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "NOREC_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "/literature/facets?author=NOREC_N.%20Girard&facet_name=citation-summary"
    )

    expected_h_index = {"value": {"all": 2, "published": 2}}

    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_h_index = response_data["aggregations"]["citation_summary"]["h-index"]
    assert response_status_code == 200
    assert response_data_h_index == expected_h_index


def test_h_index_with_as_many_papers_as_citations(api_client):
    published_papers_citation_count = [5, 5, 5, 5, 5]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "NOREC_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "/literature/facets?author=NOREC_N.%20Girard&facet_name=citation-summary"
    )

    expected_h_index = {"value": {"all": 5, "published": 5}}

    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_h_index = response_data["aggregations"]["citation_summary"]["h-index"]
    assert response_status_code == 200
    assert response_data_h_index == expected_h_index


def test_citation_summary_facet_filters(api_client):
    book_chapter_paper = {
        "refereed": False,
        "citation_count": 8,
        "facet_author_name": "NOREC_N. Girard",
        "citeable": True,
        "facet_inspire_doc_type": ["book chapter"],
    }
    create_record_factory("lit", data=book_chapter_paper, with_indexing=True)

    published_papers_citation_count = [409, 83, 26]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "NOREC_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "/literature/facets?author=NOREC_N.%20Girard&facet_name=citation-summary&doc_type=book%20chapter"
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
                            {"key": "0--0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {"key": "1--9", "from": 1.0, "to": 10.0, "doc_count": 1},
                            {"key": "10--49", "from": 10.0, "to": 50.0, "doc_count": 0},
                            {
                                "key": "50--99",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "100--249",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "250--499",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 0,
                            },
                            {"key": "500--", "from": 500.0, "doc_count": 0},
                        ]
                    },
                    "average_citations": {"value": 8.0},
                },
                "published": {
                    "doc_count": 0,
                    "citations_count": {"value": 0.0},
                    "citation_buckets": {
                        "buckets": [
                            {"key": "0--0", "from": 0.0, "to": 1.0, "doc_count": 0},
                            {"key": "1--9", "from": 1.0, "to": 10.0, "doc_count": 0},
                            {"key": "10--49", "from": 10.0, "to": 50.0, "doc_count": 0},
                            {
                                "key": "50--99",
                                "from": 50.0,
                                "to": 100.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "100--249",
                                "from": 100.0,
                                "to": 250.0,
                                "doc_count": 0,
                            },
                            {
                                "key": "250--499",
                                "from": 250.0,
                                "to": 500.0,
                                "doc_count": 0,
                            },
                            {"key": "500--", "from": 500.0, "doc_count": 0},
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


def test_citation_summary_facet_excluded_filters(api_client):
    non_refereed_paper = {
        "refereed": False,
        "citation_count": 8,
        "facet_author_name": "NOREC_N. Girard",
        "citeable": True,
    }
    create_record_factory("lit", data=non_refereed_paper, with_indexing=True)

    published_papers_citation_count = [409, 83, 26, 153, 114, 97, 137]
    for count in published_papers_citation_count:
        data = {
            "refereed": True,
            "citation_count": count,
            "facet_author_name": "NOREC_N. Girard",
            "citeable": True,
        }
        create_record_factory("lit", data=data, with_indexing=True)

    response = api_client.get(
        "/literature/facets?author=NOREC_N.%20Girard&facet_name=citation-summary&refereed=True&citeable=False&citation_count=500--505"
    )
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    assert response_status_code == 200
    assert response_data["aggregations"]["citation_summary"]["doc_count"] == 8
