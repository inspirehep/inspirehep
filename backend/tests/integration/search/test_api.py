# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import os
import urllib

import mock
import orjson
import pytest
from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session
from invenio_search.utils import prefix_index
from requests.exceptions import RequestException

from inspirehep.search.api import (
    AuthorsSearch,
    JobsSearch,
    JournalsSearch,
    LiteratureSearch,
)


def test_literature_get_records_by_pids_returns_correct_record(inspire_app):
    record1 = create_record("lit")
    record1_control_number = record1["control_number"]
    record2 = create_record("lit")
    record2_control_number = record2["control_number"]
    expected_control_numbers = [record1_control_number, record2_control_number]
    result = LiteratureSearch().get_records_by_pids([("lit", record1_control_number)])
    assert len(result) == 1
    assert (
        orjson.loads(result[0]._ui_display)["control_number"]
        == record1["control_number"]
    )

    result = LiteratureSearch().get_records_by_pids(
        [("lit", record1_control_number), ("lit", record2_control_number)]
    )

    assert len(result) == len(expected_control_numbers)
    for rec in result:
        assert rec.to_dict()["control_number"] in expected_control_numbers


def test_return_record_for_publication_info_search_with_journal_title_without_dots(
    inspire_app,
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


def test_return_record_for_journal_info_search_with_journal_title_with_dots_and_spaces(
    inspire_app,
):

    queries = ["Phys.Lett.B", "Phys. Lett. B"]

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

    for query in queries:

        response = LiteratureSearch().query_from_iq(query).execute()

        response_record_control_number = response["hits"]["hits"][0]["_source"][
            "control_number"
        ]

        assert expected_control_number == response_record_control_number


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


def test_return_record_for_publication_info_search_with_multiple_records_with_the_same_journal_title(
    inspire_app,
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
    inspire_app,
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
    inspire_app,
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


def test_jobs_query_from_iq_regression(inspire_app):
    query_to_dict = JobsSearch().query_from_iq("kek-bf-belle-ii").to_dict()

    expected_query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "query_string": {
                            "query": "kek-bf-belle-ii",
                            "default_operator": "AND",
                        }
                    },
                    {"term": {"status": "open"}},
                ]
            }
        },
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


def test_jobs_search_with_parameter_regression(inspire_app):
    create_record("job", data={"status": "open"})
    create_record(
        "job",
        data={
            "status": "open",
            "accelerator_experiments": [{"legacy_name": "KEK-BF-BELLE-II"}],
        },
    )
    create_record(
        "job",
        data={
            "status": "open",
            "accelerator_experiments": [{"legacy_name": "KEK-BF-BELLE-II"}],
        },
    )
    create_record(
        "job",
        data={
            "status": "closed",
            "accelerator_experiments": [{"legacy_name": "KEK-BF-BELLE-II"}],
        },
    )
    create_record(
        "job",
        data={"status": "open", "accelerator_experiments": [{"legacy_name": "VIGO"}]},
    )
    create_record(
        "job",
        data={"status": "open", "accelerator_experiments": [{"legacy_name": "LHC"}]},
    )
    with inspire_app.test_client() as client:
        response = client.get("api/jobs?q=kek-bf-belle-ii")

    curator = create_user(role="cataloger")
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=curator.email)
        response_curator = client.get("api/jobs?q=kek-bf-belle-ii&status=open")

    expected_results_count = 2
    assert expected_results_count == len(response.json["hits"]["hits"])
    assert response.json["hits"]["hits"] == response_curator.json["hits"]["hits"]


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


def test_conferences_search_queries(inspire_app, datadir):
    with os.scandir((datadir / "conferences")) as it:
        for entry in it:
            if entry.is_file():
                with open(entry.path, "r") as j:
                    data = orjson.loads(j.read())
                    create_record("con", data=data)

    def check_response_by_control_number(response, control_number):
        assert len(response.json["hits"]["hits"]) > 0
        assert (
            control_number
            == response.json["hits"]["hits"][0]["metadata"]["control_number"]
        )

    with inspire_app.test_client() as client:
        response = client.get("api/conferences?q=C22-07-27")
        check_response_by_control_number(response, 1830349)

        response = client.get("api/conferences?q=CHEP%202019")
        check_response_by_control_number(response, 1732179)

        response = client.get("api/conferences?q=HYP%202022")
        check_response_by_control_number(response, 1830349)

        response = client.get("api/conferences?q=ICRC%201947")
        check_response_by_control_number(response, 978213)

        response = client.get("api/conferences?q=ICHEP%202014")
        check_response_by_control_number(response, 1203206)

        response = client.get(
            "api/conferences?q=International%20Workshop%20on%20High%20Energy%20Physics%202017"
        )
        check_response_by_control_number(response, 1505770)

        response = client.get(
            "api/conferences?q=International%20conference%20on%20string%20theory%202014"
        )
        check_response_by_control_number(response, 1305234)

        response = client.get("api/conferences?q=C14-06-23.6")
        check_response_by_control_number(response, 1305234)

        response = client.get("api/conferences?q=1638643")
        check_response_by_control_number(response, 1638643)

        response = client.get("api/conferences?q=France")
        hits = response.json["hits"]["hits"]
        assert len(hits) > 0
        for hit in hits:
            addresses = hit["metadata"]["addresses"]
            assert len(addresses) > 0
            countries = [address["country"] for address in addresses]
            assert "France" in countries


