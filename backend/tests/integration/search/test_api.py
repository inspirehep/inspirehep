# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import urllib

import mock
import pytest
from helpers.utils import create_record, override_config
from requests.exceptions import RequestException

from inspirehep.search.api import AuthorsSearch, JournalsSearch, LiteratureSearch


def test_literature_get_records_by_pids_returns_correct_record(inspire_app):
    record1 = create_record("lit")
    record1_control_number = record1["control_number"]
    record2 = create_record("lit")
    record2_control_number = record2["control_number"]
    expected_control_numbers = [record1_control_number, record2_control_number]
    result = LiteratureSearch().get_records_by_pids([("lit", record1_control_number)])
    assert len(result) == 1
    assert (
        json.loads(result[0]._ui_display)["control_number"] == record1["control_number"]
    )

    result = LiteratureSearch().get_records_by_pids(
        [("lit", record1_control_number), ("lit", record2_control_number)]
    )

    assert len(result) == len(expected_control_numbers)
    for rec in result:
        assert rec.to_dict()["control_number"] in expected_control_numbers


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_with_journal_title_without_dots(
    inspire_app
):

    query = "Phys. Lett. B 704 (2011) 223"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "page_start": "223",
                "year": 2011,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record(
        "jou",
        data={"short_title": "Phys.Lett.B", "journal_title": {"title": "Phys Lett B"}},
    )
    create_record("lit", cited_record_json)

    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


def test_facets_for_publication_info_search(inspire_app):

    query = "Phys. Lett. B 704 (2011) 223"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "page_start": "223",
                "year": 2011,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record(
        "jou",
        data={"short_title": "Phys.Lett.B", "journal_title": {"title": "Phys Lett B"}},
    )
    create_record("lit", cited_record_json)

    with inspire_app.test_client() as client:

        response = client.get("api/literature/facets", query_string={"q": query})
    response_record = response.json
    assert len(response_record["hits"]["hits"]) == 0
    assert len(response_record["aggregations"]) > 0


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_example_1(inspire_app):

    query = "Phys. Lett. B 704 (2011) 223"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "page_start": "223",
                "year": 2011,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record(
        "jou",
        data={
            "short_title": "Phys.Lett.B",
            "journal_title": {"title": "Phys. Lett. B"},
        },
    )
    create_record("lit", cited_record_json)

    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_with_multiple_records_with_the_same_journal_title(
    inspire_app
):

    query = "Phys. Lett. B 704 (2011) 223"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "page_start": "223",
                "year": 2011,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    cited_record_2_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 2,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Phys.Lett.B",
                "journal_volume": "704",
                "page_start": "666",
                "year": 2011,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }

    create_record(
        "jou",
        data={
            "short_title": "Phys.Lett.B",
            "journal_title": {"title": "Phys. Lett. B"},
        },
    )
    create_record("lit", cited_record_json)
    create_record("lit", cited_record_2_json)

    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_example_2(inspire_app):

    query = "W. Buchmüller and O. Philipsen, Nucl. Phys. B 443 (1995) 47"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_title": "Nucl.Phys.B",
                "journal_volume": "443",
                "page_end": "69",
                "page_start": "47",
                "year": 1995,
            }
        ],
        "titles": [
            {
                "title": "Phase structure and phase transition of the SU(2) Higgs model in three-dimensions"
            }
        ],
    }

    create_record(
        "jou",
        data={
            "short_title": "Nucl.Phys.B",
            "journal_title": {"title": "Nucl. Phys. B"},
        },
    )
    create_record("lit", cited_record_json)

    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_example_3(inspire_app):
    query = "Phys. Rev. Lett., 65:21–24, 1990"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_record": {
                    "$ref": "https://inspirehep.net/api/journals/1214495"
                },
                "journal_title": "Phys.Rev.Lett.",
                "journal_volume": "65",
                "page_end": "24",
                "page_start": "21",
                "year": 1990,
            },
            {
                "artid": "2920",
                "journal_record": {
                    "$ref": "https://inspirehep.net/api/journals/1214495"
                },
                "journal_title": "Phys.Rev.Lett.",
                "journal_volume": "65",
                "material": "erratum",
                "page_start": "2920",
                "year": 1990,
            },
        ],
        "titles": [
            {
                "title": "Phase structure and phase transition of the SU(2) Higgs model in three-dimensions"
            }
        ],
    }

    create_record("lit", cited_record_json)
    create_record(
        "jou",
        data={
            "short_title": "Phys.Rev.Lett.",
            "journal_title": {"title": "Phys. Rev. Lett"},
        },
    )

    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_with_leading_zeros_in_page_artid(
    inspire_app
):
    query = "Phys. Rev. D 82 0074024 (2010)"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "journal_record": {
                    "$ref": "https://inspirehep.net/api/journals/1214495"
                },
                "journal_title": "Phys.Rev.D",
                "journal_volume": "82",
                "page_start": "74024",
                "year": 2010,
            }
        ],
        "titles": [
            {
                "title": "Phase structure and phase transition of the SU(2) Higgs model in three-dimensions"
            }
        ],
    }

    create_record("lit", cited_record_json)
    create_record(
        "jou",
        data={"short_title": "Phys.Rev.D", "journal_title": {"title": "Phys. Rev. D"}},
    )

    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


