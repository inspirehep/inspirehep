# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.providers.faker import faker

from inspirehep.oai.utils import (
    ACCELERATOR_EXPERIMENTS_NAMES,
    COLLABORATIONS,
    COLLECTIONS,
    has_cern_accelerator_experiment,
    has_cern_affiliation,
    has_cern_collaboration,
    has_cern_doi,
    has_cern_report_number,
    is_arxiv_eprint,
    is_cds_set,
    is_cern_arxiv_set,
    is_in_cern_arxiv_collection,
)


def test_is_cds_set():
    data = {"_export_to": {"CDS": True}}
    record = faker.record("lit", data)

    assert True is is_cds_set(record)


def test_is_cds_set_with_false():
    data = {"_export_to": {"CDS": False}}
    record = faker.record("lit", data)

    assert False is is_cds_set(record)


@pytest.mark.parametrize(
    "experiment_name,expected",
    [(accelarator_name, True) for accelarator_name in ACCELERATOR_EXPERIMENTS_NAMES]
    + [("jessicajones", False)],
)
def test_has_cern_accelerator_experiment(experiment_name, expected):
    data = {"accelerator_experiments": [{"legacy_name": experiment_name}]}
    record = faker.record("lit", data)
    assert expected == has_cern_accelerator_experiment(record)


def test_has_cern_accelerator_experiment_without_field():
    record = faker.record("lit")
    assert False is has_cern_accelerator_experiment(record)


@pytest.mark.parametrize(
    "affiliation,expected",
    [("cern", True), ("CERN", True), ("CERNOIS", True), ("JESSICAJONES", False)],
)
def test_has_cern_affiliation(affiliation, expected):
    data = {
        "authors": [
            {"full_name": affiliation, "affiliations": [{"value": affiliation}]}
        ]
    }
    record = faker.record("lit", data)
    assert expected == has_cern_affiliation(record)


def test_has_cern_affiliation_with_multiple_authors():
    data = {
        "authors": [
            {
                "full_name": "J. Jones",
                "affiliations": [{"value": "CERN"}, {"value": "SLAC"}],
            },
            {"full_name": "F. Castle", "affiliations": [{"value": "Whatever"}]},
        ]
    }
    record = faker.record("lit", data)
    assert True == has_cern_affiliation(record)


def test_has_cern_affiliation_without_field():
    record = faker.record("lit")
    assert False is has_cern_affiliation(record)


@pytest.mark.parametrize(
    "collaboration,expected",
    [
        ("NA6", False),
        ("na6", False),
        ("NA666", False),
        ("na666", False),
        ("NASA", False),
        ("nasa", False),
        ("JESSICAJONES", False),
        ("jessicajones", False),
    ]
    + [(collaboration, True) for collaboration in COLLABORATIONS],
)
def test_has_cern_collaboration(collaboration, expected):
    data = {"collaborations": [{"value": collaboration}]}
    record = faker.record("lit", data)
    assert expected == has_cern_collaboration(record)


def test_has_cern_collaboration_without_field():
    record = faker.record("lit")
    assert False is has_cern_collaboration(record)


@pytest.mark.parametrize(
    "report_number,expected",
    [
        ("CERN-TH-2020-136", True),
        ("CERN-th-2020-136", True),
        ("CERNO-", False),
        ("JESSICAJONES", False),
        ("jessicajones", False),
    ],
)
def test_has_cern_report_number(report_number, expected):
    data = {"report_numbers": [{"value": report_number}]}
    record = faker.record("lit", data)
    assert expected == has_cern_report_number(record)


def test_has_cern_report_number_without_field():
    record = faker.record("lit")
    assert False is has_cern_report_number(record)


@pytest.mark.parametrize(
    "doi,expected",
    [
        ("10.23730/CYRSP-2019-006.261", True),
        ("10.5170/CERN-2016-005", True),
        ("10.1016/j.nima.2005.09.022", False),
    ],
)
def test_has_cern_doi(doi, expected):
    data = {"dois": [{"value": doi}]}
    record = faker.record("lit", data)
    assert expected == has_cern_doi(record)


def test_has_cern_doi_without_field():
    record = faker.record("lit")
    assert False is has_cern_doi(record)


@pytest.mark.parametrize(
    "collection,expected", [(collection, True) for collection in COLLECTIONS]
)
def test_is_in_cern_arxiv_collection(collection, expected):
    data = {"_collections": [collection]}
    record = faker.record("lit", data)
    assert expected == is_in_cern_arxiv_collection(record)


