# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import os

import pytest
import requests_mock
from helpers.providers.faker import faker
from helpers.utils import create_record


def test_import_article_view_400_bad_arxiv(app_clean):
    with app_clean.app.test_client() as client:
        resp = client.get("/literature/import/bad_arxiv:0000.0000")

    expected_msg = "bad_arxiv:0000.0000 is not a recognized identifier."
    resp_msg = json.loads(resp.data)["message"]

    assert expected_msg == resp_msg
    assert resp.status_code == 400


@pytest.mark.vcr()
def test_import_article_view_404_non_existing_doi(app_clean):
    with app_clean.app.test_client() as client:
        resp = client.get("/literature/import/10.1016/j.physletb.2099.08.020")

    expected_msg = "No article found for 10.1016/j.physletb.2099.08.020"
    result_msg = json.loads(resp.data)["message"]

    assert expected_msg == result_msg
    assert resp.status_code == 404


def test_import_article_view_409_because_article_already_exists(app_clean):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    record = create_record("lit", data=data)

    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/arXiv:{arxiv_value}")

    expected_msg = f"The article arXiv:{arxiv_value} already exists in Inspire"
    expected_recid = str(record["control_number"])
    result_msg = json.loads(resp.data)["message"]
    result_recid = json.loads(resp.data)["recid"]

    assert expected_msg == result_msg
    assert expected_recid == result_recid
    assert resp.status_code == 409


def test_import_article_view_409_because_doi_already_exists(app_clean):
    doi_value = "10.1109/TaSc.2017.2721959"
    data = {"dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    create_record("lit", data=data)
    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/doi:{doi_value}")
        assert resp.status_code == 409

        resp = client.get(f"/literature/import/doi:{doi_value.upper()}")
        assert resp.status_code == 409

        resp = client.get(f"/literature/import/doi:{doi_value.lower()}")
        assert resp.status_code == 409


@pytest.mark.vcr()
def test_import_article_view_404_arxiv_not_found(app_clean):
    with app_clean.app.test_client() as client:
        resp = client.get("/literature/import/arXiv:0000.0000")
    assert resp.status_code == 404


def test_import_article_view_400_doi_not_valid(app_clean):
    with app_clean.app.test_client() as client:
        resp = client.get("/literature/import/doi:notADoi")
    assert resp.status_code == 400


def test_import_article_arxiv_409_id_already_in_inspire(app_clean):
    arxiv_id = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_id}]}
    data = faker.record("lit", with_control_number=True, data=data)
    create_record("lit", data=data)

    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/arXiv:{arxiv_id}")
    assert resp.status_code == 409


def test_import_article_view_404_website_not_reachable(app_clean):
    arxiv_id = faker.arxiv()
    with requests_mock.Mocker() as mocker, app_clean.app.test_client() as client:
        mocker.get(
            f"http://export.arxiv.org/oai2?verb=GetRecord&identifier=oai:arXiv.org:{arxiv_id}&metadataPrefix=arXiv",
            status_code=500,
        )
        resp = client.get(f"/literature/import/arXiv:{arxiv_id}")
        assert resp.status_code == 502


@pytest.mark.vcr()
def test_import_article_view_500_arxiv_broken_record(app_clean):
    arxiv_id = "0804.1111"
    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/arXiv:{arxiv_id}")
    assert resp.status_code == 500


@pytest.mark.vcr()
def test_import_article_uses_only_arxiv_if_there_is_no_doi_during_arxiv_import(
    app_clean
):
    arxiv_id = "1908.05196"
    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/{arxiv_id}")
    result = resp.json["data"]

    expected_title = (
        "Polarization fraction measurement in ZZ scattering using deep learning"
    )

    assert resp.status_code == 200
    assert result["title"] == expected_title
    assert result["arxiv_id"] == arxiv_id
    assert result["arxiv_categories"] == ["hep-ph", "hep-ex"]


@pytest.mark.vcr()
def test_import_article_merges_crossref_after_arxiv_import(app_clean):
    arxiv_id = "1607.06746"
    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/{arxiv_id}")
    result = resp.json["data"]

    assert result["journal_title"] == "Reports on Progress in Physics"
    assert resp.status_code == 200


@pytest.mark.vcr()
def test_import_article_view_200_crossref(app_clean):
    doi = "10.1016/j.physletb.2012.08.020"

    with app_clean.app.test_client() as client:
        resp = client.get(f"/literature/import/{doi}")
    result = resp.json["data"]

    expected_title = "Observation of a new particle in the search for the Standard Model Higgs boson with the ATLAS detector at the LHC"
    assert resp.status_code == 200
    assert result["title"] == expected_title
    assert result["doi"] == doi
