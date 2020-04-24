# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


from helpers.utils import create_record

from inspirehep.pidstore.api import PidStoreBase


def test_get_config_for_endpoints(appctx):
    pids_to_endpoints = PidStoreBase._get_config_pid_types_to_endpoints()

    assert pids_to_endpoints is not None


def test_get_config_for_schema(appctx):
    pids_to_endpoints = PidStoreBase._get_config_pid_types_to_schema()

    assert pids_to_endpoints is not None


def test_doi_resolve_ignores_case(api_client):
    expected_response_code = 200
    lowercase_doi = "10.1109/tpel.2019.2900393"
    uppercase_doi = "10.1109/TPEL.2019.2900393"
    data = {"dois": [{"value": uppercase_doi}]}
    record = create_record("lit", data)
    expected_control_number = record["control_number"]
    response = api_client.get(f"api/doi/{uppercase_doi}")
    assert expected_response_code == response.status_code
    assert expected_control_number == response.json["metadata"]["control_number"]

    response = api_client.get(f"api/doi/{lowercase_doi}")
    assert expected_response_code == response.status_code
    assert expected_control_number == response.json["metadata"]["control_number"]


def test_arxiv_path_converter_works_for_all_arxiv_pid_values(api_client):
    data = {
        "arxiv_eprints": [
            {"value": "1607.06746", "categories": ["hep-th"]},
            {"categories": ["hep-ph"], "value": "hep-ph/9709356"},
        ]
    }
    record = create_record("lit", data)
    expected_control_number = record["control_number"]
    expected_status_code = 200
    short_arxiv_number_respons = api_client.get("api/arxiv/1607.06746")
    long_arxiv_number_response = api_client.get("api/arxiv/hep-ph/9709356")

    assert expected_status_code == short_arxiv_number_respons.status_code
    assert (
        expected_control_number
        == short_arxiv_number_respons.json["metadata"]["control_number"]
    )

    assert expected_status_code == long_arxiv_number_response.status_code
    assert (
        expected_control_number
        == long_arxiv_number_response.json["metadata"]["control_number"]
    )
