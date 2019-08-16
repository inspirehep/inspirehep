# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import os

import requests_mock
import vcr
from helpers.providers.faker import faker

my_vcr = vcr.VCR(
    serializer="yaml",
    cassette_library_dir=os.path.join(os.path.dirname(__file__), "cassettes"),
    record_mode="once",
)


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
