# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from helpers.providers.faker import faker

from inspirehep.records.api import ExperimentsRecord
from inspirehep.records.marshmallow.experiments import ExperimentsElasticSearchSchema


@mock.patch("inspirehep.records.api.experiments.ExperimentLiterature")
def test_experiment_serializer_should_serialize_whole_basic_record(
    mock_experiment_literature_table,
):
    schema = ExperimentsElasticSearchSchema()
    expected_result = {
        "$schema": "http://localhost:5000/schemas/records/experiments.json",
        "_collections": ["Experiments"],
        "project_type": ["experiment"],
    }

    experiment = faker.record("exp", data={"experiment": {}})
    result = schema.dump(experiment).data

    assert result == expected_result


@mock.patch("inspirehep.records.api.experiments.ExperimentLiterature")
def test_experiment_serializer_populates_experiment_suggest(
    mock_experiment_literature_table,
):
    schema = ExperimentsElasticSearchSchema()
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

    expected_experiment_suggest = [
        {"input": "ACC", "weight": 1},
        {"input": "COLLABORATION", "weight": 1},
        {"input": "EXP SHORT NAME", "weight": 1},
        {"input": "Experiment value", "weight": 1},
        {"input": "INST_VALUE", "weight": 1},
        {"input": "{Long Name}", "weight": 1},
        {"input": "NAME_V1", "weight": 1},
        {"input": "NAME_V2", "weight": 1},
        {"input": "NAME_V3", "weight": 1},
        {"input": "LEGACY-NAME", "weight": 5},
    ]
    experiment = ExperimentsRecord(faker.record("exp", data))
    result = schema.dump(experiment).data["experiment_suggest"]

    assert result == expected_experiment_suggest
