# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest


def test_literature_application_json_get(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = client.get("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = client.put("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_delete(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = client.delete("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post(client, db):
    expected_status_code = 401
    response = client.post("/literature/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_citations(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    data = {"references": [{"recid": record_control_number}]}

    record_citing = create_record("lit", data=data, with_indexing=True)
    record_citing_control_number = record_citing.json["control_number"]
    record_citing_titles = record_citing.json["titles"]

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

    response = client.get("/literature/{}/citations".format(record_control_number))
    response_status_code = response.status_code
    response_data = response.json

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_empty(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    response = client.get("/literature/{}/citations".format(record_control_number))
    response_status_code = response.status_code
    response_data = response.json

    expected_status_code = 200
    expected_data = {"metadata": {"citation_count": 0, "citations": []}}

    assert expected_status_code == response_status_code
    assert expected_data == response_data


def test_literature_citations_missing_pids(client, db, create_record):
    missing_control_number = 1
    response = client.get("/literature/{}/citations".format(missing_control_number))
    response_status_code = response.status_code
    response_data = response.json

    expected_status_code = 404

    assert expected_status_code == response_status_code