@pytest.mark.vcr()
def test_return_record_for_publication_info_search_with_old_format(inspire_app):
    query = "JHEP 1806 (2018) 131"

    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "131",
                "journal_record": {
                    "$ref": "https://inspirehep.net/api/journals/1213103"
                },
                "journal_title": "JHEP",
                "journal_volume": "06",
                "page_start": "131",
                "year": 2018,
            }
        ],
        "titles": [
            {
                "title": "Phase structure and phase transition of the SU(2) Higgs model in three-dimensions"
            }
        ],
    }

    create_record("lit", cited_record_json)
    expected_control_number = 1

    with inspire_app.test_client() as client:

        response = client.get("api/literature", query_string={"q": query})

    response_record = response.json
    response_record_control_number = response_record["hits"]["hits"][0]["metadata"][
        "control_number"
    ]

    assert expected_control_number == response_record_control_number
    assert 200 == response.status_code


@mock.patch("inspirehep.search.api.get_reference_from_grobid")
def test_reference_search_with_request_exception(
    mock_get_reference_from_grobid, inspire_app
):
    query = "Phys. Lett. B 704 (2011) 223"
    mock_get_reference_from_grobid.side_effect = RequestException()
    with inspire_app.test_client() as client:
        response = client.get("api/literature", query_string={"q": query})

    assert 200 == response.status_code


@mock.patch("inspirehep.search.api.get_reference_from_grobid")
def test_reference_search_with_exception(mock_get_reference_from_grobid, inspire_app):
    query = "Phys. Lett. B 704 (2011) 223"
    mock_get_reference_from_grobid.side_effect = Exception()
    with inspire_app.test_client() as client:
        response = client.get("api/literature", query_string={"q": query})
    assert 200 == response.status_code


@pytest.mark.vcr()
def test_reference_search_without_journal_title(inspire_app):
    query = "michele vallisneri PRL 116, 221101 (2016)"
    with inspire_app.test_client() as client:
        response = client.get("api/literature", query_string={"q": query})

    assert 200 == response.status_code


def test_reference_convert_old_publication_info_to_new_with_empty_reference(
    inspire_app
):
    reference = {"reference": {"publication_info": {}}}
    result = LiteratureSearch().convert_old_publication_info_to_new(reference)
    assert reference == result


@mock.patch("inspirehep.search.api.convert_old_publication_info_to_new")
def test_reference_convert_old_publication_info_to_new_with_exception(
    mock_convert_old_publication_info_to_new, inspire_app
):
    mock_convert_old_publication_info_to_new.side_effect = Exception()
    reference = {
        "reference": {
            "publication_info": {
                "journal_title": "JHEP",
                "journal_volume": "06",
                "page_start": "131",
                "year": 2018,
            }
        }
    }
    result = LiteratureSearch().convert_old_publication_info_to_new(reference)
    assert reference == result


