# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import mock
import orjson
import pytest
from helpers.utils import create_record

from inspirehep.curation.api import normalize_affiliations, normalize_collaborations


def create_records_from_datadir(datadir, record_type, path_in_datadir):
    experiments_path = os.path.join(datadir, path_in_datadir)
    for record_filename in os.listdir(experiments_path):
        data = orjson.loads((datadir / path_in_datadir / record_filename).read_text())
        create_record(record_type, data=data)


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


@pytest.fixture(scope="function")
def insert_literature_in_db(inspire_app, datadir):
    create_records_from_datadir(datadir, "lit", "literature")


@pytest.fixture(scope="function")
def insert_institutions_in_db(inspire_app, datadir):
    create_records_from_datadir(datadir, "ins", "institutions")


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


def test_normalize_affiliations_happy_flow(
    inspire_app, insert_literature_in_db, insert_institutions_in_db, caplog
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Kowal, Michal",
                "raw_affiliations": [
                    {
                        "value": "Faculty of Physics, University of Warsaw, Pasteura 5 Warsaw"
                    }
                ],
            },
            {
                "full_name": "Latacz, Barbara",
                "raw_affiliations": [{"value": "CERN, Genève, Switzerland"}],
            },
        ],
    }

    data = normalize_affiliations(record["authors"], workflow_id=1)

    assert data["normalized_affiliations"][0][0] == {
        "record": {"$ref": "http://localhost:5000/api/institutions/903335"},
        "value": "Warsaw U.",
    }

    assert data["normalized_affiliations"][1][0] == {
        "record": {"$ref": "http:/localhost:5000/api/institutions/902725"},
        "value": "CERN",
    }

    assert "Found matching affiliation" in caplog.text


def test_normalize_affiliations_when_authors_has_two_happy_flow(
    inspire_app, insert_literature_in_db
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Kowal, Michal",
                "raw_affiliations": [
                    {
                        "value": "Faculty of Physics, University of Warsaw, Pasteura 5 Warsaw"
                    },
                    {"value": "CERN, Genève, Switzerland"},
                ],
            }
        ],
    }

    data = normalize_affiliations(record["authors"])

    assert {
        "record": {"$ref": "http://localhost:5000/api/institutions/903335"},
        "value": "Warsaw U.",
    } in data["normalized_affiliations"][0]

    assert {
        "record": {"$ref": "http:/localhost:5000/api/institutions/902725"},
        "value": "CERN",
    } in data["normalized_affiliations"][0]


def test_normalize_affiliations_when_lit_affiliation_missing_institution_ref(
    inspire_app, insert_literature_in_db, insert_institutions_in_db
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Kozioł, Karol",
                "raw_affiliations": [
                    {"value": "NCBJ Świerk"},
                    {"value": "CERN, Genève, Switzerland"},
                ],
            }
        ],
    }

    data = normalize_affiliations(record["authors"])

    assert {"value": "NCBJ, Swierk"} in data["normalized_affiliations"][0]
    assert {
        "record": {"$ref": "http:/localhost:5000/api/institutions/902725"},
        "value": "CERN",
    } in data["normalized_affiliations"][0]


@mock.patch(
    "inspirehep.curation.utils.find_unambiguous_affiliation",
    return_value={"value": "CERN"},
)
def test_normalize_affiliations_run_query_only_once_when_authors_have_same_raw_aff(
    mock_assign_matched_affiliation_to_author, inspire_app, insert_literature_in_db
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Kowal, Michal",
                "raw_affiliations": [
                    {"value": "CERN, Rue de Genève, Meyrin, Switzerland"}
                ],
            },
            {
                "full_name": "Latacz, Barbara",
                "raw_affiliations": [
                    {"value": "CERN, Rue de Genève, Meyrin, Switzerland"}
                ],
            },
        ],
    }

    normalize_affiliations(record["authors"])

    assert mock_assign_matched_affiliation_to_author.called_once()


def test_normalize_affiliations_handle_not_found_affiliations(
    inspire_app, insert_literature_in_db
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Kowal, Michal",
                "raw_affiliations": [{"value": "Non existing aff"}],
            },
        ],
    }

    data = normalize_affiliations(record["authors"])

    assert not data["normalized_affiliations"][0]
    assert "Non existing aff" in data["ambiguous_affiliations"]


def test_normalize_affiliations_doesnt_return_nested_affiliations_if_using_memoized(
    inspire_app,
    insert_literature_in_db,
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "emails": ["weili@mail.itp.ac.cn"],
                "full_name": "Li, Wei",
                "raw_affiliations": [
                    {
                        "value": "Institute of Theoretical Physics, Chinese Academy of Sciences, 100190 Beijing, P.R. China"
                    }
                ],
            },
            {
                "emails": ["masahito.yamazaki@ipmu.jp"],
                "full_name": "Yamazaki, Masahito",
                "raw_affiliations": [
                    {
                        "value": "Institute of Theoretical Physics, Chinese Academy of Sciences, 100190 Beijing, P.R. China"
                    }
                ],
            },
        ],
    }

    data = normalize_affiliations(record["authors"])

    assert data["normalized_affiliations"][0] == [
        {
            "record": {"$ref": "https://inspirebeta.net/api/institutions/903895"},
            "value": "Beijing, Inst. Theor. Phys.",
        }
    ]


