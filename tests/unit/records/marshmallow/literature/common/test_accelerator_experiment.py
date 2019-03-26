# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import mock

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.marshmallow.literature.common import (
    AcceleratorExperimentSchemaV1,
)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_legacy_name_as_name(get_records_mock):
    schema = AcceleratorExperimentSchemaV1()
    dump = {"legacy_name": "Test"}

    record = LiteratureRecord(dump)

    expected = {"name": "Test"}
    result = schema.dumps(record).data

    assert expected == json.loads(result)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_dashed_institution_accelerator_experiment_as_name_if_all_present(
    get_records_mock
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "INS"}],
        "accelerator": {"value": "ACC"},
        "experiment": {"value": "EXP1"},
    }
    expected = {"name": "INS-ACC-EXP1"}

    record = LiteratureRecord(dump)
    result = schema.dumps(record).data

    assert expected == json.loads(result)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_legacy_name_as_name_if_accelerator_missing(get_records_mock):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "INS"}],
        "experiment": {"value": "EXP1"},
    }
    expected = {"name": "LEGACY-EXP1"}

    record = LiteratureRecord(dump)
    result = schema.dumps(record).data

    assert expected == json.loads(result)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_legacy_name_as_name_if_institutions_missing(get_records_mock):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "accelerator": {"value": "ACC"},
        "experiment": {"value": "EXP1"},
    }
    expected = {"name": "LEGACY-EXP1"}

    record = LiteratureRecord(dump)
    result = schema.dumps(record).data

    assert expected == json.loads(result)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_legacy_name_as_name_if_experiment_missing(get_records_mock):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "INS"}],
        "accelerator": {"value": "ACC"},
    }
    expected = {"name": "LEGACY-EXP1"}

    record = LiteratureRecord(dump)
    result = schema.dumps(record).data

    assert expected == json.loads(result)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_none_as_name_if_empty_present(get_records_mock):
    schema = AcceleratorExperimentSchemaV1()
    dump = {}
    expected = {"name": None}

    record = LiteratureRecord(dump)
    result = schema.dumps(record).data

    assert expected == json.loads(result)


@mock.patch("inspirehep.records.api.base.InspireRecord.get_records_by_pids")
def test_returns_dashed_institution_accelerator_experiment_as_name_with_unicode(
    get_records_mock
):
    schema = AcceleratorExperimentSchemaV1()
    dump = {
        "legacy_name": "LEGACY-EXP1",
        "institutions": [{"value": "PSI, Villigen"}],
        "accelerator": {"value": "PSI πM1 beam line"},
        "experiment": {"value": "MUSE"},
    }
    expected = {"name": "PSI, Villigen-PSI πM1 beam line-MUSE"}

    record = LiteratureRecord(dump)
    result = schema.dumps(record).data

    assert expected == json.loads(result)
