# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker

from inspirehep.records.api import ExperimentsRecord
from inspirehep.records.marshmallow.experiments import (
    ExperimentsMetadataRawFieldsSchemaV1,
)


def test_experiment_serializer_should_serialize_whole_basic_record():
    schema = ExperimentsMetadataRawFieldsSchemaV1()
    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/experiments.json",
        "_collections": ["Experiments"],
        "project_type": ["experiment"],
    }

    experiment = ExperimentsRecord(faker.record("exp", data={"experiment": {}}))
    result = schema.dump(experiment).data

    assert result == expected_result


def test_experiment_serializer_populates_experiment_suggest():
    schema = ExperimentsMetadataRawFieldsSchemaV1()
    data = {
        "accelerator": {"value": "ACC"},
        "collaboration": {"curated_relation": False, "value": "COLLABORATION"},
        "experiment": {"short_name": "EXP SHORT NAME", "value": "Experiment value"},
        "institutions": [
            {
                "record": {
                    "$ref": "http://labs.inspirehep.net/api/institutions/902725"
                },
                "value": "INST_VALUE",
                "curated_relation": True,
            }
        ],
        "legacy_name": "LEGACY-NAME",
        "long_name": "{Long Name}",
        "name_variants": ["NAME_V1", "NAME_V2", "NAME_V3"],
    }

    expected_experiment_suggest = {
        "input": [
            "ACC",
            "COLLABORATION",
            "EXP SHORT NAME",
            "Experiment value",
            "INST_VALUE",
            "LEGACY-NAME",
            "{Long Name}",
            "NAME_V1",
            "NAME_V2",
            "NAME_V3",
        ]
    }
    experiment = ExperimentsRecord(faker.record("exp", data))
    result = schema.dump(experiment).data["experiment_suggest"]

    assert result == expected_experiment_suggest


def test_experiment_suggest_have_proper_data():
    data = {
        "$schema": "http://foo/experiments.json",
        "self": {"$ref": "https://localhost:5000/api/experiments/bar"},
        "legacy_name": "foo",
        "long_name": "foobarbaz",
        "name_variants": ["bar", "baz"],
        "collaboration": {"value": "D0"},
        "accelerator": {"value": "LHC"},
        "experiment": {"short_name": "SHINE", "value": "NA61"},
        "institutions": [{"value": "ICN"}],
    }
    record = ExperimentsRecord(faker.record("exp", data))
    marshmallow_schema = ExperimentsMetadataRawFieldsSchemaV1()
    result = marshmallow_schema.dump(record).data["experiment_suggest"]

    expected = {
        "input": ["LHC", "D0", "SHINE", "NA61", "ICN", "foo", "foobarbaz", "bar", "baz"]
    }

    assert expected == result