def test_citations_query_result(inspire_app):
    record_control_number = 12345
    # create self_citation
    create_record(
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
            "api/literature", query_string={"q": "find a name" + " or a name" * 100}
        )
    assert response.status_code == 200


def test_public_api_generates_correct_links_in_literature_search(inspire_app):
    expected_search_links = {
        "self": "http://localhost:5000/api/literature/?q=&size=10&page=1",
        "bibtex": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=bibtex",
        "latex-eu": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=latex-eu",
        "latex-us": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=latex-us",
        "json": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=json",
        "cv": "http://localhost:5000/api/literature/?q=&size=10&page=1&format=cv",
    }
    record = create_record("lit")
    cn = record["control_number"]
    expected_details_links = {
        "bibtex": f"http://localhost:5000/api/literature/{cn}?format=bibtex",
        "latex-eu": f"http://localhost:5000/api/literature/{cn}?format=latex-eu",
        "latex-us": f"http://localhost:5000/api/literature/{cn}?format=latex-us",
        "json": f"http://localhost:5000/api/literature/{cn}?format=json",
        "citations": f"http://localhost:5000/api/literature/?q=refersto%3Arecid%3A{cn}",
        "cv": f"http://localhost:5000/api/literature/{cn}?format=cv",
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


def test_public_api_generates_correct_links_in_literature_search_with_fields(
    inspire_app,
):
    expected_search_links = {
        "self": "http://localhost:5000/api/literature/?q=&size=1&page=2&fields=ids,authors",
        "bibtex": "http://localhost:5000/api/literature/?q=&size=1&page=2&format=bibtex",
        "latex-eu": "http://localhost:5000/api/literature/?q=&size=1&page=2&format=latex-eu",
        "latex-us": "http://localhost:5000/api/literature/?q=&size=1&page=2&format=latex-us",
        "json": "http://localhost:5000/api/literature/?q=&size=1&page=2&fields=ids,authors&format=json",
        "prev": "http://localhost:5000/api/literature/?q=&size=1&page=1&fields=ids,authors",
        "next": "http://localhost:5000/api/literature/?q=&size=1&page=3&fields=ids,authors",
        "cv": "http://localhost:5000/api/literature/?q=&size=1&page=2&format=cv",
    }
    create_record("lit")
    create_record("lit")
    create_record("lit")
    with inspire_app.test_client() as client:
        url = "/api/literature?fields=ids,authors&size=1&page=2"
        response = client.get(url)
    assert response.status_code == 200
    response_links = response.json["links"]
    assert response_links == expected_search_links


def test_default_search_returns_only_literature_collection(inspire_app):
    create_record(
        "lit",
        data={
            "_collections": ["Fermilab"],
            "titles": [{"title": "A literature record from fermilab collection"}],
        },
    )
    create_record(
        "lit",
        data={
            "_collections": ["Literature"],
            "titles": [{"title": "A literature record"}],
        },
    )
    with inspire_app.test_client() as client:
        url = "/api/literature"
        response = client.get(url)

    assert response.status_code == 200
    assert len(response.json["hits"]["hits"]) == 1
    assert (
        response.json["hits"]["hits"][0]["metadata"]["titles"][0]["title"]
        == "A literature record"
    )


def test_collection_search_returns_records_from_non_private_collections(inspire_app):
    create_record(
        "lit",
        data={
            "_collections": ["Fermilab"],
            "titles": [{"title": "A literature record from fermilab collection"}],
        },
    )
    create_record(
        "lit",
        data={
            "_collections": ["HAL Hidden"],
            "titles": [{"title": "A hal record"}],
        },
    )

    create_record(
        "lit",
        data={
            "_collections": ["Literature"],
            "titles": [{"title": "A literature record"}],
        },
    )

    with inspire_app.test_client() as client:
        url = "/api/literature?q=_collections%3A%20fermilab%20or%20_collections%3A%20HAL%20hidden%20or%20_collections%3A%20Literature"
        response = client.get(url)

    assert response.status_code == 200
    assert len(response.json["hits"]["hits"]) == 3


def test_collection_search_doesnt_return_records_from_private_collections(inspire_app):
    create_record(
        "lit",
        data={
            "_collections": ["D0 Internal Notes"],
            "titles": [{"title": "A hidden record"}],
        },
    )

    with inspire_app.test_client() as client:
        url = "/api/literature?q=_collections%3A%20D0%20Internal%20Notes"
        response = client.get(url)

    assert response.status_code == 200
    assert len(response.json["hits"]["hits"]) == 0


def test_regression_journal_volume_search(inspire_app):
    record_1_data = {
        "publication_info": [
            {
                "cnum": "C17-07-05",
                "year": 2017,
                "artid": "390",
                "page_start": "390",
                "journal_title": "PoS",
                "parent_record": {
                    "$ref": "https://inspirehep.net/api/literature/1664112"
                },
                "journal_record": {
                    "$ref": "https://inspirehep.net/api/journals/1213080"
                },
                "journal_volume": "EPS-HEP2017",
                "conference_record": {
                    "$ref": "https://inspirehep.net/api/conferences/1499122"
                },
            }
        ],
    }
    record_2_data = {
        "publication_info": [
            {
                "cnum": "C19-07-10.1",
                "year": 2020,
                "artid": "390",
                "page_start": "390",
                "journal_title": "PoS",
                "parent_record": {
                    "$ref": "https://inspirehep.net/api/literature/1830715"
                },
                "journal_record": {
                    "$ref": "https://inspirehep.net/api/journals/1213080"
                },
                "journal_volume": "EPS-HEP2019",
                "conference_record": {
                    "$ref": "https://inspirehep.net/api/conferences/1716510"
                },
            }
        ],
    }
    create_record("lit", record_1_data)
    record_2 = create_record("lit", record_2_data)
    with inspire_app.test_client() as client:
        query_string = urllib.parse.quote("j PoS,EPS-HEP2019,390")
        url = f"/api/literature?q={query_string}"
        response = client.get(url)

    assert len(response.json["hits"]["hits"]) == 1
    assert (
        response.json["hits"]["hits"][0]["metadata"]["control_number"]
        == record_2["control_number"]
    )


def test_literature_journal_title_search_is_case_insensitive(inspire_app):
    record1 = create_record(
        "lit",
        data={
            "publication_info": [
                {
                    "year": 2017,
                    "artid": "020",
                    "page_start": "020",
                    "journal_title": "JHEP",
                    "journal_record": {
                        "$ref": "https://inspirebeta.net/api/journals/1213103"
                    },
                    "journal_volume": "10",
                }
            ],
        },
    )
    record2 = create_record(
        "lit",
        data={
            "publication_info": [
                {
                    "year": 2017,
                    "artid": "021",
                    "page_start": "021",
                    "journal_title": "JHEP",
                    "journal_volume": "10",
                }
            ],
        },
    )
    result_lowercase = LiteratureSearch().query_from_iq("j jhep").execute()
    result_uppercase = LiteratureSearch().query_from_iq("j JHEP").execute()

    assert result_lowercase
    assert result_uppercase

    hits_lowercase = result_lowercase["hits"]["hits"]
    hits_uppercase = result_uppercase["hits"]["hits"]
    result_lowercase_found_record_ids = [hit._id for hit in hits_lowercase]
    result_uppercase_found_record_ids = [hit._id for hit in hits_uppercase]

    assert len(result_lowercase_found_record_ids) == 2
    assert len(result_uppercase_found_record_ids) == 2

    assert str(record1.id) in result_lowercase_found_record_ids
    assert str(record2.id) in result_lowercase_found_record_ids

    assert str(record1.id) in result_uppercase_found_record_ids
    assert str(record2.id) in result_uppercase_found_record_ids


@mock.patch("inspirehep.search.factories.query.inspire_query_parser.parse_query")
def test_citedby_query(mocked_query_parser, inspire_app):
    cited_record = create_record("lit")
    citing_record = create_record(
        "lit",
        data={"references": [{"record": {"$ref": cited_record["self"]["$ref"]}}]},
    )
    mocked_query_parser.return_value = {
        "terms": {
            "self.$ref.raw": {
                "index": prefix_index("records-hep"),
                "id": str(citing_record.id),
                "path": "references.record.$ref.raw",
            }
        }
    }

    with inspire_app.test_client() as client:
        query_string = urllib.parse.quote(
            f"citedby:recid:{citing_record['control_number']}"
        )
        url = f"/api/literature?q={query_string}"
        response = client.get(url)

    assert len(response.json["hits"]["hits"]) == 1
    assert (
        response.json["hits"]["hits"][0]["metadata"]["control_number"]
        == cited_record["control_number"]
    )
