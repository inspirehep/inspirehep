# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import mock
import pytest

from inspirehep.records.marshmallow.literature.common import (
    AcceleratorExperimentSchemaV1,
)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_legacy_name_as_name(mock_get_linked_records_in_field):
    schema = AcceleratorExperimentSchemaV1()
    dump = {"legacy_name": "Test"}
    expected = {"name": "Test"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_dashed_institution_accelerator_experiment_as_name_if_all_present(
    mock_get_linked_records_in_field
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "INS"}],
        "accelerator": {"value": "ACC"},
        "experiment": {"value": "EXP1"},
    }
    expected = {"name": "INS-ACC-EXP1"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_legacy_name_as_name_if_accelerator_missing(
    mock_get_linked_records_in_field
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "INS"}],
        "experiment": {"value": "EXP1"},
    }
    expected = {"name": "LEGACY-EXP1"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_legacy_name_as_name_if_institutions_missing(
    mock_get_linked_records_in_field
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "accelerator": {"value": "ACC"},
        "experiment": {"value": "EXP1"},
    }
    expected = {"name": "LEGACY-EXP1"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_legacy_name_as_name_if_experiment_missing(
    mock_get_linked_records_in_field
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "INS"}],
        "accelerator": {"value": "ACC"},
    }
    expected = {"name": "LEGACY-EXP1"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_none_as_name_if_empty_present(mock_get_linked_records_in_field):
    schema = AcceleratorExperimentSchemaV1()
    dump = {}
    expected = {"name": None}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)


@mock.patch(
    (
        "inspirehep.records.marshmallow.literature.common.accelerator_experiment"
        ".InspireRecord.get_linked_records_in_field"
    )
)
def test_returns_dashed_institution_accelerator_experiment_as_name_with_unicode(
    mock_get_linked_records_in_field
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "PSI, Villigen"}],
        "accelerator": {"value": "PSI πM1 beam line"},
        "experiment": {"value": "MUSE"},
    }
    expected = {"name": "PSI, Villigen-PSI πM1 beam line-MUSE"}

    result = schema.dumps(dump).data

    assert expected == json.loads(result)