def test_empty_literature_search(inspire_app):
    create_record("lit")
    create_record("lit")
    with inspire_app.test_client() as client:
        response = client.get("api/literature")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_literature_search_with_parameter(inspire_app):
    record1 = create_record("lit")
    create_record("lit")
    record1_control_number = record1["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"api/literature?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_empty_authors_search(inspire_app):
    create_record("aut")
    create_record("aut")
    with inspire_app.test_client() as client:
        response = client.get("api/authors")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_authors_search_with_parameter(inspire_app):
    record1 = create_record("aut")
    create_record("aut")
    record1_control_number = record1["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"api/authors?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_empty_authors_search_query(inspire_app):
    query_to_dict = AuthorsSearch().query_from_iq("").to_dict()

    expexted_query = {"query": {"match_all": {}}, "track_total_hits": True}
    assert expexted_query == query_to_dict


def test_authors_search_query(inspire_app):
    query_to_dict = AuthorsSearch().query_from_iq("J Ellis").to_dict()

    expexted_query = {
        "query": {
            "bool": {
                "should": [
                    {"match": {"names_analyzed": "J Ellis"}},
                    {"match": {"names_analyzed_initials": "J Ellis"}},
                    {"query_string": {"query": "J Ellis"}},
                ]
            }
        },
        "track_total_hits": True,
    }
    assert expexted_query == query_to_dict


def test_authors_query_for_query_with_colon(inspire_app):
    query_to_dict = (
        AuthorsSearch().query_from_iq("positions.record.$ref:905189").to_dict()
    )

    expected_query = {
        "query": {"query_string": {"query": "positions.record.$ref:905189"}},
        "track_total_hits": True,
    }
    assert expected_query == query_to_dict


def test_empty_jobs_search(inspire_app):
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "closed"})
    with inspire_app.test_client() as client:
        response = client.get("api/jobs")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_jobs_search_with_parameter(inspire_app):
    record1 = create_record("job", data={"status": "open"})
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "closed"})
    record1_control_number = record1["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"api/jobs?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_empty_conferences_search(inspire_app):
    create_record("con")
    create_record("con")
    with inspire_app.test_client() as client:
        response = client.get("api/conferences")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])


def test_conferences_search_with_parameter(inspire_app):
    record1 = create_record("con")
    create_record("con")
    record1_control_number = record1["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"api/conferences?q={record1_control_number}")

    expected_results_count = 1
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert (
        record1_control_number
        == response.json["hits"]["hits"][0]["metadata"]["control_number"]
    )


def test_citations_query_result(inspire_app):
    record_control_number = 12345
    # create self_citation
    record_cited = create_record(
        "lit",
        data={"control_number": record_control_number},
        literature_citations=[record_control_number],
    )
    # create correct citation
    record_citing = create_record("lit", literature_citations=[record_control_number])

    with inspire_app.test_client() as client:
        response = client.get(f"api/literature/{record_control_number}/citations")

    assert response.json["metadata"]["citation_count"] == 1
    citation = response.json["metadata"]["citations"][0]
    assert citation["control_number"] == record_citing["control_number"]


@pytest.mark.vcr()
def test_big_query_execute_without_recursion_depth_exception(inspire_app):
    with inspire_app.test_client() as client:

        response = client.get(
            "api/literature", query_string={"q": "find a name" + " or a name" * 300}
        )
    assert response.status_code == 200


def test_public_api_generates_correct_links_in_literature_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/literature/?q=&size=10&page=1",
        "bibtex": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=bibtex",
        "latex-eu": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=latex-eu",
        "latex-us": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=latex-us",
        "json": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=json",
    }
    record = create_record("lit")
    cn = record["control_number"]
    expected_details_links = {
        "bibtex": f"http://localhost:5000/api/literature/{cn}?format=bibtex",
        "latex-eu": f"http://localhost:5000/api/literature/{cn}?format=latex-eu",
        "latex-us": f"http://localhost:5000/api/literature/{cn}?format=latex-us",
        "json": f"http://localhost:5000/api/literature/{cn}?format=json",
        "citations": f"http://localhost:5000/api/literature/?q=refersto%3Arecid%3A{cn}",
    }
    with inspire_app.test_client() as client:
        url = "/api/literature"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_authors_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/authors/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/authors/?q=&size=10&page=1&format=json",
    }
    record = create_record("aut")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/authors/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/authors"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_jobs_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/jobs/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/jobs/?q=&size=10&page=1&format=json",
    }
    record = create_record("job", data={"status": "open"})
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/jobs/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/jobs"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_journals_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/journals/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/journals/?q=&size=10&page=1&format=json",
    }
    record = create_record("jou")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/journals/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/journals"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_experiments_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/experiments/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/experiments/?q=&size=10&page=1&format=json",
    }
    record = create_record("exp")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/experiments/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/experiments"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_conferences_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/conferences/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/conferences/?q=&size=10&page=1&format=json",
    }
    record = create_record("con")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/conferences/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/conferences"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


