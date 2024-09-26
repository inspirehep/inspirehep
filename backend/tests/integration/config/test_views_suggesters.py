#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.utils import create_record
from inspire_utils.record import get_value


def _get_suggester_source(response, suggester):
    return response.json[suggester][0]["options"][0]["_source"]


def _get_suggester_text(response, suggester):
    return response.json[suggester][0]["options"][0]["text"]


def test_literature_suggesters_book_title(inspire_app):
    expected_title_suggestion = "Suggested title"
    data = {
        "authors": [{"full_name": "Weinberg, Steven"}],
        "titles": [{"title": expected_title_suggestion}],
    }
    lit = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        resp = client.get("/literature/_suggest?book_title=su")

    result = _get_suggester_source(resp, "book_title")
    assert result["control_number"] == lit["control_number"]
    assert result["authors"][0]["full_name"] == lit["authors"][0]["full_name"]
    assert result["titles"] == lit["titles"]

    result_suggest = _get_suggester_text(resp, "book_title")
    assert result_suggest == expected_title_suggestion


def test_literature_suggesters_abstract_source(inspire_app):
    expected_source_suggest = "WSP"
    data = {
        "abstracts": [{"value": "Fancy abstract", "source": expected_source_suggest}]
    }
    lit = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        resp = client.get("/literature/_suggest?abstract_source=ws")

    result = _get_suggester_source(resp, "abstract_source")
    assert result["control_number"] == lit["control_number"]
    assert result["titles"] == lit["titles"]

    result_suggest = _get_suggester_text(resp, "abstract_source")
    assert result_suggest == expected_source_suggest


def test_literature_suggesters_empty_result(inspire_app):
    create_record("lit", data={"titles": [{"title": "Suggested title"}]})
    with inspire_app.test_client() as client:
        resp = client.get("/literature/_suggest?book_title=nope")

    result = resp.json["book_title"][0]["options"]
    expected = []

    assert result == expected


def test_author_suggesters(inspire_app):
    data = {
        "name": {
            "name_variants": ["Maldacena, Juan Martin"],
            "preferred_name": "Juan Martin Maldacena",
            "value": "Maldacena, Juan Martin",
        },
        "positions": [
            {
                "current": True,
                "institution": "Princeton, Inst. Advanced Study",
                "start_date": "2001",
            }
        ],
    }
    auth = create_record("aut", data=data)
    with inspire_app.test_client() as client:
        resp = client.get("/authors/_suggest?author=mal")

    result_rec_id = _get_suggester_source(resp, "author")["control_number"]
    expected_rec_id = auth["control_number"]

    assert result_rec_id == expected_rec_id


@pytest.mark.xfail()
def test_jobs_suggester():
    raise NotImplementedError("Missing serializer")


@pytest.mark.xfail()
def test_journals_suggesters():
    raise NotImplementedError("Missing serializer")


@pytest.mark.xfail()
def test_experiments_suggesters():
    raise NotImplementedError("Missing serializer")


def test_conferences_suggesters_using_series_name(inspire_app):
    expected_series = "ICFA_cool series"
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "cnum": "C06-06-25.2",
        "external_system_identifiers": [{"schema": "SPIRES", "value": "CONF-516198"}],
        "opening_date": "2006-06-25",
        "series": [{"name": expected_series, "number": 11}],
        "titles": [
            {"title": "SciDAC 2006: Scientific Discovery through Advanced Computing"}
        ],
    }
    create_record("con", data=data)
    with inspire_app.test_client() as client:
        resp = client.get("/conferences/_suggest?series_name=ICFA")
        resp2 = client.get("/conferences/_suggest?series_name=UNKNOWN")

    assert resp.status_code == 200
    assert _get_suggester_text(resp, "series_name") == expected_series

    assert resp2.status_code == 200
    assert resp2.json["series_name"][0]["options"] == []


def test_conferences_suggesters_using_series_name_ignores_duplicates(inspire_app):
    expected_series_count = 2
    data = {
        "$schema": "https://labs.inspirehep.net/schemas/records/conferences.json",
        "_collections": ["Conferences"],
        "cnum": "C06-06-25.2",
        "external_system_identifiers": [{"schema": "SPIRES", "value": "CONF-516198"}],
        "opening_date": "2006-06-25",
        "series": [{"name": "ICFA_cool series", "number": 11}],
        "titles": [
            {"title": "SciDAC 2006: Scientific Discovery through Advanced Computing"}
        ],
    }
    create_record("con", data=data)

    data["cnum"] = "C06-06-25.3"
    create_record("con", data=data)

    data["cnum"] = "C06-06-25.4"
    data["series"] = [{"name": "ICFA_other series", "number": 12}]
    create_record("con", data=data)
    with inspire_app.test_client() as client:
        resp = client.get("/conferences/_suggest?series_name=ICFA")

    assert resp.status_code == 200
    assert len(resp.json["series_name"][0]["options"]) == expected_series_count


def test_seminars_series_name_suggester(inspire_app):
    data_cool = {"series": [{"name": "Cool Series", "number": 1}]}
    data_coolest = {"series": [{"name": "Coolest Series", "number": 2}]}
    data_other = {"series": [{"name": "Other Series", "number": 2}]}
    create_record("sem", data=data_cool)
    create_record("sem", data=data_coolest)
    create_record("sem", data=data_other)
    with inspire_app.test_client() as client:
        response = client.get("/seminars/_suggest?series_name=Cool")

    assert response.status_code == 200
    assert get_value(response.json, "series_name[0].options.text") == [
        "Cool Series",
        "Coolest Series",
    ]
    with inspire_app.test_client() as client:
        response = client.get("/seminars/_suggest?series_name=Whatevs")

    assert response.status_code == 200
    assert response.json["series_name"][0]["options"] == []


def test_seminars_series_name_suggester_ignores_duplicates(inspire_app):
    data = {"series": [{"name": "Cool Series", "number": 11}]}
    create_record("sem", data=data)
    create_record("sem", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/seminars/_suggest?series_name=Cool")
    assert response.status_code == 200

    suggestion_count = len(response.json["series_name"][0]["options"])
    assert suggestion_count == 1


@pytest.mark.xfail()
def test_data_suggesters():
    raise NotImplementedError("Missing serializer")


@pytest.mark.xfail()
def test_institutions_suggesters():
    raise NotImplementedError("Missing serializer")