def test_normalize_affiliations_doesnt_add_duplicated_affiliations(
    inspire_app,
    insert_literature_in_db,
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Kowal, Michal",
                "raw_affiliations": [
                    {"value": "Warsaw U., Faculty of Physics"},
                    {
                        "value": "Warsaw U., Faculty of Mathematics, Informatics, and Mechanics"
                    },
                ],
            }
        ],
    }
    data = normalize_affiliations(record["authors"])

    assert data["normalized_affiliations"][0][0] == {
        "record": {"$ref": "http://localhost:5000/api/institutions/903335"},
        "value": "Warsaw U.",
    }


def test_aff_normalization_if_no_match_from_highlighting_and_no_other_matches(
    inspire_app, insert_literature_in_db
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Easter, Paul J.",
                "ids": [{"schema": "INSPIRE BAI", "value": "P.J.Easter.2"}],
                "raw_affiliations": [
                    {"value": "Belgrade, Serbia"},
                ],
                "signature_block": "EASTARp",
                "uuid": "4c4b7fdf-04ae-421f-bcab-bcc5907cea4e",
            }
        ],
    }
    data = normalize_affiliations(record["authors"])

    assert not data["normalized_affiliations"][0]


def test_normalize_affiliations_assign_only_matching_affiliation_when_multiple_raw_affs_in_matched_author(
    inspire_app,
    insert_literature_in_db,
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Easter, Paul J.",
                "ids": [{"schema": "INSPIRE BAI", "value": "P.J.Easter.2"}],
                "raw_affiliations": [
                    {"value": "Institute of Physics Belgrade, Belgrade, Serbia"},
                ],
                "signature_block": "EASTARp",
                "uuid": "4c4b7fdf-04ae-421f-bcab-bcc5907cea4e",
            }
        ],
    }
    data = normalize_affiliations(record["authors"])

    assert data["normalized_affiliations"][0] == [
        {
            "value": "Belgrade, Inst. Phys.",
            "record": {"$ref": "http:/localhost:5000/api/institutions/903416"},
        }
    ]


def test_normalize_affiliations_doesnt_add_not_valid_stuff_to_affiliation(
    inspire_app,
    insert_literature_in_db,
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Easter, Paul J.",
                "ids": [{"schema": "INSPIRE BAI", "value": "P.J.Easter.2"}],
                "raw_affiliations": [
                    {
                        "value": "OzGrav: The ARC Centre of Excellence for Gravitational Wave Discovery, Clayton VIC 3800, Australia"
                    },
                ],
                "signature_block": "EASTARp",
                "uuid": "4c4b7fdf-04ae-421f-bcab-bcc5907cea4e",
            }
        ],
    }
    data = normalize_affiliations(record["authors"])

    assert data["normalized_affiliations"][0] == [
        {
            "record": {"$ref": "https://inspirebeta.net/api/institutions/908529"},
            "value": "LIGO Lab., Caltech",
        },
        {
            "record": {"$ref": "https://inspirebeta.net/api/institutions/903019"},
            "value": "Monash U.",
        },
    ]


def test_normalize_affiliations_assign_all_affiliations_if_one_raw_aff_in_matched_lit_author(
    inspire_app,
    insert_literature_in_db,
):
    record = {
        "_collections": ["Literature"],
        "titles": ["A title"],
        "document_type": ["report"],
        "authors": [
            {
                "full_name": "Easter, Paul J.",
                "ids": [{"schema": "INSPIRE BAI", "value": "P.J.Easter.2"}],
                "raw_affiliations": [
                    {
                        "value": "School of Physics and Astronomy, Monash University, Vic 3800, Australia"
                    },
                    {
                        "value": "OzGrav: The ARC Centre of Excellence for Gravitational Wave Discovery, Clayton VIC 3800, Australia"
                    },
                ],
                "signature_block": "EASTARp",
                "uuid": "4c4b7fdf-04ae-421f-bcab-bcc5907cea4e",
            }
        ],
    }
    data = normalize_affiliations(record["authors"])

    assert data["normalized_affiliations"][0] == [
        {
            "record": {"$ref": "https://inspirebeta.net/api/institutions/908529"},
            "value": "LIGO Lab., Caltech",
        },
        {
            "record": {"$ref": "https://inspirebeta.net/api/institutions/903019"},
            "value": "Monash U.",
        },
    ]