@pytest.mark.xfail(
    reason="Json Serializer for search is not yet configured for data collection so it's using default Invenio one."
)
def test_public_api_generates_correct_links_in_data_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/data/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/data/?q=&size=10&page=1&format=json",
    }
    record = create_record("dat")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/data/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/data"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_institutions_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/institutions/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/institutions/?q=&size=10&page=1&format=json",
    }
    record = create_record("ins")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/institutions/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/institutions"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_generates_correct_links_in_seminars_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/seminars/?q=&size=10&page=1",
        "json": "http://localhost:5000/api/seminars/?q=&size=10&page=1&format=json",
    }
    record = create_record("sem")
    cn = record["control_number"]
    expected_details_links = {
        "json": f"http://localhost:5000/api/seminars/{cn}?format=json"
    }
    with inspire_app.test_client() as client:
        url = "/api/seminars"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    record_details_links = response.json["hits"]["hits"][0]["links"]
    assert response_links == expected_search_links
    assert record_details_links == expected_details_links


def test_public_api_returns_400_when_requested_too_much_results(inspire_app):
    expected_response = {
        "status": 400,
        "message": "Maximum search page size of `1000` results exceeded.",
    }

    with inspire_app.test_client() as client:
        url = "/api/seminars?size=1001"
        response = client.get(url)
        assert response.status_code == 400
        assert response.json == expected_response


def test_journal_title_normalization(inspire_app):
    create_record(
        "jou",
        data={
            "journal_title": {"title": "Physical Review Accelerators and Beams"},
            "short_title": "Phys.Rev.Accel.Beams",
        },
    )
    journal_title = "Physical Review Accelerators and Beams"
    expected_journal_title = "Phys.Rev.Accel.Beams"
    result_journal_title = JournalsSearch().normalize_title(journal_title)

    assert expected_journal_title == result_journal_title


def test_journal_title_normalization_with_multiple_spaces(inspire_app):
    create_record(
        "jou",
        data={"journal_title": {"title": "Nucl Phys B"}, "short_title": "Nucl.Phys.B"},
    )
    journal_title = "Nucl.    Phys.    B"
    expected_journal_title = "Nucl.Phys.B"
    result_journal_title = JournalsSearch().normalize_title(journal_title)

    assert expected_journal_title == result_journal_title


def test_journal_title_normalization_without_match(inspire_app):
    create_record(
        "jou",
        data={
            "journal_title": {"title": "Physical Review Accelerators and Beams"},
            "short_title": "Phys.Rev.Accel.Beams",
        },
    )
    journal_title = "Something else"
    result_journal_title = JournalsSearch().normalize_title(journal_title)

    assert journal_title == result_journal_title