@pytest.mark.parametrize("arxiv,expected", [("2009.01484", True)])
def test_is_cern_arxiv_eprint(arxiv, expected):
    data = {"arxiv_eprints": [{"value": arxiv}]}
    record = faker.record("lit", data)
    assert expected == is_arxiv_eprint(record)


def test_is_cern_arxiv_eprint_without_field():
    record = faker.record("lit")
    assert False is is_arxiv_eprint(record)


def test_is_arxiv_set_with_affiliations_field():
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "authors": [{"full_name": "cern", "affiliations": [{"value": "CERN"}]}],
    }
    record = faker.record("lit", data)
    assert True is is_cern_arxiv_set(record)


def test_is_arxiv_set_with_affiliations_field_without_arxiv_eprint():
    data = {"authors": [{"full_name": "cern", "affiliations": [{"value": "CERN"}]}]}
    record = faker.record("lit", data)
    assert False is is_cern_arxiv_set(record)


def test_is_arxiv_set_with_affiliations_field_with_wrong_collection():
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "_collections": ["SLAC"],
        "authors": [{"full_name": "cern", "affiliations": [{"value": "CERN"}]}],
    }
    record = faker.record("lit", data)
    assert False is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "experiment_name,expected",
    [(accelarator_name, True) for accelarator_name in ACCELERATOR_EXPERIMENTS_NAMES],
)
def test_is_arxiv_set_with_accelerators_experiments_field(experiment_name, expected):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "accelerator_experiments": [{"legacy_name": experiment_name}],
    }

    record = faker.record("lit", data)
    assert expected is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "experiment_name,expected",
    [(accelarator_name, False) for accelarator_name in ACCELERATOR_EXPERIMENTS_NAMES],
)
def test_is_arxiv_set_with_accelerators_experiments_field_without_arxiv_eprint(
    experiment_name, expected
):
    data = {"accelerator_experiments": [{"legacy_name": experiment_name}]}

    record = faker.record("lit", data)
    assert expected is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "experiment_name,expected",
    [(accelarator_name, False) for accelarator_name in ACCELERATOR_EXPERIMENTS_NAMES],
)
def test_is_arxiv_set_with_accelerators_experiments_field_with_wrong_collection(
    experiment_name, expected
):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "_collections": ["SLAC"],
        "accelerator_experiments": [{"legacy_name": experiment_name}],
    }

    record = faker.record("lit", data)
    assert expected is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "collaboration,expected",
    [(collaboration, True) for collaboration in COLLABORATIONS],
)
def test_is_arxiv_set_with_collaborations(collaboration, expected):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "collaborations": [{"value": collaboration}],
    }

    record = faker.record("lit", data)
    assert expected is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "collaboration,expected",
    [(collaboration, False) for collaboration in COLLABORATIONS],
)
def test_is_arxiv_set_with_collaborations_without_arxiv_eprints(
    collaboration, expected
):
    data = {"collaborations": [{"value": collaboration}]}

    record = faker.record("lit", data)
    assert expected is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "collaboration,expected",
    [(collaboration, False) for collaboration in COLLABORATIONS],
)
def test_is_arxiv_set_with_collaborations_with_wrong_collection(
    collaboration, expected
):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "_collections": ["SLAC"],
        "collaborations": [{"value": collaboration}],
    }

    record = faker.record("lit", data)
    assert expected is is_cern_arxiv_set(record)


def test_is_arxiv_set_with_doi():
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "dois": [{"value": "10.23730/CYRSP-2019-006.261"}],
    }

    record = faker.record("lit", data)
    assert True is is_cern_arxiv_set(record)


def test_is_arxiv_set_with_report_numbers():
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "report_numbers": [{"value": "CERN-TH-2020-136"}],
    }

    record = faker.record("lit", data)
    assert True is is_cern_arxiv_set(record)


@pytest.mark.parametrize(
    "collection,expected", [(collection, True) for collection in COLLECTIONS]
)
def test_is_arxiv_set_with_collection(collection, expected):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "report_numbers": [{"value": "CERN-TH-2020-136"}],
        "_collections": [collection],
    }

    record = faker.record("lit", data)
    assert True is is_cern_arxiv_set(record)


def test_is_arxiv_set_with_wrong_collection():
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "_collections": ["SLAC"],
        "report_numbers": [{"value": "CERN-TH-2020-136"}],
    }

    record = faker.record("lit", data)
    assert False is is_cern_arxiv_set(record)


def test_is_arxiv_set_with_collection_and_without_arxiv_eprints():
    data = {"report_numbers": [{"value": "CERN-TH-2020-136"}]}
    record = faker.record("lit", data)
    assert False is is_cern_arxiv_set(record)
