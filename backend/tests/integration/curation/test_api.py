# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import orjson
import pytest
from helpers.utils import create_record

from inspirehep.curation.api import normalize_collaborations


@pytest.fixture(scope="function")
def insert_experiments_into_db(inspire_app, datadir):
    experiments_path = os.path.join(datadir, "experiments")
    for record_filename in os.listdir(experiments_path):
        data = orjson.loads((datadir / "experiments" / record_filename).read_text())
        create_record("exp", data=data)


@pytest.fixture(scope="function")
def insert_ambiguous_experiments_into_db(inspire_app, datadir):
    ambiguous_experiments_path = os.path.join(datadir, "ambiguous_experiments")
    for record_filename in os.listdir(ambiguous_experiments_path):
        data = orjson.loads(
            (datadir / "ambiguous_experiments" / record_filename).read_text()
        )
        create_record("exp", data=data)


def test_normalize_collaborations(inspire_app, insert_experiments_into_db):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "collaborations": [
            {
                "value": "Atlas II",
                "record": {"$ref": "https://inspirebeta.net/api/experiments/9999"},
            },
            {"value": "Particle Data Group"},
            {"value": "Unknown"},
        ],
    }

    expected_collaborations = [
        {
            "value": "Atlas II",
            "record": {"$ref": "https://inspirebeta.net/api/experiments/9999"},
        },
        {
            "value": "Particle Data Group",
            "record": {"$ref": "http://localhost:5000/api/experiments/1800050"},
        },
        {"value": "Unknown"},
    ]

    expected_accelerator_experiments = [
        {"record": {"$ref": "http://localhost:5000/api/experiments/1800050"}}
    ]

    collaborations = record["collaborations"]
    result = normalize_collaborations(collaborations, wf_id=1)
    assert result["normalized_collaborations"] == expected_collaborations
    assert result["accelerator_experiments"] == expected_accelerator_experiments


def test_normalize_collaborations_with_different_name_variants(
    inspire_app, insert_experiments_into_db
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "collaborations": [
            {"value": "ATLAS Muon"},
            {"value": "ATLAS Liquid   Argon"},
            {"value": "Particle Data Group"},
        ],
    }

    expected_collaborations = [
        {
            "record": {"$ref": "http://localhost:5000/api/experiments/1108541"},
            "value": "ATLAS Muon",
        },
        {
            "record": {"$ref": "http://localhost:5000/api/experiments/1108541"},
            "value": "ATLAS Liquid Argon",
        },
        {
            "record": {"$ref": "http://localhost:5000/api/experiments/1800050"},
            "value": "Particle Data Group",
        },
    ]

    expected_accelerator_experiments = [
        {
            "record": {"$ref": "http://localhost:5000/api/experiments/1108541"},
            "legacy_name": "CERN-LHC-ATLAS",
        },
        {"record": {"$ref": "http://localhost:5000/api/experiments/1800050"}},
    ]
    collaborations = record["collaborations"]
    result = normalize_collaborations(collaborations, 1)
    assert result["normalized_collaborations"] == expected_collaborations
    assert result["accelerator_experiments"] == expected_accelerator_experiments


def test_normalize_collaborations_doesnt_link_experiment_when_ambiguous_collaboration_names(
    inspire_app, insert_ambiguous_experiments_into_db, caplog
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "collaborations": [{"value": "SHIP"}],
    }

    expected_collaborations = [{"value": "SHIP"}]

    collaborations = record["collaborations"]
    result = normalize_collaborations(collaborations, 1)

    assert result["normalized_collaborations"] == expected_collaborations
    assert not result.get("accelerator_experiments")
    assert "'workflow_id': 1" in caplog.text
    assert "'collaboration': 'SHIP'" in caplog.text
    assert "'matched_collaboration_names':" in caplog.text
    assert "'Ambiguous match for collaboration'" in caplog.text


def test_normalize_collaborations_doesnt_link_experiment_when_ambiguous_subgroup(
    inspire_app, insert_ambiguous_experiments_into_db, caplog
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "collaborations": [{"value": "Belle SVD"}],
    }

    expected_collaborations = [{"value": "Belle SVD"}]
    collaborations = record["collaborations"]
    result = normalize_collaborations(collaborations, 1)

    assert result["normalized_collaborations"] == expected_collaborations
    assert not result.get("accelerator_experiments")
    assert "'workflow_id': 1" in caplog.text
    assert "'collaboration': 'Belle SVD'" in caplog.text
    assert "'matched_collaboration_names': " in caplog.text
    assert "Ambiguous match for collaboration" in caplog.text
